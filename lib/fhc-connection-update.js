const fh = require('fh-fhc');

module.exports = function fhcUpdateConnection(params) {
  return new Promise(function(resolve, reject) {
    fh.connections({_: ['update', params.projectId, params.connectionId,
      params.cloudAppId, '--env=' + params.env]}, function(error, updateRes) {
      if (error) {
        return reject(error);
      }

      resolve(updateRes);
    });
  });
};
