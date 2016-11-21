
const hashResult = {
  'MD5': '6382ccd27fba56338a68c3a443a20c23',
  'SHA1': '42aa1ba7a0a6a825c977f6db6650a62bed0aa218',
  'SHA256': '45f5259ed08e9ded31e05666385ee3a44f6d8f571372cb23a7aff699ed780769',
  'SHA512': '97f6c8e33f2571d300e86d702b302bf9fdd424ac19a2474c23f35f278fb50bfed909f00f2b4e0860450f8bb377e2bea8fe999221d422a939f158c3f8434b1638'
};

describe('Hash', function() {

  it('should hash', function() {
    var allOk = true;
    testAlgorithm('MD5');
    testAlgorithm('SHA1');
    testAlgorithm('SHA256');
    testAlgorithm('SHA512');

    if (!allOk) {
      expect().fail();
    }

    function testAlgorithm(alg) {
      var options = {
        algorithm: alg,
        text: 'Text to hash.'
      };
      $fh.hash(options, function(res) {
        if (res.hashvalue !== hashResult[alg]) {
          allOk = false;
        }
      }, function() {
        allOk = false;
      });
    }
  });
});
