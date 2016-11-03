const auth = require('./auth');
const cloud = require('./cloud');
const getCloudUrl = require('./get-cloud-url');

auth.test()
  .then(cloud.test)
  .then(getCloudUrl.test)
  .then(finished)
  .catch(onError);

function finished() {
  document.getElementById('test-finished').innerHTML = 'FINISHED';
}

function onError() {
  document.getElementById('test-finished').innerHTML = 'ERROR';
}
