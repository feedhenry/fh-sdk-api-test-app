const fh = require('fh-fhc');

module.exports = function(policyDetails) {
  return new Promise(function(resolve, reject) {
    fh['admin-policies']({_:['delete', policyDetails.guid]}, function(err) {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
};
