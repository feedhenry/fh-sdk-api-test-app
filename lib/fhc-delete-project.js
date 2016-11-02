const fh = require('fh-fhc');

module.exports = function(projectDetails) {
  return new Promise(function(resolve, reject) {
    fh.projects({_:['delete', projectDetails.guid]}, function(err) {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
};
