/**
 * Iteratee function to be performed on item from list.
 * @callback IterateeCallback
 * @param {*} item
 * @returns {*} - Processed item.
 */

/**
 * Perform async tasks on list in sequence.
 * @param {*} list
 * @param {IterateeCallback} iteratee - Function to be performed on item from list.
 * @returns {*} - Returns list of processed items.
 */
function sequence(list, iteratee) {
  const results = [];

  return list.reduce((p, item) =>
    p.then(() =>
      iteratee(item)
    ).then(result => {
      results.push(result);
    }),
    Promise.resolve()
  ).then(() =>
    results
  );
}

/**
 * Return true if item pass truth test.
 * @callback PredicateCallback
 * @param {*} item
 * @returns {Boolean}
 */

/**
 * Find the first item in list passing a truth test (predicate).
 * @param {*} list
 * @param {PredicateCallback} predicate
 * @returns {*} Item passing a truth test or undefined.
 */
function find(list, predicate) {
  let found = null;

  return list.reduce((p, item) =>
    p.then(() => {
      if (!found) {
        return predicate(item)
          .then(result => {
            if (result) {
              found = item;
            }
          });
      }
    })
  , Promise.resolve()
  ).then(() =>
    found
  );
}

/**
 * Function returning a promise.
 * @callback FuncCallback
 */

/**
 * Retry function up to 'num' times if it fails.
 * @param {FuncCallback} func
 * @param {Number} num
 */
function retry(func, num) {
  let tries = 0;
  let done;
  let result;

  return tryAgain();

  function tryAgain() {
    tries += 1;
    return func()
      .then(res => {
        result = res;
        done = true;
      })
      .catch(error => {
        if (tries >= num) {
          throw error;
        }
      })
      .then(() => {
        if (done) {
          return result;
        } else {
          return tryAgain();
        }
      });
  }
}

/**
 * Execute function. If it won't finish in specific time then timeout.
 * @param {Number} ms - Time after which to timeout.
 * @param {FuncCallback} func - Function to execute.
 */
function tryWithTimeout(ms, func) {
  return new Promise((resolve, reject) => {
    func().then(resolve, reject);

    setTimeout(() => {
      reject('Timed out');
    }, ms);
  });
}

/**
 * Check every second that something is complete.
 * Timeout out after certain amount of time.
 * @param {Number} ms - Time after which to timeout.
 * @param {PredicateCallback} check
 */
function waitFor(ms, check) {
  let duration = 0;

  return waitForComplete();

  function waitForComplete() {
    return waitSec()
      .then(check)
      .then(complete => {
        if (!complete) {
          if (duration >= ms) {
            return Promise.reject('Timed out');
          }

          return waitForComplete();
        }
      });
  }

  function waitSec() {
    return new Promise(resolve => {
      setTimeout(() => {
        duration += 1000;

        resolve();
      }, 1000);
    });
  }
}

module.exports = {
  sequence: sequence,
  find: find,
  retry: retry,
  tryWithTimeout: tryWithTimeout,
  waitFor: waitFor
};