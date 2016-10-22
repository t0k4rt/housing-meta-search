const Immutable = require("immutable");

let priceType = Immutable.Map({"buy":"buy", "rent":"rent"});

let houseType = Immutable.Map({"house":"house", "flat":"flat", "loft":"loft"});

module.exports=Immutable.Map({
	"shortTitle": null,
	"shortDescription": null,
	"houseType": null,
	"priceType": null,
	"price": 0,
	"surface": 0,
	"itemLink": null,
	"id": null,

	/** contact **/
	"phone":null,

});
