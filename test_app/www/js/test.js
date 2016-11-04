const auth = require('./auth');
const cloud = require('./cloud');
const getCloudUrl = require('./get-cloud-url');
const getFHParams = require('./get-fh-params');
const hash = require('./hash');

auth.test()
  .then(cloud.test)
  .then(getCloudUrl.test)
  .then(getFHParams.test)
  .then(hash.test)
  .then(finished)
  .catch(onError);

function finished() {
  document.getElementById('test-finished').innerHTML = 'FINISHED';
}

function onError() {
  document.getElementById('test-finished').innerHTML = 'ERROR';
}
