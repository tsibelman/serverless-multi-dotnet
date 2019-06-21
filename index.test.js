const ServerlessDotNet = require('./index');

test('Given no projectFolder set - getPackingInfo uses first folder as working folder', () => {
    const artifactPath = "folder/publish/deploy-package.zip";
    const expOutputPath = "publish/deploy-package.zip";
    const expCwd = "folder";
    const serverlessMock = {

        service: {
            provider: {
                runtime: 'dotnetcore2.1'
            },
            getAllFunctions: () => {
                return [{
                        package: {
                            artifact: artifactPath
                        }
                    }
                ]
            },
            getFunction: (func) => func
        }
    };
    const sut = new ServerlessDotNet(serverlessMock, {});
    const packingInfo = sut.getPackingInfo();
    expect(Object.entries(packingInfo).length).toBe(1);
    expect(packingInfo[artifactPath].currentWorkingDir).toBe(expCwd);
    expect(packingInfo[artifactPath].artifactOutput).toBe(expOutputPath);
});

test('Given projectFolder set - getPackingInfo uses projectFolder as current working directory', () => {
    const artifactPath = "src/app/folder/publish/deploy-package.zip";
    const projectFolder = "src/app/folder";    
    const expOutputPath = "publish/deploy-package.zip";
    const expCwd = projectFolder;
    const serverlessMock = {
        service: {
            provider: {
                runtime: 'dotnetcore2.1'
            },
            getAllFunctions: () => {
                return [{
                        package: {
                            artifact: artifactPath,
                            projectFolder: projectFolder,
                        }
                    }
                ]
            },
            getFunction: (func) => func
        }
    };
    const sut = new ServerlessDotNet(serverlessMock, {});
    const packingInfo = sut.getPackingInfo();
    expect(Object.entries(packingInfo).length).toBe(1);
    expect(packingInfo[artifactPath].currentWorkingDir).toBe(expCwd);
    expect(packingInfo[artifactPath].artifactOutput).toBe(expOutputPath);
});

test('Given projectFolder set to non root folder - getPackingInfo throws exception', () => {
    const artifactPath = "src/app/folder/publish/deploy-package.zip";
    const projectFolder = "src/app/folder2";    
    const serverlessMock = {
        service: {
            provider: {
                runtime: 'dotnetcore2.1'
            },
            getAllFunctions: () => {
                return [{
                        package: {
                            artifact: artifactPath,
                            projectFolder: projectFolder,
                        }
                    }
                ]
            },
            getFunction: (func) => func
        }
    };
    const sut = new ServerlessDotNet(serverlessMock, {});
    try{
        sut.getPackingInfo();

        // Should not get here... 
        expect(1 == 0).toBe(true);
    }
    catch(e){
        expect(e.message).toBe(`Serverless DotNet: function/package/projectFolder '${projectFolder}' is defined and should be root of function/package/artifact path '${artifactPath}'. Pleas update your configuration...`)
    }
    
});

test('Given projectFolder empty - getPackingInfo uses first folder as package folder', () => {
    const artifactPath = "folder/publish/deploy-package.zip";
    const projectFolder = "";    
    const expOutputPath = "publish/deploy-package.zip";
    const expCwd = "folder";
    const serverlessMock = {
        service: {
            provider: {
                runtime: 'dotnetcore2.1'
            },
            getAllFunctions: () => {
                return [{
                        package: {
                            artifact: artifactPath,
                            projectFolder: projectFolder,
                        }
                    }
                ]
            },
            getFunction: (func) => func
        }
    };
    const sut = new ServerlessDotNet(serverlessMock, {});
    const packingInfo = sut.getPackingInfo();
    expect(Object.entries(packingInfo).length).toBe(1);
    expect(packingInfo[artifactPath].currentWorkingDir).toBe(expCwd);
    expect(packingInfo[artifactPath].artifactOutput).toBe(expOutputPath);
});

test('Given provider runtime set to dotnet and no func runtimes set with single func, getPackingInfo returns data for all funcs', () => {
    const artifactPath = "folder/publish/deploy-package.zip";
    const serverlessMock = {
        service: {
            provider: {
                runtime: 'dotnetcore2.1'
            },
            getAllFunctions: () => {
                return [
                    {
                        package: {
                            artifact: artifactPath,
                        }
                    }
                ]
            },
            getFunction: (func) => func
        }
    };
    const sut = new ServerlessDotNet(serverlessMock, {});
    const packingInfo = sut.getPackingInfo();
    expect(Object.entries(packingInfo).length).toBe(1);
});

test('Given provider runtime set to dotnet and no func runtimes set with multiple func, getPackingInfo returns data for all funcs', () => {
    const artifactPath = "folder/publish/deploy-package.zip";
    const artifactPath2 = "folder/publish/deploy-package2.zip";
    const serverlessMock = {
        service: {
            provider: {
                runtime: 'dotnetcore2.1'
            },
            getAllFunctions: () => {
                return [
                    {
                        package: {
                            artifact: artifactPath,
                        },
                        
                    },
                    {
                        package: {
                            artifact: artifactPath2,
                        }
                    }
                ]
            },
            getFunction: (func) => func
        }
    };
    const sut = new ServerlessDotNet(serverlessMock, {});
    const packingInfo = sut.getPackingInfo();
    expect(Object.entries(packingInfo).length).toBe(2);
});

test('Given provider runtime set to dotnet and mixed func runtimes set with multiple func, getPackingInfo returns data for only dotnet funcs', () => {
    const artifactPath = "folder/publish/deploy-package.zip";
    const artifactPath2 = "folder/publish/deploy-package2.zip";
    const artifactPath3 = "folder/publish/deploy-package3.zip";
    const serverlessMock = {
        service: {
            provider: {
                runtime: 'dotnetcore2.1'
            },
            getAllFunctions: () => {
                return [
                    {
                        runtime: 'dotnetcore2.1',
                        package: {
                            artifact: artifactPath,
                        },
                        
                    },
                    {
                        runtime: 'nodejs10.x',
                        package: {
                            artifact: artifactPath2,
                        }
                    },
                    {
                        package: {
                            artifact: artifactPath3,
                        }
                    }
                ]
            },
            getFunction: (func) => func
        }
    };
    const sut = new ServerlessDotNet(serverlessMock, {});
    const packingInfo = sut.getPackingInfo();
    expect(Object.entries(packingInfo).length).toBe(2);
});

test('Given no provider runtime set and func runtimes set to dotnet with multiple func, getPackingInfo returns data for all funcs', () => {
    const artifactPath = "folder/publish/deploy-package.zip";
    const artifactPath2 = "folder/publish/deploy-package2.zip";
    const serverlessMock = {
        service: {
            provider: {},
            getAllFunctions: () => {
                return [
                    {
                        runtime: 'dotnetcore2.1',
                        package: {
                            artifact: artifactPath,
                        },
                        
                    },
                    {
                        runtime: 'dotnetcore2.1',
                        package: {
                            artifact: artifactPath2,
                        }
                    }
                ]
            },
            getFunction: (func) => func
        }
    };
    const sut = new ServerlessDotNet(serverlessMock, {});
    const packingInfo = sut.getPackingInfo();
    expect(Object.entries(packingInfo).length).toBe(2);
});