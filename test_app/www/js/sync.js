/*global $fh*/

module.exports = {
  test: test
};

const datasetId = 'test';

function test() {
  return syncInit()
    .then(syncManage)
    .then(syncNotify)
    .then(syncDoList);
}

function syncInit() {
  return new Promise(function(resolve) {
    document.getElementById('sync-init-status').innerHTML += 'testing... ';
    $fh.sync.init({ sync_frequency: 1, storage_strategy: 'dom' });
    document.getElementById('sync-init-status').innerHTML += 'OK';
    resolve();
  });
}

function syncNotify() {
  var received = {
    sync_started: false,
    delta_received: false,
    sync_complete: false
  };
  var receivedNum = 0;

  return new Promise(function(resolve) {
    document.getElementById('sync-notify-status').innerHTML += 'testing... ';
    $fh.sync.notify(function(event) {
      receivedNum += 1;

      received[event.code] = true;

      if (receivedNum <= 3) {
        document.getElementById('sync-notify-status').innerHTML += event.code + ' ';

        if (receivedNum === 3) {
          if (received.sync_started && received.delta_received && received.sync_complete) {
            document.getElementById('sync-notify-status').innerHTML += 'OK';
          } else {
            document.getElementById('sync-notify-status').innerHTML += 'ERROR';
          }
          resolve();
        }
      }
    });
  });
}

function syncManage() {
  return new Promise(function(resolve) {
    document.getElementById('sync-manage-status').innerHTML += 'testing... ';
    $fh.sync.manage(datasetId);
    document.getElementById('sync-manage-status').innerHTML += 'OK';
    resolve();
  });
}

function syncDoList() {
  return new Promise(function(resolve) {
    document.getElementById('sync-do-list-status').innerHTML += 'testing... ';
    $fh.sync.doList(datasetId, function(res) {
      document.getElementById('sync-do-list-status').innerHTML += JSON.stringify(res) + ' OK';
      resolve();
    }, function(code, msg) {
      document.getElementById('sync-do-list-status').innerHTML += code + ' ' + msg + ' ERROR';
      resolve();
    });
  });
}

function syncDoCreate() {
  return new Promise(function(resolve) {
    document.getElementById('sync-do-list-status').innerHTML += 'testing... ';
    $fh.sync.doList(datasetId, function(res) {
      document.getElementById('sync-do-list-status').innerHTML += JSON.stringify(res) + ' OK';
      resolve();
    }, function(code, msg) {
      document.getElementById('sync-do-list-status').innerHTML += code + ' ' + msg + ' ERROR';
      resolve();
    });
  });
}
