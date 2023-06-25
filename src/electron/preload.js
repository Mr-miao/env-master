const { contextBridge, ipcRenderer } = require('electron')

// process.on('warning', e => console.warn(e.stack));

contextBridge.exposeInMainWorld('electronAPI', {
    /**
     * 执行指定目录下的可执行文件扫描
     * @param scanPath
     */
    scan: function (scanPath, callback){
        console.log("22222");
        ipcRenderer.send('scan', scanPath);
        ipcRenderer.on('scanResult', (event, execFile) =>{
            callback(execFile);
        });
    }
})