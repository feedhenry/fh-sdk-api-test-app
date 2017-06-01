
describe('Get Cloud Url', function() {
  this.timeout(15000);

  it('should get cloud url', function() {
    return new Promise(function(resolve) {
      var cloudUrl = $fh.getCloudURL();
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4) {
          expect(xmlHttp.status).to.be(200);
          resolve();
        }
      };
      xmlHttp.open("GET", cloudUrl, true);
      xmlHttp.send(null);
    });
  });

});
