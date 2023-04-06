const electron = require("electron");

const { app, BrowserWindow } = require("electron");

function createWindow () {
  // Create the browser window.
  let win = new BrowserWindow({
    autoHideMenuBar: true,
    width: 3840,
    height: 2160,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // and load the index.html of the app.
  win.loadFile("./src/index.html");
  // Open the DevTools.
  win.webContents.openDevTools();
}

app.on('ready', createWindow);
