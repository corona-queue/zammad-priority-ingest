const express = require('express');
const morgan = require('morgan');
const jsonErrorHandler = require('express-json-error-handler').default;
require('dotenv').config()
const zammadClient = require('./zammad');
const zammad = new zammadClient();
const assert = require('assert')
const Evaluation = require('./evaluation');
const eval = new Evaluation();

const app = express();
app.use(express.json());
app.use(jsonErrorHandler());

zammad.listUsers()
.then(console.log)
	.then(() => console.log('zammad works'));

app.get('/', (req, res) => {
	res.json({});
});

app.post('/ticket', async (req, res) => {

	try {
		let user = req.body.meta
		assert.ok(user, 'meta not present')
		assert.ok(user.phone, 'phone not present')
		user = await zammad.createUser(user)
		eval.evaluate();
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
