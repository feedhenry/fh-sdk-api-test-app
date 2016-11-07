module.exports = {
  test: test
};

function test() {
  return getFHParams()
    .then(getFHParamsFail);
}

function getFHParams() {
  return new Promise(function(resolve, reject) {
    document.getElementById('get-fh-params-status').innerHTML += 'testing... ';
    var cloudUrl = $fh.getCloudURL();
    var fhParams = $fh.getFHParams();
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4) {
        if (xmlHttp.status == 200) {
          document.getElementById('get-fh-params-status').innerHTML += 'OK';
        } else {
          document.getElementById('get-fh-params-status').innerHTML += 'ERROR';
        }
        resolve();
      }
    }
    xmlHttp.open("POST", cloudUrl + '/hello', true);
    xmlHttp.send({ __fh: fhParams });
  });
}

// NOTE: this test fails because of https://issues.jboss.org/browse/RHMAP-11212
function getFHParamsFail() {
  return new Promise(function(resolve, reject) {
    document.getElementById('get-fh-params-fail-status').innerHTML += 'testing... ';
    var cloudUrl = $fh.getCloudURL();
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4) {
        if (xmlHttp.status == 401) {
          document.getElementById('get-fh-params-fail-status').innerHTML += 'OK';
        } else {
          document.getElementById('get-fh-params-fail-status').innerHTML += 'ERROR';
        }
        resolve();
      }
    }
    xmlHttp.open("GET", cloudUrl + '/hello', true);
    xmlHttp.send(null);
  });
}
