module.exports = {
  test: test
};

function test() {
  return syncInit()
    .then(syncNotify)
    .then(syncManage)
    .then(wait10sec);
}

function syncInit() {
  return new Promise(function(resolve, reject) {
    document.getElementById('sync-init-status').innerHTML += 'testing... ';
    $fh.sync.init({ sync_frequency: 1 });
    document.getElementById('sync-init-status').innerHTML += 'OK';
    resolve();
  });
}

function syncNotify() {
  return new Promise(function(resolve, reject) {
    document.getElementById('sync-notify-status').innerHTML += 'testing... ';
    $fh.sync.notify(notification);
    document.getElementById('sync-notify-status').innerHTML += 'OK';
    resolve();
  });
}

function syncManage() {
  return new Promise(function(resolve, reject) {
    document.getElementById('sync-manage-status').innerHTML += 'testing... ';
    $fh.sync.manage('test', {}, {}, {}, function() {
      document.getElementById('sync-manage-status').innerHTML += 'OK';
      resolve();
    });
  });
}

function wait10sec() {
  return new Promise(function(resolve, reject) {
    setTimeout(function () {
      resolve();
    }, 10000);
  });
}

function notification(event) {
  document.getElementById('sync-notifications').innerHTML += event.code + ' ';
}
