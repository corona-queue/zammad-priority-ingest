const express = require('express');
const morgan = require('morgan');
const jsonErrorHandler = require('express-json-error-handler').default;
require('dotenv').config()
const zammadClient = require('./zammad');
const zammad = new zammadClient();

const app = express();
app.use(express.json());
app.use(jsonErrorHandler());

zammad.listTickets()
	.then(() => console.log('zammad works'));

app.get('/', (req, res) => {
	res.json({});
});

app.post('/ticket', async (req, res) => {
	try {
		const user = await zammad.createUser({
			"firstname": "Bob",
			"lastname": "Smith",
		})
		const response = await zammad.createTicket({
			"title": "Ich brauche einen Test",
			"group": "Users",
			"customer_id": user.id,
			"article": {
				"subject": "some subject",
				"body": "some message",
				"type": "note",
				"internal": false
			},
			"note": "some note",
		})
		res.json(response)
	} catch (error) {
		console.error(error)
		res.status(500).send(error.message)
	}
})

app.listen(3000, () => {
	console.debug('App listening on :3000');
});
