# Serverless Multi DotNet

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![npm version](https://badge.fury.io/js/serverless-multi-dotnet.svg)](https://badge.fury.io/js/serverless-multi-dotnet)
[![license](https://img.shields.io/npm/l/serverless-multi-dotnet.svg)](https://www.npmjs.com/package/serverless-multi-dotnet)

A Serverless plugin to pack all your C# lambdas functions that are spread to multiple CS projects.

This plugin will go over all of your functions that have .net core 2.0 runtime defined in `serverless.yml` file take the value from package.artifact 

It would split the value on first path separator and use first part of a string as location for a CS project folder and the rest as a path for a file. 

So for example your have function with value like this:

```
package:
 artifact: functionproject-folder/publish/deploy-package.zip
```
It equivalent to going into functionproject-folder and executing dotnet lambda package -o publish/deploy-package.zip

If you want to execute serverless deploy with no repacking of C# projects, you should add --nopack option

## Install

```
npm install serverless-multi-dotnet
```

Add the plugin to your `serverless.yml` file:

```yaml
plugins:
  - serverless-multi-dotnet
```

## Note
This work is based on @fruffin [serverless-dotnet plugin](https://github.com/fruffin/serverless-dotnet)

