module.exports = {
  test: test
};

function test() {
  return sec();
}

function sec() {
  return new Promise(function(resolve, reject) {
    document.getElementById('sec-status').innerHTML += 'testing... ';
    var allOk = true;

    testKeySize('128');
    testKeySize('256');

    if (allOk) {
      document.getElementById('sec-status').innerHTML += 'OK';
    } else {
      document.getElementById('sec-status').innerHTML += 'ERROR';
    }
    resolve();

    function testKeySize(keySize) {
      var algorithm;
      var secretkey;
      var iv;
      var ciphertext;

      var options = {
        "act": "keygen",
        "params": {
          "algorithm": "AES",
          "keysize": keySize
        }
      };
      $fh.sec(options, function(res) {
        algorithm = res.algorithm;
        secretkey = res.secretkey;
        iv = res.iv;
      }, function(code) {
        allOk = false;
        document.getElementById('sec-status').innerHTML += code + '-error ';
      });
      if (!allOk) {
        return;
      }

      var options = {
        "act": "encrypt",
        "params": {
          "plaintext": "Need a new page to start on",
          "key": secretkey,
          "algorithm": "AES",
          "iv": iv
        }
      };
      $fh.sec(options, function (res) {
        ciphertext = res.ciphertext;
      }, function (code) {
        allOk = false;
        document.getElementById('sec-status').innerHTML += code + '-error ';
      });
      if (!allOk) {
        return;
      }

      var options = {
        "act": "decrypt",
        "params": {
          "ciphertext": ciphertext,
          "key": secretkey,
          "algorithm": "AES",
          "iv": iv
        }
      };
      $fh.sec(options, function (res) {
        if (res.plaintext === 'Need a new page to start on') {
          document.getElementById('sec-status').innerHTML += keySize + '-ok ';
        } else {
          allOk = false;
          document.getElementById('sec-status').innerHTML += keySize + '-error ';
        }
      }, function (code) {
        allOk = false;
        document.getElementById('sec-status').innerHTML += code + '-error ';
      });
    }
  });
}
