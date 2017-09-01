const fs = require('fs');
const childProcess = require('child_process');
const request = require('request');
const program = require('commander');
const Nightmare = require('nightmare');
const fhc = require('fhc-promise');
const path = require('path');
const fse = require('fs-extra');
const { promisify } = require('util');

const pkg = require('./package.json');
const git = require('./utils/git');
const async = require('./utils/async');

const nightmare = Nightmare({ show: false });
const execFile = promisify(childProcess.execFile);
const execFileAsync = childProcess.execFile;
const requestPromise = promisify(request);

let fh;
let project;
let cloudApp;
let clientApp;
let cordova;
let failures;
let policy;

const testAppFolder = path.resolve(__dirname, 'test_app');
const cordovaUrl = 'http://localhost:8000/browser/www/index.html';

program
  .version(pkg.version)
  .description(pkg.description)
  .option('-t, --host <address>', 'Host - required')
  .option('-u, --username <username>', 'Username - required')
  .option('-p, --password <password>', 'Password - required')
  .option('-e, --environment <environment>', 'Environment to be used for app deployment - required')
  .option('-f, --prefix <prefix>', 'Prefix for project')
  .parse(process.argv);

if (!program.host || !program.username || !program.password || !program.environment) {
  program.outputHelp();
  process.exit();
}

const prefix = program.prefix || 'sdk-test-';

run();

async function run() {
  try {
    console.log('Initialising fhc');
    fh = await fhc.init(program);
    console.log('Cleanup');
    await cleanup();
    console.log('Creating project');
    await createProject();
    console.log('Securing endpoints');
    await fh.secureEndpoints({ appGuid: cloudApp.guid, security: 'appapikey', env: program.environment });
    console.log('Deploying cloud app');
    await deployCloudApp();
    console.log('Updating connection');
    await updateConnection();
    console.log('Cloning client app');
    await git.clone(clientApp.internallyHostedRepoUrl, program.username, program.password, testAppFolder, 'master');
    console.log('Copying tests to client app');
    copyTestsToApp();
    console.log('Creating policy');
    await createPolicy();
    console.log('Creating test config');
    createTestConfig();
    console.log('Adding cordova platform');
    await execFile('cordova', ['platform', 'add', 'browser'], { cwd: testAppFolder });
    console.log('Starting cordova');
    cordova = execFileAsync('cordova', ['serve'], { cwd: testAppFolder });
    console.log('Starting tests');
    await checkResults();
    if (cordova) {
      cordova.kill('SIGINT');
    }
    console.log('Number of failures:', failures);
    await cleanup();
  } catch (error) {
    console.error(error);
  }
}

async function cleanup() {
  fse.removeSync(testAppFolder);

  const projects = await fh.projects.list();
  const projectsToDelete = projects.filter(project =>
    project.title.startsWith(prefix)
  );
  await async.sequence(projectsToDelete, proj => {
    console.log(`Deleting ${proj.title}`);
    return fh.projects.delete(proj.guid).catch(console.error);
  });

  const policies = await fh.admin.policies.list();
  const policiesToDelete = policies.list.filter(policy =>
    policy.policyId.startsWith(prefix)
  );
  await async.sequence(policiesToDelete, policy => {
    console.log(`Deleting ${policy.policyId}`);
    return fh.admin.policies.delete(policy.guid).catch(console.error);
  });
}

async function createProject() {
  project = await fh.projects.create({
    projectName: prefix + Date.now(),
    template: 'hello_world_project'
  });
  cloudApp = project.apps.find(app => app.type === 'cloud_nodejs');
  clientApp = project.apps.find(app => app.type === 'client_advanced_hybrid');
}

async function deployCloudApp() {
  await fh.app.stage({
    app: cloudApp.guid,
    env: program.environment,
    runtime: 'node4',
    gitRef: {
      type: 'branch',
      value: 'master'
    }
  });
}

async function updateConnection() {
  const connections = await fh.connections.list({ projectId: project.guid });
  await fh.connections.update({
    projectId: project.guid,
    connectionId: connections[0].guid,
    cloudAppId: cloudApp.guid,
    env: program.environment
  });
}

async function createPolicy() {
  policy = await fh.admin.policies.create({
    policyId: prefix + Date.now(),
    policyType: 'FEEDHENRY',
    config: {
      provider: 'FEEDHENRY'
    },
    checkUserExists: true,
    checkUserApproved: false
  });
}

function createTestConfig() {
  const testConf = {
    username: program.username,
    password: program.password,
    policyId: policy.policyId,
    clientToken: cloudApp.guid
  };
  fs.writeFileSync(path.resolve(testAppFolder, 'www/testconfig.json'), JSON.stringify(testConf, null, 2));
}

function copyTestToApp(testFile) {
  fse.copySync(path.resolve(__dirname, 'tests', testFile), path.resolve(__dirname, 'test_app/www/js', testFile));
}

function copyTestsToApp() {
  const testFiles = fs.readdirSync(path.resolve(__dirname, 'tests'));
  testFiles.forEach(testFile => copyTestToApp(testFile));
  fse.copySync(path.resolve(__dirname, 'utils/mocha-run.js'), path.resolve(__dirname, 'test_app/www/js/mocha-run.js'));
  fse.copySync(path.resolve(__dirname, 'utils/mocha-setup.js'), path.resolve(__dirname, 'test_app/www/js/mocha-setup.js'));
  fs.unlinkSync(path.resolve(__dirname, 'test_app/www/index.html'));
  fse.copySync(path.resolve(__dirname, 'fixtures/index.html'), path.resolve(__dirname, 'test_app/www/index.html'));
}

function checkResults() {
  console.log('Waiting for tests to start');
  return new Promise(resolve => setTimeout(resolve, 2000))
    .then(() => requestPromise(cordovaUrl))
    .then(getResults)
    .catch(checkResults);

  function getResults() {
    console.log('Waiting for tests to finish');
    return nightmare
      .goto(cordovaUrl)
      .wait('#test-finished .true')
      .wait('#mocha')
      .evaluate(getText, '#mocha')
      .then(text => {
        console.log(text);
      })
      .then(() => nightmare.evaluate(getText, '.failures em'))
      .then(text => {
        failures = parseInt(text);
      })
      .then(() => nightmare.evaluate(getText, '#report').end())
      .then(report => fs.writeFileSync(path.resolve(__dirname, 'report.xml'), report));
  }
}

function getText(selector) {
  return document.querySelector(selector).innerText;
}
