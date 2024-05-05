const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');
const packageJson = require('./package.json');

module.exports = defineConfig({
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env.VUE_APP_VERSION': JSON.stringify(packageJson.version)
      })
  ]},
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      customFileProtocol: './',
      builderOptions:{
        "appId": "com.tomwill.envmaster",
        "productName": "EnvMaster",
        "directories": {
          "output": "release/"
        },
        asar: true,
        "win": {
          "target": "nsis",
          "icon": "public/app-icon.png",
          "requestedExecutionLevel":"requireAdministrator"
        },
        "nsis": {
          "oneClick": false,
          "perMachine": true,
          "allowElevation": true,
          "allowToChangeInstallationDirectory": true,
          "createDesktopShortcut": true,
          "createStartMenuShortcut": true,
          "shortcutName": "EnvMaster"
        }
      },
      externals: ['node-pre-gyp','knex','better-sqlite3'],
      // nodeIntegration: true,
      preload: "src/electron/preload.js",
      //下面这部分配置解决了【Electron Vue3关于错误：[DEP0128] DeprecationWarning Invalid 'main' field in】的问题
      chainWebpackMainProcess: (config) => {
        config.output.filename((file) => {
          if (file.chunk.name === 'index') {
            return 'background.js';
          } else {
            return '[name].js';
          }
        });
      }
    }
  }
})
