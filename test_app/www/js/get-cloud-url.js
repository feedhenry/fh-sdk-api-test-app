module.exports = {
  test: test
};

function test() {
  return getCloudUrl();
}

function getCloudUrl() {
  return new Promise(function(resolve, reject) {
    document.getElementById('get-cloud-url-status').innerHTML += 'testing... ';
    var cloudUrl = $fh.getCloudURL();
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4) {
        if (xmlHttp.status == 200) {
          document.getElementById('get-cloud-url-status').innerHTML += 'OK';
        } else {
          document.getElementById('get-cloud-url-status').innerHTML += 'ERROR';
        }
        resolve();
      }
    }
    xmlHttp.open("GET", cloudUrl, true);
    xmlHttp.send(null);
  });
}
