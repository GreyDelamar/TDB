"use strict";

import { app, protocol, BrowserWindow, ipcMain } from "electron";
import {
  createProtocol
  /* installVueDevtools */
} from "vue-cli-plugin-electron-builder/lib";
import { config } from '@vue/test-utils';
const isDevelopment = process.env.NODE_ENV !== "production";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null;
let dbWin: BrowserWindow | null;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      // contextIsolation: true
    }
  });

  dbWin = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      // contextIsolation: true
    }
  });``


  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    dbWin.loadURL(process.env.WEBPACK_DEV_SERVER_URL + '/dbClient.html');
    if (!process.env.IS_TEST) win.webContents.openDevTools();
    if (!process.env.IS_TEST) dbWin.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
    dbWin.loadURL("app://./dbClient.html'")
  }

  win.on("closed", () => {
    win = null;
  });

}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    // try {
    //   await installVueDevtools()
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }
  }
  createWindow();
});

// app.on("remote-require", (event, webContents, moduleName) => {
//   if (!isDevelopment) event.preventDefault();
// });

// // built-ins are modules such as "app"
// app.on("remote-get-builtin", (event, webContents, moduleName) => {
//   if (!isDevelopment) event.preventDefault();
// });

// app.on("remote-get-global", (event, webContents, globalName) => {
//   if (!isDevelopment) event.preventDefault();
// });

// app.on("remote-get-current-window", (event, webContents) => {
//   if (!isDevelopment) event.preventDefault();
// });

// app.on("remote-get-current-web-contents", (event, webContents) => {
//   if (!isDevelopment) event.preventDefault();
// });

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}


ipcMain.on('log:main', (e, val: any) => {
  console.log(val)
})


// --- ROUTER SECTION ---

//  add connection
ipcMain.on('server:addConnection', (e, config: any) => {
  if (dbWin) dbWin.webContents.send('server:addConnection', config);
})

ipcMain.on('server:addConnection:result', (e, result: any) => {
  if (win) win.webContents.send('server:addConnection:result', result);
})

//  remove connection
ipcMain.on('server:removeConnection', (e, config: any) => {
  if (dbWin) dbWin.webContents.send('server:removeConnection', config);
})

// get databases
ipcMain.on('server:getDatabases', (e, config) => {
  if (dbWin) dbWin.webContents.send('server:getDatabases', config);
})

ipcMain.on('server:getDatabases:result', (e, result) => {
  if (win) win.webContents.send('server:getDatabases:result', result);
})

// get tables
ipcMain.on('server:getTables', (e, config, databaseName, databaseGuiID) => {
  if (dbWin) dbWin.webContents.send('server:getTables', config, databaseName, databaseGuiID);
})

ipcMain.on('server:getTables:result', (e, result) => {
  if (win) win.webContents.send('server:getTables:result', result);
})

// get Columns
ipcMain.on('server:getColumns', (e, config, table) => {
  if (dbWin) dbWin.webContents.send('server:getColumns', config, table);
})

ipcMain.on('server:getColumns:result', (e, result) => {
  if (win) win.webContents.send('server:getColumns:result', result);
})
