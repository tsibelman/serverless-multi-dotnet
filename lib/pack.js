'use strict';

const BbPromise = require('bluebird');
const program = require('child_process');

module.exports = {
  pack() {
    let cli=this.serverless.cli;
    cli.log('Serverless DotNet: Pack');
  
    let servicePath = this.serverless.config.servicePath;
    let service=this.serverless.service;

    var artifacts=service.getAllFunctions().map(func => service.getFunction(func).package.artifact);
    
    var promises = [...new Set(artifacts)].map(artifactPath => {
      return new BbPromise(function (resolve, reject) {
        var artifactPathParts=artifactPath.split(/\\|\//);

        try {
          program.exec('dotnet lambda package -o ' + artifactPathParts.splice(1).join('/'), {"cwd":artifactPathParts[0]}, function(error, stdout, stderr){
            //console.log(stdout);
            cli.log(stdout);

            if (error) {
              console.error('An error occured while restoring packages');
              console.error(stderr);
              process.exit(error.code);
              return reject(error);
            }

            console.log('Publishing');
            
            return resolve();
          });
        } catch (err) {
          console.error('An error occured while restoring packages');
          console.error(err);
          process.exit();
          return reject(err);
        }
      })
    });
   
    return  BbPromise.all(promises);
  }
};
