
describe('Get FH Params', function() {
  this.timeout(15000);

  it('should get FH params and call cloud', function() {
    return new Promise(function(resolve) {
      var cloudUrl = $fh.getCloudURL();
      var fhParams = $fh.getFHParams();
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4) {
          expect(xmlHttp.status).to.be(200);
          resolve();
        }
      };
      xmlHttp.open("POST", cloudUrl + '/hello', true);
      for (var prop in fhParams) {
        if (fhParams.hasOwnProperty(prop)) {
          xmlHttp.setRequestHeader('X-FH-' + prop, fhParams[prop]);
        }
      }
      xmlHttp.send(null);
    });
  });

  it('should fail calling cloud without FH params', function() {
    return new Promise(function(resolve) {
      var cloudUrl = $fh.getCloudURL();
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4) {
          expect(xmlHttp.status).to.be(401);
          resolve();
        }
      };
      xmlHttp.open("GET", cloudUrl + '/hello', true);
      xmlHttp.send(null);
    });
  });
});
