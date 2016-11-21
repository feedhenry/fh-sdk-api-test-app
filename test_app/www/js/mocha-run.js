mocha.globals(['jQuery']);
var runner = mocha.run();
runner.on('end', function() {
  document.getElementById('test-finished').innerHTML += 'FINISHED';
});