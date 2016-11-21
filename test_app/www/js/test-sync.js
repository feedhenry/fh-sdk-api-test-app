
const datasetId = 'test';

describe('Sync', function() {
  this.timeout(15000);

  it('should init sync', function() {
    $fh.sync.init({ sync_frequency: 1, storage_strategy: 'dom' });
  });

  it('should manage dataset', function() {
    $fh.sync.manage(datasetId);
  });

  it('should notify', function() {
    var received = {
      sync_started: false,
      delta_received: false,
      sync_complete: false
    };
    var receivedNum = 0;

    return new Promise(function(resolve) {
      $fh.sync.notify(function(event) {
        receivedNum += 1;
        received[event.code] = true;

        if (receivedNum === 3) {
          expect(received.sync_started).to.be.ok();
          expect(received.delta_received).to.be.ok();
          expect(received.sync_complete).to.be.ok();
          resolve();
        }
      });
    });
  });

  it('should list', function() {
    return new Promise(function(resolve, reject) {
      $fh.sync.doList(datasetId, function(res) {
        console.log(res);
        resolve();
      }, function(code, msg) {
        reject(code + ': ' + msg);
      });
    });
  });

});
