'use strict';

const BbPromise = require('bluebird');
const pack = require('./lib/pack');
const getPackingInfo = require('./lib/pack');
const funcRuntimeIsDotNet = require('./lib/pack');

class ServerlessDotNet {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    // console.log(options);
    // console.log(getPackingInfo);
    // console.log(serverless);
    // console.log(options);
    // options[""]
    // getPackingInfo.newOptions = options;
    // pack.newOptions = options;
    console.log(options)    
    if (!options["nopack"]) {      
      Object.assign(this, pack);
      Object.assign(this, getPackingInfo);
      Object.assign(this, funcRuntimeIsDotNet);            
      this.hooks = {
        'package:createDeploymentArtifacts': () => BbPromise.bind(this).then(this.pack)
      };
    }
  }
}

module.exports = ServerlessDotNet;
