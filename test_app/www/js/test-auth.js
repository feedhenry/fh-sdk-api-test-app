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
    return new Promise(function(resolve) {
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
        expect().fail(msg);
        resolve();
      });
    });
  });

  it('should fail authentication', function() {
    return new Promise(function(resolve) {
      $fh.auth({
        "policyId": testConfig.policyId,
        "clientToken": testConfig.clientToken,
        "endRedirectUrl": window.location.href,
        "params": {
          "userId": "nonsence",
          "password": "nonsence"
        }
      }, function(res) {
        expect().fail(res);
        resolve();
      }, function() {
        resolve();
      });
    });
  });

  it('should validate', function() {
    return new Promise(function(resolve) {
      $fh.auth.hasSession(function(err, exist) {
        if (err) {
          expect().fail(err);
          return resolve();
        }
        if (exist) {
          $fh.auth.verify(function(err, valid) {
            if (err) {
              expect().fail(err);
              return resolve();
            }
            if (valid) {
              resolve();
            } else {
              expect().fail('session is not valid');
              resolve();
            }
          });
        } else {
          expect().fail('user not authenticated');
          resolve();
        }
      });
    });
  });

  it('should log out', function() {
    return new Promise(function(resolve) {
      $fh.auth.clearSession(function(err) {
        if (err) {
          expect().fail(err);
          return resolve();
        }

        $fh.auth.hasSession(function(err, exist) {
          if (err) {
            expect().fail(err);
            return resolve();
          }
          if (exist) {
            expect().fail('session still valid');
            return resolve();
          }
          resolve();
        });
      });
    });
  });

});
