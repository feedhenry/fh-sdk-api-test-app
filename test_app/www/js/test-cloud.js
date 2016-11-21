
describe('Cloud', function() {
  this.timeout(15000);

  it('should call cloud', function() {
    return new Promise(function(resolve) {
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
          expect().fail(code);
          resolve();
        }
      );
    });
  });

  it('should fail cloud call', function() {
    return new Promise(function(resolve) {
      $fh.cloud(
        {
          path: 'nonsence'
        },
        function(res) {
          expect().fail(res);
          resolve();
        },
        function() {
          resolve();
        }
      );
    });
  });

});
