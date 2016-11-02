const fh = require('fh-fhc');

module.exports = function(projectDetails) {
  return new Promise(function(resolve, reject) {
    fh.projects({_:['create', projectDetails.name, projectDetails.template]}, function(err, result) {
      if (err) {
        return reject(err);
      }

      resolve(result);
    });
  });
};
