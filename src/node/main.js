const Immutable = require("immutable");
const Datastore = require('nedb');
const path = require('path')
const fetch = require("node-fetch");
const schedule = require('node-schedule');

const geocoder = require("../../src/main/providers/seLoger/geocoder");
const searchAdapter = require("../../src/main/providers/seLoger/searchAdapter");
const itemParser = require("../../src/main/providers/seLoger/itemParser");


const sendgrid = require("sendgrid")(process.env.SENDGRID_API_KEY||"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");



console.info("application is starting");

//let mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY || 'key-0dc9cbd690f818e2fd2272b95685454e'});


let db = new Datastore({ filename: path.join(__dirname, 'db', 'data.db') });
db.loadDatabase();
console.info("db initialized");



let searchQuery = Immutable.Map({
	"maxPrice": 1300,
	"minPrice": 800,
	//"rooms": undefined,
	//"bedrooms": undefined,
	"minSurface": 45,
	//"maxSurface": undefined,
	"housingType": 1,
	"location": ["75019", "75020", "75018", "75017", "75012", "75010", "75011"]
});



let j = schedule.scheduleJob("*/10 * * * *", function(){
  	itemParser.parseListing(searchQuery).then((res) => {
	  	console.log("got results :", res.count());
	  	let promises = [];

	  	res.toArray().forEach(v => {
	  		console.log(v.toJS());
	  		let p = new Promise((resolve, reject) => {
	  			if(v.has("ext_id")) {
	  				console.log("looking for id ", v.get("ext_id"));
	  				let id = v.get("ext_id");
					db.find({ ext_id:  id}, function (err, docs) {

						console.log("found documents : ", docs.length);
						if(err) {
							console.error(err);
							reject(err);
						} else if(docs.length === 0) {
							console.log(v.get("ext_id"));
							db.insert(v.toJS(), function(err, newDocs){
								if(err) {
									console.error(err);
									reject(err);
								} else {
									resolve(v.set("newDoc", true));
								}

							});
						} else {
							resolve(v);
						}
					});
				} else {
					resolve(v);
				}
	  		});

	  		promises.push(p);
	  	});

		return Promise.all(promises);

	})
	.then(res => {
		return Immutable.List(res).filter(elt => elt.get("newDoc"))
	})
	.then(res => {

		if(res.count() == 0) {
			console.log("no new docs");
			//return;
		} else {
			console.log("found new documents : ", res.count());
		}
		//console.log(res);
		let mail_txt = "Nouveaux appartements :";
		let mail_html = "<h2>Nouveaux appartements :</h2>";

		res.filter((v) => { return v.get("newDoc");}).map((item) => {

			let template_html = `Nouvel appartement sur ${item.get("provider")} <br>
			prix : ${item.get("price")}€ | surface : ${item.get("surface")} m2 <br>
			numéro de téléphone : ${item.get("phone")} <br>
			lien vers l'annonce : ${item.get("link")} <br>
			`;

			let template_txt = `Nouvel appartement sur ${item.get("provider")} \n
			prix : ${item.get("price")}€ | surface : ${item.get("surface")} m2 \n
			numéro de téléphone : ${item.get("phone")} \n
			lien vers l'annonce : ${item.get("link")} \n
			`;

			mail_txt = `${mail_txt}\n${template_txt}`;
			mail_html = `${mail_html}<br><p>${template_html}</p>`;

		});

		// email.addTo("maurerclaire@aol.com")
		// 	.addTo("alexandre.assouad@gmail.com");

		// email.setFrom("aliababa@gmail.com");
		// email.setSubject("Nouvelles annonces de logement !");
		// email.setHtml("mail_html");



		var helper = require('sendgrid').mail;
		var from_email = new helper.Email('aliababa@gmail.com');
		var to_email = new helper.Email('alexandre.assouad@gmail.com');
		var subject = 'Nouvelles annonces de logement !';
		var content = new helper.Content('text/html', mail_html);
		var mail = new helper.Mail(from_email, subject, to_email, content);


		var request = sendgrid.emptyRequest({
		  method: 'POST',
		  path: '/v3/mail/send',
		  body: mail.toJSON(),
		});

		sendgrid.API(request, function(error, response) {
			console.log("Sendgrid error", error);
			console.log(response.statusCode);
			console.log(response.body);
			console.log(response.headers);
		});
	})
});




