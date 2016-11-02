const fh = require('fh-fhc');

module.exports = function fhcInit(config) {
  var cfg = {
    loglevel: 'error',
    json: true,
    feedhenry: config.host,
    user: config.username,
    inmemoryconfig: true
  };

  return new Promise(function(resolve, reject) {
    fh.load(cfg, function(err) {
      if (err) {
        return reject(err);
      }
      fh.target({_:[config.host]}, function(err) {
        if (err) {
          return reject(err);
        }
        fh.login({_:[config.username, config.password]}, function(err) {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    });
  });
};
