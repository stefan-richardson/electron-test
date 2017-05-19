const electron = require('electron');
const path = require('path');
const { app, BrowserWindow, Tray, Menu, ipcMain, dialog, nativeImage } = electron;
const {autoUpdater} = require('electron-updater');
const log = require('electron-log');
const isDev = require('electron-is-dev');

let mainWindow;
let tray;
const appImage = nativeImage.createFromPath(path.join('build', 'accuro.ico'))
const menuTemplate = [
  { label: 'Something Here', enabled: false },
  { type: 'separator' },
  { label: 'Quit', click: _ => app.quit() }
];
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

let win;

function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
}
function createDefaultWindow() {
  win = new BrowserWindow();
  win.webContents.openDevTools();
  win.on('closed', () => {
    win = null;
  });
  win.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
  return win;
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (ev, info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (ev, info) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (ev, err) => {
  sendStatusToWindow('Error in auto-updater.');
  sendStatusToWindow(err);
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (ev, info) => {
  sendStatusToWindow('Update downloaded; will install in 5 seconds');
});

app.on('ready', () => {
  console.log('app Available');
  const contextMenu = Menu.buildFromTemplate(menuTemplate);

  tray = new Tray(appImage);
  tray.setContextMenu(contextMenu);

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Pharmacy this is a test',
    icon: appImage,
  });

  mainWindow.setMenu(null)

  mainWindow.loadURL(`http://localhost:4200`);
  mainWindow.webContents.openDevTools();
  mainWindow.on('page-title-updated', (e, title) => {
    e.preventDefault();
  })

  mainWindow.on('close', (e) => {
    const choice = dialog.showMessageBox(
      mainWindow, {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'Are you sure you want to quit?'
      }
    );
    if (choice === 1) {
      e.preventDefault();
    }
  });
});

ipcMain.on('testing', (e, pack) => {
  tray.displayBalloon({
      title: pack.title,
      content: pack.message
  });
});

app.on('ready', function()  {
  createDefaultWindow();
  if(!isDev) {
    autoUpdater.checkForUpdates();
  }

});
