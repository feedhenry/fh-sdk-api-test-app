
describe('Cloud', function() {
  this.timeout(15000);

  it('should call cloud', function() {
    return new Promise(function(resolve, reject) {
      $fh.cloud(
        {
          path: 'hello',
          data: {
            hello: 'testvalue'
          }
        },
        function(res) {
          expect(res.msg).to.be('Hello testvalue');
          resolve();
        },
        function(code) {
          reject(code);
        }
      );
    });
  });

  it('should fail cloud call', function() {
    return new Promise(function(resolve, reject) {
      $fh.cloud(
        {
          path: 'nonsence'
        },
        function(res) {
          reject(res);
        },
        function() {
          resolve();
        }
      );
    });
  });

});
