'use strict';

const BbPromise = require('bluebird');
const program = require('child_process');

module.exports = {

  getPackingInfo() {

    let service = this.serverless.service;

    const packages = service.getAllFunctions().map(func => service.getFunction(func).package);
    let dicArtifacts = {};
    packages.forEach(p => {

      const projectFolder = p.projectFolder || "";
      // Validate artifact starts with project folder
      if (projectFolder && !p.artifact.startsWith(projectFolder)){
        const error = `Serverless DotNet: function/package/projectFolder '${projectFolder}' is defined and should be root of function/package/artifact path '${p.artifact}'. Pleas update your configuration...`;
        throw new Error(error);
      
      }

      var artifactPathParts = p.artifact.split(/\\|\//);

      var cwd = projectFolder || artifactPathParts[0];
      var cwdParts = cwd.split(/\\|\//);


      // subtract project folder from the artifact path
      let artifactLessProjectFolderParts = [...artifactPathParts];
      artifactLessProjectFolderParts.splice(0, cwdParts.length);
      // console.log('artifact: ' +p.artifact);
      // console.log('artifact parts: ' +artifactPathParts);
      // console.log('cwd parts: ' +cwdParts);
      // console.log('artifact less cwd parts: ' +artifactLessProjectFolderParts);

      dicArtifacts[p.artifact] = { 
        currentWorkingDir: cwd, 
        artifactOutput: artifactLessProjectFolderParts.join('/')
      } 
    });

    return dicArtifacts;

  },

  pack() {
    let cli = this.serverless.cli;
    cli.log('Serverless DotNet: Pack');

    const dicArtifacts = this.getPackingInfo();

    var promises = Object.entries(dicArtifacts).map(kv => {
      return new BbPromise(function (resolve, reject) {
        
        try {
          const packingInfo = kv[1];
          program.exec('dotnet lambda package -o ' + packingInfo.artifactOutput, { "cwd": packingInfo.currentWorkingDir }, function (error, stdout, stderr) {
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

    return BbPromise.all(promises);
  }
};
