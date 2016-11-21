
describe('Get FH Params', function() {
  this.timeout(15000);

  it('should get FH params', function() {
    return new Promise(function(resolve) {
      var cloudUrl = $fh.getCloudURL();
      var fhParams = $fh.getFHParams();
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4) {
          if (xmlHttp.status !== 200) {
            expect().fail(xmlHttp.status);
          }
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

  it('should fail get FH params', function() {
    return new Promise(function(resolve) {
      var cloudUrl = $fh.getCloudURL();
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4) {
          if (xmlHttp.status !== 401) {
            expect().fail(xmlHttp.status);
          }
          resolve();
        }
      };
      xmlHttp.open("GET", cloudUrl + '/hello', true);
      xmlHttp.send(null);
    });
  });
});
