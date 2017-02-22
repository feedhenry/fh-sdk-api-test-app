# Client SDK API test

Tests [Client API](https://access.redhat.com/documentation/en-us/red_hat_mobile_application_platform_hosted/3/html/client_api/) with Client SDK for Cordova.

## What it consists of
* Cordova application which tests javascript client SDK API
  * It uses mocha testing framework + expect assertions
  * There is an default browser reporter + custom JUnit one (Jenkins use)
* Wrapper which prepares everything for the Cordova app
  * Prepares environment
    * Downloads SDK to Cordova app
    * Prepares project in studio
    * Imports cloud app with hello endpoint and initialized sync
    * Prepares connection between client and cloud app
    * Secures endpoints
    * Deploys cloud app
    * Creates policy
    * Creates fhconfig file in the Cordova app
  * Runs Cordova in browser
  * Gathers results of testing using selenium
  * Stops Cordova
  * Cleans the environment
  * It can be specified which version of SDK should be used using tag parameter

## What does it test
* $FH.AUTH
* $FH.CLOUD
* $FH.GETCLOUDURL
* $FH.GETFHPARAMS
* $FH.HASH
* $FH.SEC
* $FH.SYNC

## How to use it
To start the test run:
```
npm install
npm start -- --host=<address> --username=<user> --password=<password> --environment=<env> --sdkversion=latest
```


## TODO
* $FH.PUSH
* $FH.MBAAS
* $FH.FORMS

## Possible improvements
* Use [nightmare.js](http://www.nightmarejs.org/) instead of Selenium+WebdriverIO (could possibly simplify Jenkins job)
