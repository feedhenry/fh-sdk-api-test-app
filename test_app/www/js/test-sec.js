
describe('Sec', function() {

  it('should crypt', function() {
    var allOk = true;

    testKeySize('128');
    testKeySize('256');

    if (!allOk) {
      expect().fail();
    }

    function testKeySize(keySize) {
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
        secretkey = res.secretkey;
        iv = res.iv;
      }, function() {
        allOk = false;
      });
      if (!allOk) {
        return;
      }

      options = {
        "act": "encrypt",
        "params": {
          "plaintext": "Need a new page to start on",
          "key": secretkey,
          "algorithm": "AES",
          "iv": iv
        }
      };
      $fh.sec(options, function(res) {
        ciphertext = res.ciphertext;
      }, function() {
        allOk = false;
      });
      if (!allOk) {
        return;
      }

      options = {
        "act": "decrypt",
        "params": {
          "ciphertext": ciphertext,
          "key": secretkey,
          "algorithm": "AES",
          "iv": iv
        }
      };
      $fh.sec(options, function(res) {
        if (res.plaintext !== 'Need a new page to start on') {
          allOk = false;
        }
      }, function() {
        allOk = false;
      });
    }
  });
});
