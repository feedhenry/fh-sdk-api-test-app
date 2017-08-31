const git = require('simple-git/promise');
const path = require('path');

function clone(gitUrl, username, password, folder, branch) {
  let url;
  if (gitUrl.indexOf('http') === 0) {
    const credentials = encodeURIComponent(username) + ':' + encodeURIComponent(password);
    url = gitUrl.split('//');
    url = `${url[0]}//${credentials}@${url[1]}`;
  } else {
    url = gitUrl;
  }

  const localRoot = path.resolve(__dirname, '..');

  return git(localRoot).clone(url, folder, null)
    .then(() => git(folder).checkout(branch));
}

function addRemote(name, repo, folder) {
  return git(folder).addRemote(name, repo);
}

function add(file, folder) {
  return git(folder).add(file);
}

function commit(message, folder) {
  return git(folder).commit(message);
}

function push(remote, branch, folder) {
  return git(folder).push(remote, branch);
}

module.exports = {
  clone: clone,
  addRemote: addRemote,
  add: add,
  commit: commit,
  push: push
};