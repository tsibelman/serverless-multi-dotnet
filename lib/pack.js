'use strict';

const BbPromise = require('bluebird');
const program = require('child_process');

function getLambdaPackageFlags(service) {
  var frameworkList = {
    "dotnet6": "net6.0" //can add more mappings for more support 
  };
  let myFramework = ' -f ' + frameworkList[service.provider.runtime];
  if (service.provider.runtime == "dotnetcore3.1") { //dotnet 3.1 doesn't need extra parameters
    myFramework = ''
  }

  let architecture = '';
  if (service.provider.architecture) {
    architecture = ' -farch ' + service.provider.architecture
  }  
  return architecture + myFramework;
}
module.exports = {

  getPackingInfo() {
    let service = this.serverless.service;    
    const packages = service.getAllFunctions().reduce((dotnetPackages, funcName) => {
      let func = service.getFunction(funcName);

      if (this.funcRuntimeIsDotNet(service, func)) {
        dotnetPackages.push(func.package);
      }

      return dotnetPackages;
    }, [])

    let dicArtifacts = {};

    packages.forEach(p => {

      const projectFolder = p.projectFolder || "";
      // Validate artifact starts with project folder
      if (projectFolder && !p.artifact.startsWith(projectFolder)) {
        const error = `Serverless DotNet: function/package/projectFolder '${projectFolder}' is defined and should be root of function/package/artifact path '${p.artifact}'. Pleas update your configuration...`;
        throw new Error(error);
      }

      var artifactPathParts = p.artifact.split(/\\|\//);

      var cwd = projectFolder || artifactPathParts[0];
      var cwdParts = cwd.split(/\\|\//);


      // subtract project folder from the artifact path
      let artifactLessProjectFolderParts = [...artifactPathParts];
      artifactLessProjectFolderParts.splice(0, cwdParts.length);      

      dicArtifacts[p.artifact] = {
        currentWorkingDir: cwd,
        artifactOutput: artifactLessProjectFolderParts.join('/')
      }
    });

    return dicArtifacts;

  },

  funcRuntimeIsDotNet(service, func) {
    let providerRuntime = service.provider.runtime;
    let funcRuntime = func.runtime;

    if (!providerRuntime && !funcRuntime) {
      console.error('No runtime found at global provider or local function level, eg. dotnetcore2.1')
    }

    return (providerRuntime && providerRuntime.startsWith('dotnet') && !funcRuntime)
      || (funcRuntime && funcRuntime.startsWith('dotnet'))
      || (!providerRuntime && funcRuntime && funcRuntime.startsWith('dotnet'));
  },

  pack() {
    let cli = this.serverless.cli;    
    let flags = getLambdaPackageFlags(this.serverless.service )
    cli.log('Serverless DotNet: Pack');
    const dicArtifacts = this.getPackingInfo();
    var promises = Object.entries(dicArtifacts).map(kv => {
      return new BbPromise(function (resolve, reject) {

        try {
          const packingInfo = kv[1];

          var output = program.execSync('dotnet lambda package ' + flags + ' -o ' + packingInfo.artifactOutput, { "cwd": packingInfo.currentWorkingDir }, function (error, stdout, stderr) {
            console.log(output)            
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

          cli.log(output);
          return resolve();
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