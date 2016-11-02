const fh = require('fh-fhc');

module.exports = function(policyDetails) {
  return new Promise(function(resolve, reject) {
    fh['admin-policies']({_: ['create', policyDetails.policyId,
      policyDetails.policyType, policyDetails.configurations,
      policyDetails.checkUserExists,
      policyDetails.checkUserApproved]}, function(error, policy) {
      if (error) {
        return reject(error);
      }
      
      resolve(policy);
    });
  });
};
