"use strict";

let url = require("urijs");
let fetch = require("node-fetch");
let config = require("./config");
let Immutable = require('immutable');


/**
*
* request params :
pxmin=100
pxmax=1500
idtt=1
idtypebien=2,1,9,14,13
ci=750120
cp=75
tri=initial
nb_pieces=1
nb_chambres=2
etagemin=1
etagemax=5
surfacemin=30
surfacemax=40
surf_terrainmin=1
surf_terrainmax=10
*
*/

class SearchAdapter{
	constructor(geocoder) {
		this.geocoder = geocoder;

		this.searchMapping = Immutable.Map({
			"maxPrice": "pxmax",
			"minPrice": "pxmin",
			"rooms": "nb_pieces",
			"bedrooms": "nb_chambres",
			"minSurface": "surfacemin",
			"housingType": "idtypebien",
			"location": "location"
		});

		this.orderMapping = Immutable.Map({
		});
	}

	getSearchItemQuery() {

	}

	sanitizeQuery(query) {
		return query
			.filter((value) => { return value !== undefined; }) // remove undefined values
			.flip() // flip key / value
			.map((value) => { // map searchQuery keys with seLoger internal keys
				if(this.searchMapping.get(value)) {
					return this.searchMapping.get(value);
				} else {
					return undefined;
				}
			})
			.filter((value) => { return value !== undefined; }) // filter unkown keys
			.flip()// flip back map
			.set("idtt", 1);
	}

	getSearchListingQuery(searchQuery) {
		let _self = this;
		console.log(searchQuery.toJS());

		// transform locations to seloger location ids

		if(Immutable.Iterable.isIterable(searchQuery) && Immutable.Iterable.isKeyed(searchQuery)) {
			let seLogerQuery = this.sanitizeQuery(searchQuery);

			// geocode all locations
			return Promise.all(seLogerQuery.get("location").map((value) => {
					return _self.geocoder.geoCodeFromString(value)
						.then((result) => {
							console.log("geocoder result", result);
							return result;
						}, (error) => {
							console.error(error);
						})
				}))
				.then((results) => {
						let initialValue = {"ci":[], "cp":[]};
						console.log("initialValue", initialValue, "results", results);
						// group result as ci or cp
						let newResult = results.reduce((prev, next) => {
							if(typeof next == "undefined") {
								return prev;
							}

							if(Object.keys(next).indexOf("ci") != -1) {
								if(prev["ci"].indexOf(next["ci"]) === -1) prev["ci"].push(next["ci"]);
							}
							if(Object.keys(next).indexOf("cp") != -1) {
								if(prev["cp"].indexOf(next["cp"]) === -1) prev["cp"].push(next["cp"]);
							}

							return prev;

						}, initialValue);

						// join results
						return seLogerQuery.withMutations((map) => {
							map.set("ci", newResult["ci"].join()).set("cp", newResult["cp"].join()).delete("location")
						}).filter((v,k) => {return v;});
					});
		}
	}
}


module.exports = new SearchAdapter(require("./geocoder"));
