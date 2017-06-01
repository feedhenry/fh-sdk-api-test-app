var testConfig;

describe('Auth', function() {
  this.timeout(15000);

  before(function() {
    return new Promise(function(resolve) {
      $.getJSON("testconfig.json", function(json) {
        testConfig = json;
        resolve();
      });
    });
  });

  it('should authenticate', function() {
    return new Promise(function(resolve, reject) {
      $fh.auth({
        "policyId": testConfig.policyId,
        "clientToken": testConfig.clientToken,
        "endRedirectUrl": window.location.href,
        "params": {
          "userId": testConfig.username,
          "password": testConfig.password
        }
      }, function() {
        resolve();
      }, function(msg) {
        reject(msg);
      });
    });
  });

  it('should fail authentication', function() {
    return new Promise(function(resolve, reject) {
      $fh.auth({
        "policyId": testConfig.policyId,
        "clientToken": testConfig.clientToken,
        "endRedirectUrl": window.location.href,
        "params": {
          "userId": "nonsence",
          "password": "nonsence"
        }
      }, function(res) {
        reject(res);
      }, function() {
        resolve();
      });
    });
  });

  it('should validate', function() {
    return new Promise(function(resolve, reject) {
      $fh.auth.hasSession(function(err, exist) {
        if (err) {
          reject(err);
        }
        if (exist) {
          $fh.auth.verify(function(err, valid) {
            if (err) {
              reject(err);
            }
            expect(valid).to.be.ok();
            resolve();
          });
        } else {
          reject('user not authenticated');
        }
      });
    });
  });

  it('should log out', function() {
    return new Promise(function(resolve, reject) {
      $fh.auth.clearSession(function(err) {
        if (err) {
          reject(err);
        }

        $fh.auth.hasSession(function(err, exist) {
          if (err) {
            reject(err);
          }
          expect(exist).not.to.be.ok();
          resolve();
        });
      });
    });
  });

});
