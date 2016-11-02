const fh = require('fh-fhc');

module.exports = function(details) {
  return new Promise(function(resolve, reject) {
    fh.app.stage({app: details.appGuid, env: details.env}, function(error, startRes) {
      if (error) {
        return reject(error);
      }

      resolve(startRes);
    });
  });
};
