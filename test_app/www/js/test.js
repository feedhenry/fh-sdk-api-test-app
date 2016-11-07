const auth = require('./auth');
const cloud = require('./cloud');
const getCloudUrl = require('./get-cloud-url');
const getFHParams = require('./get-fh-params');
const hash = require('./hash');
const sec = require('./sec');

auth.test()
  .then(cloud.test)
  .then(getCloudUrl.test)
  .then(getFHParams.test)
  .then(hash.test)
  .then(sec.test)
  .then(finished)
  .catch(onError);

function finished() {
  document.getElementById('test-finished').innerHTML = 'FINISHED';
}

function onError() {
  document.getElementById('test-finished').innerHTML = 'ERROR';
}
