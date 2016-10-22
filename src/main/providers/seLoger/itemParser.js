
const Cheerio = require("cheerio");
const fetch = require("node-fetch");
const URL = require("urijs");
const Immutable = require("immutable");

const config = require("./config");
const searchAdapter = require("./searchAdapter");
const geocoder = require("./geocoder");

const url = new URL(config.apiUrl);

const crypto = require('crypto');


let regexPrice = /(.*)€/;

let regexSurfaceLight = /([0-9,]*)\sm²/;

let parseListing = function parseListing(searchObject) {
	let query = searchAdapter.getSearchListingQuery(searchObject);

	return query.then((res) => {
		return url.addQuery(res.toJS())
	})
	.then((url) => {
		console.log(url.toString());
		return fetch(url.toString());
	})
	.then((res) => {
		return res.text()
	})
	.then((body) => {

		$ = Cheerio.load(body);
		let articles = $("article");
		let result = Immutable.List();

		articles.each(function (index, elt) {

			let $properties = $(elt).find(".property_list li");

			let id = $(elt).attr("data-listing-id");

			let surface = regexSurfaceLight.exec($properties.last().text());
			surface = surface ? parseFloat(surface[1].replace(/,/, ".")) : surface;

			let $price = $(elt).find("a.amount");
			let price = regexPrice.exec($price.text());
			price = price ? parseInt(price[0].replace(/\s+/g, "")) : price;

			try {

				let $phone = $(elt).find(".agency_phone");
				var phone = $phone[0].attribs["data-phone"];

			} catch (e) {
				console.error('got a bad phone.');
			}

			try {
				var link = ($price[0].attribs.href);
				//result.push({providerId: elt.attribs.id, url: _url, provider: "seLoger"})
			} catch (e) {
				console.error('got a bad url for a building.');
			}


			result = result.push(Immutable.Map({
				"provider": "seloger",
				"ext_id": id,
				"price": price,
				"surface": surface,
				"phone": phone,
				"link": link,
				"signature": crypto.createHash('md5').update(price+""+surface+""+phone.replace(/[\s\+]*/,"")).digest("hex"),
				"searchQuery": searchObject
			}).filter((v) => {return v != null;})); // return only set values
		});

		return result;

	})
};



let parseHousing = function parseHousing(url, model, search) {
	return fetch(url).then((result) => {
		return result.text();
	})
	.then((body) => {
		// base regexes
		let regexSurface = /.*surface de (.*)m².*/ig;

    let regexFee = /.*honoraires ttc : (.*)€.*/ig;
    let regexCharges = /cc/i;
    let regexPhone = /Téléphone(.*)/i;
    let regexYear = /[0-9]{4}/ig;

		$ = Cheerio.load(body);
		let infos = $(".description-liste").first().text();

		let surface = regexSurface.exec(infos);
		surface = surface ? surface[1].replace(/\s+/g, "") : surface;

		let fee = regexFee.exec(infos);
		fee = fee ? fee[1].replace(/\s+/g, "") : fee;

		let price = regexPrice.exec($("#price").text());
		price = price ? price[1].replace(/\s+/g, "") : price;

		let year = regexYear.exec(infos);
		year = year ? year[0] : year;

		let charges = $("#price sup").text().match(regexCharges) != null;

		let phone = $(".action__detail-tel.agency_phone > span").first().text();
		let description = $('p.description').first().text();

		let location = $(".detail-subtitle span").first().text();
		let neighbourhood = $(".detail-title_subtitle").first().text().replace(/\n\t|\t|\n|-/g, "").replace(/\s\s+/g, "");

		let details = Immutable.List($(".description-liste li"))
			.map((k, v) => {
				return v.firstChild.data.replace(/\n\t|\t|\n|-/g, "").replace(/\s\s+/g, "");
			});

		let res = Immutable.Map({
			"surface": surface,
			"charges": charges,
			"fee": fee,
			"price": price,
			"phone": phone,
			"description": description,
			"location": location,
			"neighbourhood": neighbourhood,
			"year": year,
			"details": details
		});
		console.log(res.toJS());
		return res.filter((v, k) => { return v; });
	});
}


module.exports = { "parseListing": parseListing, "parseHousing": parseHousing };


