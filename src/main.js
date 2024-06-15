const { app, BrowserWindow, session } = require('electron');
const path = require('path');

let mainWindow;
let preloaderWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    icon: path.join(__dirname, '../icons/photopea.png'),
    title: 'Photopea',
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.maximize();
  mainWindow.loadURL('https://photopea.com');
  
  // Ocultar el menú
  mainWindow.setMenuBarVisibility(false);
  
  // Manejar cierre de la ventana principal
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Manejar el evento de carga completa del contenido de la ventana principal
  mainWindow.webContents.on('did-finish-load', () => {
    if (preloaderWindow) {
      preloaderWindow.close();
    }
  });
}

// Crea el preloader
function createPreloaderWindow() {
  preloaderWindow = new BrowserWindow({
    width: 200,
    height: 200,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
  });

  preloaderWindow.loadFile('src/preloader.html');
  
  // Manejar cierre de la ventana del preloader
  preloaderWindow.on('closed', () => {
    preloaderWindow = null;
  });
}

// Este método se llama cuando Electron ha terminado de inicializarse.
app.whenReady().then(() => {
  createPreloaderWindow();
  createMainWindow();

  // Cargar la extensión desde la carpeta local o empaquetada
  const extensionPath = app.isPackaged
    ? path.join(process.resourcesPath, 'extension/no-ads')
    : path.join(__dirname, 'extension/no-ads');

  console.log('Loading extension from:', extensionPath);

  session.defaultSession.loadExtension(extensionPath)
    .then(() => {
      console.log('Extension loaded successfully');
    })
    .catch(err => {
      console.error('Failed to load extension:', err);
    });
});

// Salir cuando todas las ventanas estén cerradas.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});
