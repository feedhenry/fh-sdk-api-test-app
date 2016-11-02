#!/usr/bin/env node

const _ = require('underscore');
const fs = require('fs');
const execFile = require('child_process').execFile;
const request = require('request');
const webdriverio = require('webdriverio');
const program = require('commander');
const pkg = require('./package.json');

const fhcInit = require('./lib/fhc-init');
const fhcCreateProject = require('./lib/fhc-create-project');
const fhcDeleteProject = require('./lib/fhc-delete-project');
const fhcCreatePolicy = require('./lib/fhc-create-policy');
const fhcDeletePolicy = require('./lib/fhc-delete-policy');
const fhcAppDeploy = require('./lib/fhc-app-deploy');

const testAppFolder = __dirname + '/test_app/';
const cordovaUrl = 'http://localhost:8000/browser/www/index.html';

const projectName = 'api-test-project';
const policyName = 'api-test-policy';

var project;
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
  .option('-f, --exit-fail', 'When test fails exit with code 1')
  .parse(process.argv);

if (!program.host || !program.username || !program.password || !program.environment) {
  program.outputHelp();
  process.exit();
}

prepareEnvironment()
  .then(runCordova)
  .then(checkResults)
  .then(stopCordova)
  .then(cleanEnvironment)
  .then(() => {
    if (success) {
      console.log('TEST SUCCESS');
    } else {
      console.log('TEST FAILURE');
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error(err);
  });

function prepareEnvironment() {
  return fhcInit(program)
    .then(prepareProject)
    .then(deployCloudApp)
    .then(preparePolicy)
    .then(setFhconfig)
    .then(setTestConfig);
}

function deployCloudApp() {
  var app = _.find(project.apps, (app) => {
    return app.type === 'cloud_nodejs';
  });

  return fhcAppDeploy({
    appGuid: app.guid,
    env: program.environment
  });
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
  return new Promise(function(resolve, reject) {
    cordova = execFile('cordova', ['serve'], { cwd: testAppFolder });
    resolve();
  });
}

function stopCordova() {
  cordova.kill('SIGINT');
}

function checkResults() {
  return httpRequest(cordovaUrl)
    .then(getResults)
    .catch((error) => { return checkResults(); });

  function getResults() {
    var options = {
      desiredCapabilities: {
        browserName: 'chrome'
      }
    };
    return new Promise(function(resolve, reject) {
      webdriverio
        .remote(options)
        .init()
        .url(cordovaUrl)
        .waitForVisible('#test-finished', 20000)
        .waitForText('#test-finished')
        .getText('body')
        .then((text) => {
          console.log(text);
          var lines = text.split('\n');
          success = true;
          lines.forEach((line) => {
            if (line.endsWith('ERROR')) {
              success = false;
            }
          });
        })
        .end()
        .call(() => {
          resolve(success);
        });
    });
  }
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
  }
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
  var app = _.find(project.apps, (app) => {
    return app.type === 'client_advanced_hybrid';
  });
  var testConf = {
    username: program.username,
    password: program.password,
    policyId: policyName,
    clientToken: app.guid
  }
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

function savePolicy(policyDetails) {
  policy = policyDetails;
}

function httpRequest(url) {
  return new Promise(function(resolve, reject) {
    request(url, function (error, response, body) {
      if (error) {
        return reject(error);
      }
      resolve(body);
    });
  });
}
