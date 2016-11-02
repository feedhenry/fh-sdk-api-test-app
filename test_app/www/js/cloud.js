module.exports = {
  test: test
};

function test() {
  return cloud()
    .then(cloudFail);
}

function cloud() {
  return new Promise(function(resolve, reject) {
    document.getElementById('cloud-status').innerHTML += 'testing... ';
    $fh.cloud(
      {
        path: 'hello',
        data: {
          hello: 'testvalue'
        }
      },
      function (res) {
        if (res.msg === 'Hello testvalue') {
          document.getElementById('cloud-status').innerHTML += 'OK';
        } else {
          document.getElementById('cloud-status').innerHTML += 'wrong response ERROR';
        }
        resolve();
      },
      function (code, errorprops, params) {
        document.getElementById('cloud-status').innerHTML += code + ': ' + errorprops + ' ERROR';
        resolve();
      }
    );
  });
}

function cloudFail() {
  return new Promise(function(resolve, reject) {
    document.getElementById('cloud-fail-status').innerHTML += 'testing... ';
    $fh.cloud(
      {
        path: 'nonsence'
      },
      function (res) {
        document.getElementById('cloud-fail-status').innerHTML += 'ERROR';
        resolve();
      },
      function (code, errorprops, params) {
        document.getElementById('cloud-fail-status').innerHTML += 'OK';
        resolve();
      }
    );
  });
}
