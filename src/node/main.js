const Immutable = require("immutable");
const geocoder = require("../src/main/providers/seLoger/geocoder");
const searchAdapter = require("../src/main/providers/seLoger/searchAdapter");
const itemParser = require("../src/main/providers/seLoger/itemParser");
const fetch = require("node-fetch");
const mailgun = require('mailgun.js');
const schedule = require('node-schedule');


let mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY || 'key-0dc9cbd690f818e2fd2272b95685454e'});
let db = new Datastore({ filename: path.join(__dirname, 'db', 'data.db') });
db.loadDatabase();


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



let j = schedule.scheduleJob('*/10 * * * *', function(){
  itemParser.parseListing(searchQuery).then((res) => {
		res.map((v) => {
			if(v.has("ext_id")) {
				db.find({ ext_id:  v.get("ext_id")}, function (err, docs) {
					console.log(err, docs.length);
					if(docs.length === 0) {
						let mail_txt = "Nouveaux appartements :"
						let mail_html = "<h2>Nouveaux appartements :</h2>"
						db.insert(v.toJS(), function(err, newDocs){

							for(docs in newDocs) {
								let template = `Nouvel appartement sur ${item.provider}
prix : ${item.price}
surface : ${item.surface}
numéro de téléphone : ${item.phone}
lien vers l'annonce : ${item.link}
`;
								mail_txt = `${mail_txt}\n${template}`;
								mail_html = `${mail_html}<br><p>${template}</p>`;

							}
							mg.messages.create('sandbox940eb08ed27d4d34aa97d46f3b3af0da.mailgun.org', {
							    from: "Excited User <mailgun@sandbox-123.mailgun.org>",
							    to: ["alexandre.assouad@gmail.com"],
							    subject: "Nouveaux appartements",
							    text: mail_txt,
							    html: mail_html
							})
							.then(msg => console.log(msg)) // logs response data
							.catch(err => console.log(err)); // logs any error

						});
					}
				});
			}
		})
	});
});

