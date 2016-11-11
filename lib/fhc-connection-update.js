const fh = require('fh-fhc');

module.exports = function fhcUpdateConnection(params) {
  console.log(params);
  return new Promise(function(resolve, reject) {
    fh.connections({_: ['update', params.projectId, params.connectionId,
      params.cloudAppId, '--env=' + params.env]}, function(error, updateRes) {
      console.log('conn update: ' + error);
      if (error) {
        return reject(err);
      }

      resolve(updateRes);
    });
  });
};
