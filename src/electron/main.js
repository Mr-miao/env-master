const { app, Menu, Tray ,BrowserWindow} = require('electron')
const path = require("path");

const fileUtils =  require('./scan')

const NODE_ENV = process.env.NODE_ENV;

let tray = null;
let mainWindow = null;

function createWindow() {
    Menu.setApplicationMenu(null);
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 980,
        height: 680,
        titleBarOverlay: {
            color: '#2f3241',
            symbolColor: '#74b1be',
            height: 60
        },
        // transparent: true,
        // fullscreen: true,
        // frame: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    mainWindow.on('closed', function () {
        mainWindow = null
    })

    if (NODE_ENV === "development") {
        mainWindow.loadURL("http://localhost:8080/");
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadURL(`file://${path.join(__dirname, "../dist/index.html")}`);
    }
}


app.whenReady().then(() => {
    tray = new Tray('electron/images/icon.png')
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '扫描',
            click:() => {
                createWindow();
                fileUtils.scanFolder('D:\\soft',mainWindow.webContents)
            }
        },
        { label: '关于'},
        {
            label: '退出',
            click:() => { app.quit() }
        }
    ])
    tray.setToolTip('envMaster.')
    tray.setContextMenu(contextMenu)
});

app.on("window-all-closed", function () {
    // if (process.platform !== "darwin") app.quit();
});