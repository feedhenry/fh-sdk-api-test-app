
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
          if (res.msg !== 'Hello testvalue') {
            expect().fail('wrong response');
          }
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
