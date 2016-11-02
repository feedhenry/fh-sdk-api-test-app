const auth = require('./auth');
const cloud = require('./cloud');

auth.test()
  .then(cloud.test)
  .then(finished)
  .catch(onError);

function finished() {
  document.getElementById('test-finished').innerHTML = 'FINISHED';
}

function onError() {
  document.getElementById('test-finished').innerHTML = 'ERROR';
}
