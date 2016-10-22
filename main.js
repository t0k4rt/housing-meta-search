const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const Datastore = require('nedb');
const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let db = new Datastore({ filename: path.join(app.getAppPath(), 'data.db') });

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`)

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  // laod db

	db.loadDatabase();

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})



const Immutable = require("immutable");
const geocoder = require("./src/main/providers/seLoger/geocoder");
const searchAdapter = require("./src/main/providers/seLoger/searchAdapter");
const itemParser = require("./src/main/providers/seLoger/itemParser");

const fetch = require("node-fetch");

// console.log(geocoder);
// geocoder.geoCodeFromString("75020")
// 	.then(
// 		(result) => { console.log(result); }
// 		, (error) => {console.log(error);}
// 	);


let searchQuery = Immutable.Map({
	"maxPrice": 1300,
	"minPrice": 800,
	//"rooms": undefined,
	//"bedrooms": undefined,
	"minSurface": 45,
	//"maxSurface": undefined,
	"housingType": 1,
	"location": ["75019", "75020", "75018", "75017"]
});


const schedule = require('node-schedule');

let j = schedule.scheduleJob('*/1 * * * *', function(){
  console.log('Launch cron !!');
  itemParser.parseListing(searchQuery).then((res) => {

		//console.log(res.toJS());
		res.map((v) => {
			//console.log(v.has("ext_id"));
			if(v.has("ext_id")) {
				db.find({ ext_id:  v.get("ext_id")}, function (err, docs) {
					console.log(err, docs.length);
					if(docs.length === 0) {
						db.insert(v.toJS(), function(err, newDocs){
							mainWindow.send("documents", newDocs);
						});
					}
				});
			}
		})
	});
});



db.find({}, function (err, docs) {
	mainWindow.send("documents", docs);
});

