const fh = require('fh-fhc');

module.exports = function(details) {
  return new Promise(function(resolve, reject) {
    fh.secureendpoints({_: ['set-default', details.appGuid, details.security], env: details.env}, function(error, res) {
      if (error) {
        return reject(error);
      }

      resolve(res);
    });
  });
};
