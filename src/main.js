const electron = require('electron');
const path = require('path');
const { app, BrowserWindow, Tray, Menu, ipcMain, dialog, nativeImage } = electron;
const {autoUpdater} = require('electron-updater');

let mainWindow;
let tray;
const appImage = nativeImage.createFromPath(path.join('build', 'accuro.ico'))
const menuTemplate = [
  { label: 'Something Here', enabled: false },
  { type: 'separator' },
  { label: 'Quit', click: _ => app.quit() }
];

autoUpdater.on('update-available', (ev, info) => {
  const secondWindow = new BrowserWindow({
    width: 100,
    height: 100
  });

  secondWindow.loadURL(`http://www.github.ca`);
})

app.on('ready', () => {
  console.log('app Available');
  const contextMenu = Menu.buildFromTemplate(menuTemplate);

  tray = new Tray(appImage);
  tray.setContextMenu(contextMenu);

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Pharmacy',
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
;
});

ipcMain.on('testing', (e, pack) => {
  tray.displayBalloon({
      title: pack.title,
      content: pack.message
  });
});

app.on('ready', function()  {
  autoUpdater.checkForUpdates();
});
