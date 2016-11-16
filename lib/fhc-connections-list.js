const fh = require('fh-fhc');

module.exports = function fhcListConnections(params) {
  return new Promise(function(resolve, reject) {
    fh.connections({_: ['list', params.projectId]}, function(error, connections) {
      if (error) {
        return reject(error);
      }

      resolve(connections);
    });
  });
};
