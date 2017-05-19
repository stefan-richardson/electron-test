const electron = require('electron');
const path = require('path');

const { app, BrowserWindow, Tray, Menu, ipcMain, dialog } = electron;

let mainWindow;
let tray;
const appImage = path.join('src/assets', 'accuro.ico');
const menuTemplate = [
  { label: 'Something Here', enabled: false },
  { type: 'separator' },
  { label: 'Quit', click: _ => app.quit() }
];


app.on('ready', () => {
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
