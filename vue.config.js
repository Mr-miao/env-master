const { defineConfig } = require('@vue/cli-service');
// const path = require('path');

module.exports = defineConfig({
  transpileDependencies: true,
  // configureWebpack: {
  //   externals: {
  //     knex: "require('knex')",
  //   }
  // },
  // chainWebpack: config => {
  //   config.module
  //       .rule('node')
  //       .test(/\.node$/)
  //       .use('node-loader')
  //       .loader('node-loader')
  //       .end()
  // },
  pluginOptions: {
    electronBuilder: {
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
