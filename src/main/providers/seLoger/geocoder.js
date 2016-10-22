let url = require("urijs");
let fetch = require("node-fetch");
let config = require("./config");

/**
 * On ne peux pas utiliser directement un code postal sur Seloger
 * Il est nécessaire de convertir le code postal en code interne utilisé par Seloger
 *
 * @param locationString
 * @returns Promise
 */

class Geocoder {
	geoCodeFromString(searchString) {
		let baseGeoCodeUrl = new url(config.geocoderUrl);
		return fetch(baseGeoCodeUrl.addQuery("text", searchString).toString())
			.then(function(res) {
				return res.json();
			})
			.then(function(json) {
				if(json.length > 0) {
					return json[0]["Params"];
				} else {
					return undefined;
				}
			});
	}
}

module.exports = new Geocoder();
