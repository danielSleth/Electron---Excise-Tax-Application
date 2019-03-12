// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
var ipc = require('electron').ipcMain;
var closeBlock = true

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
                      width: 1100, 
                      height: 950, 
                      minWidth: 1050, 
                      minHeight: 400,
                      frame: false})

  // and load the index.html of the app.
  mainWindow.loadFile('page1.html')
  mainWindow.setMenu(null);
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  ipc.on('minimize', function (event, arg) {
      mainWindow.minimize()
  })
  ipc.on('maximize', function (event, arg) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })
  ipc.on('checkIfMax', function (event, arg) {
    mainWindow.webContents.send('isMaximized', mainWindow.isMaximized())
  })
  ipc.on('close', function (event, arg) {
    closeBlock = false
    mainWindow.close()
  })
  mainWindow.on('close', function (event) {
    if (closeBlock) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.webContents.send('isClosing', mainWindow.isMaximized())
      event.preventDefault();
    }
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


//ipc.on('update-notify-value', function (event, arg) {
