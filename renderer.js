// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

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
	"maxPrice": 2000,
	"minPrice": 1000,
	"rooms": undefined,
	"bedrooms": undefined,
	"minSurface": undefined,
	"maxSurface": undefined,
	"housingType": 1,
	"location": ["75", "75020", "75018", "Paris", "bloblo"]
});


//let query = searchAdapter.getSearchListingQuery(searchQuery);

let Cheerio = require('cheerio');
let URL = require("urijs");
let config = require("./src/main/providers/seLoger/config");
let url = new URL(config.apiUrl);

// query.then((res) => {
// 		return url.addQuery(res.toJS())
// 	})
// 	.then((url) => {
// 		console.log(url.toString());
// 		return fetch(url.toString());
// 	})
// 	.then((res) => {
// 		return res.text()
// 		//return res.json();
// 	})
// 	.then((body) => {
// 		//console.log(body);

// 		$ = Cheerio.load(body);
// 		let articles = $("article");
// 		let result = [];

// 		console.log("cheerio result", articles.length);

// 		articles.each(function (index, elt) {
// 			let $a = $(elt).find(".listing_infos > h2 > a");
// 			console.log("cheerio result", $a.length);
// 			try {
// 				_url = ($a[0].attribs.href);
// 				result.push({providerId: elt.attribs.id, url: _url, provider: "seLoger"})
// 			} catch (e) {
// 				console.error('got a bad url for a building.');}
// 		});
// 		console.log(result);
// 		return result;
// 	})
// 	.then((result) => {
// 		let container = document.getElementById("housings");
// 		result.forEach((item) => {
// 			let txt = document.createTextNode(item["url"]);
// 			let a = document.createElement("a");
// 			let p = document.createElement("p");
// 			a.setAttribute("href", item["url"])
// 			a.appendChild(txt);
// 			p.appendChild(a);
// 			container.appendChild(p);
// 		});

// 	});



//const mailgun = require('mailgun.js');

//let mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY || 'key-0dc9cbd690f818e2fd2272b95685454e'});


require('electron').ipcRenderer.on('documents', (event, message) => {
      console.log(message);
})


//itemParser.parseListing(searchQuery).then((res) => {console.log(res.toJS());});

// mg.messages.create('sandbox940eb08ed27d4d34aa97d46f3b3af0da.mailgun.org', {
//     from: "Excited User <mailgun@sandbox-123.mailgun.org>",
//     to: ["alexandre.assouad@gmail.com"],
//     subject: "Hello",
//     text: "Testing some Mailgun awesomness!",
//     html: "<h1>Testing some Mailgun awesomness!</h1>"
//   })
//   .then(msg => console.log(msg)) // logs response data
//   .catch(err => console.log(err)); // logs any error


// itemParser.parseHousing("http://www.seloger.com/annonces/locations/appartement/paris-16eme-75/auteuil-sud/112937527.htm?ci=750118,750120&cp=75&idtt=1&idtypebien=1&pxmax=2000&pxmin=1000")
// 	.then((res) => {console.log(res);});
