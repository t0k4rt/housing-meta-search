const Immutable = require("immutable");
const mailgun = require('mailgun.js');

//let emails = Immutable.List(["alexandre.assouad@gmail.com", "maurerclaire@aol.com"]);
let emails = Immutable.List(["alexandre.assouad@gmail.com"]);


let mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY || 'key-0dc9cbd690f818e2fd2272b95685454e'});

mg.messages.create('sandbox940eb08ed27d4d34aa97d46f3b3af0da.mailgun.org', {
    from: "Excited User <mailgun@sandbox-123.mailgun.org>",
    to: emails.toJS(),
    subject: "Nouvelles annonces",
    text: "vos nouvelles annonces :"
    html: "<h1>Testing some Mailgun awesomness!</h1>"
  })
  .then(msg => console.log(msg)) // logs response data
  .catch(err => console.log(err)); // logs any error
