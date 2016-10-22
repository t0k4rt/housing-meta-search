const Immutable = require("immutable");

let priceType = Immutable.Map({"buy":"buy", "rent":"rent"});

let houseType = Immutable.Map({"house":"house", "flat":"flat", "loft":"loft"});







module.exports=Immutable.Map({
	"title": null,
	"description": null,
	"houseType": null,
	"priceType": null,
	"price": 0,
	"fee": 0,
	"chargesIncluded": false,
	"surface": 0,
	/** contact **/

	"phone":null,

});
