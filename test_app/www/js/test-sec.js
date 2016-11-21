
describe('Sec', function() {

  it('should crypt', function() {
    testKeySize('128');
    testKeySize('256');
  });

});

function testKeySize(keySize) {
  var secretkey;
  var iv;
  var ciphertext;
  var ok = true;

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
  }, function(code) {
    expect().fail(code);
    ok = false;
  });
  if (!ok) {
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
  }, function(code) {
    expect().fail(code);
    ok = false;
  });
  if (!ok) {
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
    expect(res.plaintext).to.be('Need a new page to start on');
  }, function(code) {
    expect().fail(code);
  });
}