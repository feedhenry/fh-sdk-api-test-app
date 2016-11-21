
const datasetId = 'test';
const testData = { test: 'text' };
const updateData = { test: 'something else' };
var dataId;

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
        expect(res).to.eql({});
        resolve();
      }, function(code, msg) {
        reject(code + ': ' + msg);
      });
    });
  });

  it('should create', function() {
    return new Promise(function(resolve, reject) {
      $fh.sync.doCreate(datasetId, testData, function(res) {
        dataId = res.uid;
        resolve();
      }, function(code, msg) {
        reject(code + ': ' + msg);
      });
    });
  });

  it('should read', function() {
    return new Promise(function(resolve, reject) {
      $fh.sync.doRead(datasetId, dataId, function(data) {
        expect(data.data).to.eql(testData);
        resolve();
      }, function(code, msg) {
        reject(code + ': ' + msg);
      });
    });
  });

  it('should fail reading unknown uid', function() {
    return new Promise(function(resolve, reject) {
      $fh.sync.doRead(datasetId, 'nonsence', function(data) {
        reject(data);
      }, function(code) {
        expect(code).to.be('unknown_uid');
        resolve();
      });
    });
  });

  it('should update', function() {
    return new Promise(function(resolve, reject) {
      $fh.sync.doUpdate(datasetId, dataId, updateData, function() {
        $fh.sync.doRead(datasetId, dataId, function(data) {
          expect(data.data).to.eql(updateData);
          resolve();
        }, function(code, msg) {
          reject(code + ': ' + msg);
        });
      }, function(code, msg) {
        reject(code + ': ' + msg);
      });
    });
  });

  it('should delete', function() {
    return new Promise(function(resolve, reject) {
      $fh.sync.doDelete(datasetId, dataId, function() {
        $fh.sync.doList(datasetId, function(res) {
          expect(res).to.eql({});
          resolve();
        }, function(code, msg) {
          reject(code + ': ' + msg);
        });
      }, function(code, msg) {
        reject(code + ': ' + msg);
      });
    });
  });

});
