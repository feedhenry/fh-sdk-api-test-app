mocha.globals(['jQuery']);
var runner = mocha.run();
var report = document.implementation.createDocument(null, 'testsuites');
var suiteFails;

function setXmlAttribute(element, name, value) {
  var newAtt = report.createAttribute(name);
  newAtt.nodeValue = value;
  element.setAttributeNode(newAtt);
}

runner.on('suite', function(suite) {
  suiteFails = 0;
  var suiteElement = report.createElement('testsuite');
  setXmlAttribute(suiteElement, 'name', suite.title);
  report.getElementsByTagName('testsuites')[0].appendChild(suiteElement);
});

runner.on('suite end', function(suite) {
  if (suite.title === '') {
    return;
  }
  var suiteElement = report.getElementsByTagName('testsuites')[0].lastChild;
  setXmlAttribute(suiteElement, 'tests', suite.tests.length);
  setXmlAttribute(suiteElement, 'failures', suiteFails);
  setXmlAttribute(suiteElement, 'errors', 0);
  setXmlAttribute(suiteElement, 'skipped', 0);
});

runner.on('test end', function(test) {
  var testElement = report.createElement('testcase');
  setXmlAttribute(testElement, 'name', test.title);
  setXmlAttribute(testElement, 'classname', test.parent.title);
  if (test.state === 'failed') {
    suiteFails += 1;
    var failElement = report.createElement('failure');
    setXmlAttribute(failElement, 'message', test.err.message);
    testElement.appendChild(failElement);
  }
  report.getElementsByTagName('testsuites')[0].lastChild.appendChild(testElement);
});

runner.on('end', function() {
  var xmlText = new XMLSerializer().serializeToString(report);
  var xmlTextNode = document.createTextNode(xmlText);
  document.getElementById('report').appendChild(xmlTextNode);
  document.getElementById('test-finished').innerHTML += '<div class="true">FINISHED</div>';
});