#!/usr/bin/env node

const _ = require('underscore');
const fs = require('fs');
const execFile = require('child_process').execFile;
const request = require('request');
const webdriverio = require('webdriverio');
const program = require('commander');
const unzipper = require('unzipper');
const GitHubApi = require("github");
const pkg = require('./package.json');

const fhcInit = require('./lib/fhc-init');
const fhcCreateProject = require('./lib/fhc-create-project');
const fhcDeleteProject = require('./lib/fhc-delete-project');
const fhcCreatePolicy = require('./lib/fhc-create-policy');
const fhcDeletePolicy = require('./lib/fhc-delete-policy');
const fhcSecureEndpoints = require('./lib/fhc-secure-endpoints');
const fhcAppImport = require('./lib/fhc-app-import');
const fhcConnectionUpdate = require('./lib/fhc-connection-update');
const fhcListConnections = require('./lib/fhc-connections-list');
const fhcDeployApp = require('./lib/fhc-app-deploy');

const testAppFolder = __dirname + '/test_app/';
const cordovaUrl = 'http://localhost:8000/browser/www/index.html';

const projectName = 'api-test-project';
const policyName = 'api-test-policy';
const cloudAppName = 'api-test-cloud-app';

var project;
var cloudApp;
var policy;
var cordova;
var success;

program
  .version(pkg.version)
  .description(pkg.description)
  .option('-h, --host <address>', 'Host - required')
  .option('-u, --username <username>', 'Username - required')
  .option('-p, --password <password>', 'Password - required')
  .option('-e, --environment <environment>', 'Environment to be used for app deployment - required')
  .option('-s, --sdkversion <tag>', 'SDK version (e.g. 2.17.5 or latest) - required')
  .parse(process.argv);

if (!program.host || !program.username || !program.password || !program.environment) {
  program.outputHelp();
  process.exit();
}

prepareEnvironment()
  .then(runCordova)
  .then(checkResults)
  .catch((err) => {
    console.error(err);
  })
  .then(stopCordova)
  .then(cleanEnvironment)
  .then(() => {
    if (success) {
      console.log('TEST SUCCESS');
    } else {
      console.log('TEST FAILURE');
    }
  })
  .catch((err) => {
    console.error(err);
  });

function prepareEnvironment() {
  return fhcInit(program)
    .then(importSdk)
    .then(prepareProject)
    .then(importTestCloudApp)
    .then(prepareConnection)
    .then(secureEndpoints)
    .then(deployCloudApp)
    .then(preparePolicy)
    .then(setFhconfig)
    .then(setTestConfig);
}

function importSdk() {
  var github = new GitHubApi({
    protocol: 'https',
    host: 'api.github.com',
    headers: {
      'User-Agent': "fh-sdk-api-test-app"
    },
    followRedirects: false,
    timeout: 5000
  });

  return new Promise((resolve, reject) => {
    if (program.sdkversion === 'local') {
      return resolve();
    } else if (program.sdkversion === 'latest') {
      github.repos.getLatestRelease({ owner: 'feedhenry', repo: 'fh-js-sdk' }, downloadRelease);
    } else {
      github.repos.getReleaseByTag({ owner: 'feedhenry', repo: 'fh-js-sdk', tag: program.sdkversion }, downloadRelease);
    }

    function downloadRelease(err, res) {
      if (err) {
        return reject(err);
      }
      if (!res) {
        return reject('can not get release');
      }

      request({
        url: res.assets[0].url,
        headers: {
          Accept: 'application/octet-stream',
          'User-Agent': 'fh-sdk-api-test-app'
        }
      })
      .pipe(unzipper.Parse())
      .on('entry', (entry) => {
        if (entry.path.endsWith('feedhenry.js')) {
          entry.pipe(fs.createWriteStream(testAppFolder + 'www/feedhenry.js'));
        } else {
          entry.autodrain();
        }
      })
      .on('finish', () => {
        resolve();
      });
    }
  });
}

function deployCloudApp() {
  return fhcDeployApp({
    appGuid: cloudApp.guid,
    env: program.environment
  });
}

function prepareConnection() {
  return fhcListConnections({ projectId: project.guid })
    .then(connections => {
      return connections[0];
    })
    .then(updateConnection);
}

function updateConnection(conn) {
  return fhcConnectionUpdate({
    projectId: project.guid,
    connectionId: conn.guid,
    cloudAppId: cloudApp.guid,
    env: program.environment
  });
}

function secureEndpoints() {
  return fhcSecureEndpoints({
    appGuid: cloudApp.guid,
    security: 'appapikey',
    env: program.environment
  });
}

function importTestCloudApp() {
  return fhcAppImport({
    projectId: project.guid,
    title: cloudAppName,
    type: 'cloud_nodejs',
    source: './fixtures/cloud-app.zip',
    env: program.environment
  }).then(saveCloudApp);
}

function prepareProject() {
  return fhcCreateProject({
    name: projectName,
    template: 'hello_world_project'
  }).then(saveProject);
}

function preparePolicy() {
  return fhcCreatePolicy({
    checkUserApproved: false,
    checkUserExists: true,
    configurations: {
      provider: "FEEDHENRY"
    },
    policyId: policyName,
    policyType: "FEEDHENRY"
  }).then(savePolicy);
}

function cleanEnvironment() {
  return fhcDeleteProject({ guid: project.guid })
    .then(forwardPolicyGuid)
    .then(fhcDeletePolicy);
}

function runCordova() {
  return new Promise(function(resolve) {
    cordova = execFile('cordova', ['serve'], { cwd: testAppFolder });
    resolve();
  });
}

function stopCordova() {
  if (cordova) {
    cordova.kill('SIGINT');
  }
}

function checkResults() {
  return httpRequest(cordovaUrl)
    .then(getResults)
    .catch(() => {
      return checkResults();
    });

  function getResults() {
    var options = {
      desiredCapabilities: {
        browserName: 'chrome'
      }
    };
    return new Promise(function(resolve) {
      webdriverio
        .remote(options)
        .init()
        .url(cordovaUrl)
        .waitForVisible('#test-finished', 20000)
        .waitForText('#test-finished')
        .getText('#mocha')
        .then((text) => {
          console.log(text);
        })
        .getText('.failures em')
        .then((text) => {
          success = (text === '0');
        })
        .getText('#report')
        .then(saveReport)
        .end()
        .call(() => {
          resolve(success);
        });
    });
  }
}

function saveReport(text) {
  return new Promise((resolve, reject) => {
    fs.writeFile(__dirname + '/report.xml', text, (err) => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}

function setFhconfig() {
  var app = _.find(project.apps, (app) => {
    return app.type === 'client_advanced_hybrid';
  });
  var fhConf = {
    appid: app.guid,
    appkey: app.apiKey,
    apptitle: app.title,
    connectiontag: '0.0.1',
    host: program.host,
    projectid: project.guid,
  };
  return new Promise(function(resolve, reject) {
    fs.writeFile(testAppFolder + 'www/fhconfig.json', JSON.stringify(fhConf, null, 2), (err) => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}

function setTestConfig() {
  var testConf = {
    username: program.username,
    password: program.password,
    policyId: policyName,
    clientToken: cloudApp.guid
  };
  return new Promise(function(resolve, reject) {
    fs.writeFile(testAppFolder + 'www/testconfig.json', JSON.stringify(testConf, null, 2), (err) => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}

function forwardPolicyGuid() {
  return Promise.resolve({ guid: policy.guid });
}

function saveProject(projectDetails) {
  project = projectDetails;
}

function saveCloudApp(appDetails) {
  cloudApp = appDetails;
}

function savePolicy(policyDetails) {
  policy = policyDetails;
}

function httpRequest(url) {
  return new Promise(function(resolve, reject) {
    request(url, function(error, response, body) {
      if (error) {
        return reject(error);
      }
      resolve(body);
    });
  });
}
