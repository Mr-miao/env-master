const { contextBridge, ipcRenderer } = require('electron')

// process.on('warning', e => console.warn(e.stack));


contextBridge.exposeInMainWorld('electronAPI', {
    /**
     * 执行数据更新操作
     * @param scanPath
     */
    dbUpdate: function (sql){
        ipcRenderer.send('dbupdate', sql);
    },
    /**
     * 执行数据查询操作
     * @param scanPath
     */
    dbQuery: function (sql){
        // console.log("22222");
        ipcRenderer.send('dbquery', sql);
    },
    /**
     * 数据库执行完成后的事件
     * @param callback
     */
    onDBExecComplete: function (callback){
        ipcRenderer.once('onDBExecComplete', (event, result) =>{
            // console.log("22222");
            // console.log(result);
            callback(result);
        });
    },
    /**
     * 执行指定目录下的可执行文件扫描
     * @param scanPath
     */
    scan: function (scanPath){
        // console.log("22222");
        ipcRenderer.send('scan', scanPath);
    },
    /**
     * 扫描中监听返回的事件
     * @param callback
     */
    onScaning: function (callback){
        ipcRenderer.on('scanResult', (event, resultJson) =>{
            callback(resultJson);
        });
    },
    /**
     * 扫描完成事件监控
     * @param callback
     */
   onScanComplete: function (callback){
        ipcRenderer.on('scanComplete', () =>{
            callback(callback);
        });
    }
})