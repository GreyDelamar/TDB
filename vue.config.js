const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  lintOnSave: false,
  transpileDependencies: ["vuetify"],
  pages: {
    index: {
      // entry for the *public* page
      entry: 'src/client/main.ts',
      // the source template
      template: 'public/index.html',
      // output as dist/index.html
      filename: 'index.html'
    },
    dbClient: 'src/dbClient/main.ts'
  },
  chainWebpack: config => {
    config.resolve.alias.set("@", path.join(__dirname, "./src/client"))
    config.resolve.alias.set("@db", path.join(__dirname, "./src/dbClient"))
  },
  pluginOptions: {
    electronBuilder: {
      mainProcessFile: 'src/main.ts',
      nodeIntegration: true
    }
  },
  configureWebpack: {
    node: {
      dns: 'mock',
      __dirname: true
    },
    plugins: [
      new MonacoWebpackPlugin()
    ],
    module: {
      rules: [
        {
          test: /node_modules[/\\](iconv-lite)[/\\].+/,
          resolve: {
            aliasFields: ['main']
          }
        }
      ]
    }
  }
};
