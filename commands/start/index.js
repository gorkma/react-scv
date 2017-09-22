'use strict';

const overrides = require('../../src/overrides');
const DevServer = require('webpack-dev-server');
const path = require('path');
const fs = require('fs');
const FlowStatusWebpackPlugin = require('flow-status-webpack-plugin');
const CWD = process.cwd();
const FLOW_EXE = path.join(CWD, 'node_modules/.bin/flow');
const FLOW_TARGET = path.join(CWD ,'/node_modules/workshare-scv/config/');
const webpack = require('webpack');
const buildDllIfNotPresent = require('../../src/buildDllIfNotPresent');

module.exports = (args, done) => {

  buildDllIfNotPresent(()=>{

      const port = args.options.port;
      const flow = args.options.flow;
      const config = overrides.require(require.resolve('../../config/webpack.dev'));

      const schema = config.devServer.https ? 'https' : 'http';
      const host = config.devServer.host || 'localhost';

      config.entry.unshift(
          "react-hot-loader/patch",
          `webpack-dev-server/client?${schema}://${host}:${port}`,
          'webpack/hot/dev-server'
      );

      console.log(' --- starting dev server, and api proxy --- ');

      //todo experimental feature
      if(flow){
          config.plugins.push(new FlowStatusWebpackPlugin({
              root: FLOW_TARGET,
              binaryPath: FLOW_EXE,
              flowArgs: ' --include '+ CWD,
              failOnError: true
          }));
      }

      const compiler = webpack(config);

      config.output.publicPath = "http://" + host + ":" + port + config.output.publicPath;

      const server = new DevServer(compiler, config.devServer);

      server.listen(port, host, () => console.log(`Listening on ${schema}://${host}:${port}`));

      process.on('SIGINT', ()=>{server.close(); done()});

  });

};
