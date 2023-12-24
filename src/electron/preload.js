const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('electronAPI', {

    call: (msg, param)=>{
        ipcRenderer.send(msg, param);
    },

    on: (msg, callback) =>{
        ipcRenderer.on(msg, (event, result) =>{
            callback(result);
        });
    },

    once: (msg, callback) =>{
        ipcRenderer.once(msg, (event, result) =>{
            callback(result);
        });
    }

})