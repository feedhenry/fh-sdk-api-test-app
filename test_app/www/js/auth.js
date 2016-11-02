module.exports = {
  test: test
};

function test() {
  return loadConfig()
    .then(auth)
    .then(authFail)
    .then(authValidate)
    .then(authLogOut);
}

var testConfig;

function loadConfig() {
  return new Promise(function(resolve, reject) {
    $.getJSON("testconfig.json", function(json) {
      testConfig = json;
      resolve();
    });
  });
}

function auth() {
  return new Promise(function(resolve, reject) {
    document.getElementById('auth-status').innerHTML += 'testing... ';
    $fh.auth({
      "policyId": testConfig.policyId,
      "clientToken": testConfig.clientToken,
      "endRedirectUrl": window.location.href,
      "params": {
        "userId": testConfig.username,
        "password": testConfig.password
      }
    }, function (res) {
      document.getElementById('auth-status').innerHTML += 'OK';
      resolve();
    }, function (msg, err) {
      document.getElementById('auth-status').innerHTML += msg + ' ERROR';
      resolve();
    });
  });
}

function authFail() {
  return new Promise(function(resolve, reject) {
    document.getElementById('auth-fail-status').innerHTML += "testing... ";
    $fh.auth({
      "policyId": testConfig.policyId,
      "clientToken": testConfig.clientToken,
      "endRedirectUrl": window.location.href,
      "params": {
        "userId": "nonsence",
        "password": "nonsence"
      }
    }, function (res) {
      document.getElementById('auth-fail-status').innerHTML += 'ERROR';
      resolve();
    }, function (msg, err) {
      document.getElementById('auth-fail-status').innerHTML += 'OK';
      resolve();
    });
  });
}

function authValidate() {
  return new Promise(function(resolve, reject) {
    document.getElementById('auth-valid-status').innerHTML += "testing... ";
    $fh.auth.hasSession(function(err, exist){
      if (err) {
        document.getElementById('auth-valid-status').innerHTML += 'failed to check session ERROR';
        return resolve();
      }
      if (exist) {
        document.getElementById('auth-valid-status').innerHTML += 'user authenticated... ';
        $fh.auth.verify(function(err, valid){
          if(err){
            document.getElementById('auth-valid-status').innerHTML += 'failed to verify session ERROR';
            return resolve();
          }
          if (valid) {
            document.getElementById('auth-valid-status').innerHTML += 'OK';
            resolve();
          } else {
            document.getElementById('auth-valid-status').innerHTML += 'session is not valid ERROR';
            resolve();
          }
        });
      } else {
        document.getElementById('auth-valid-status').innerHTML += 'user not authenticated ERROR';
        resolve();
      }
    });
  });
}

function authLogOut() {
  document.getElementById('auth-log-out').innerHTML += "testing... ";
  return new Promise(function(resolve, reject) {
    $fh.auth.clearSession(function(err){
      $fh.auth.hasSession(function(err, exist){
        if (err) {
          document.getElementById('auth-log-out').innerHTML += "failed to check session ERROR";
          return resolve();
        }
        if (exist) {
          document.getElementById('auth-log-out').innerHTML += "session still valid ERROR";
          return resolve();
        }
        document.getElementById('auth-log-out').innerHTML += "OK";
        resolve();
      });
    });
  });
}
