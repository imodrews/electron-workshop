const { app, BrowserWindow, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

let mainWindow;

const saveFile = async (content) => {
    let file

    try {
        file = await dialog.showSaveDialog(mainWindow, {
            title: 'Save HTML Output',
            defaultPath: app.getPath('documents'),
            filters: [
              { name: 'HTML Files', extensions: ['html'] }
            ]
          })
    } catch (e) {
        console.log(e.message)
    }

    console.log(file)

    if (file.canceled) return
  
    fs.writeFile(file.filePath, content, 'utf8', (err) => {
        if (err) return console.log(err.message);
        console.log('The file has been saved!');
      });
  }

const openFile = async () => {

    let files;

    try {
     // https://www.electronjs.org/docs/api/dialog#dialogshowopendialogbrowserwindow-options
     files = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            title: 'Please select a Markdown file',
            buttonLabel: "Select MD file",
            filters: [
              { name: 'Markdown Files', extensions: ['md', 'markdown', 'txt'] }
            ]
        })
    } catch (e) {
        console.log(e.message)
    }
  
    if (files.canceled) return
    // console.log(files)

    const file = files.filePaths[0]
    // console.log(file)

    fs.readFile(file, (err, data) => {
        if (err) return console.log(err.message)
        const content = data.toString()
        // console.log(content)

        mainWindow.webContents.send('file-opened', file, content)
    })
  }

app.on('ready', () => {
    console.log('App is ready!')

    mainWindow = new BrowserWindow({
        title: 'Electron Workshop',
        height: 768,
        width: 1024,
        resizable: false,

        // x: Window's left offset from screen | y: Window's top offset from screen
        // x: 0 and y: 0 means the window will be created on the top left corner of the screen
        // x: 0,
        // y: 0,

        // for a frameless app
        // https://www.electronjs.org/docs/api/frameless-window
        // style="-webkit-app-region: drag" need to be specified in the HTML for the window to be draggable
        frame: false,

        // Whether the window should always stay on top of other windows.
        // alwaysOnTop: true,

        webPreferences: {
          nodeIntegration: true,
        },
      })

    // There are multiple ways to load the initial renderer window:

    // 1/ Load a remote URL
    // mainWindow.loadURL('https://github.com')

    // 2/ Or load a local HTML file
    // console.log(path.join(__dirname, 'index.html'))
    mainWindow.loadURL(`file://${path.join(__dirname, 'index.html')}`)

    mainWindow.webContents.openDevTools()

    // 3/ Or load a local HTML file as such (should be a path to an HTML file relative to the root of your application)
    // mainWindow.loadFile(path.join(__dirname, 'index.html'))

    mainWindow.webContents.on('did-finish-load', () => {
        openFile()
      })

    mainWindow.on('closed', () => mainWindow = null)
})

exports.openFile = openFile
exports.saveFile = saveFile
