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
	.then(() => console.log('zammad works'));

app.get('/', (req, res) => {
	res.json({});
});

/**
 * Create new ticket
 *
 * POST with body:
 *
 * {
 * 	meta: {
 * 		firstname: string,
 * 		lastname: string,
 * 		phone: string
 * 	},
 * 	answers: {
 * 		q1: 2,
 * 		q2: 3,
 * 		q3: 2,
 * 		...
 * 	}
 * }
 */
app.post('/ticket', async (req, res) => {

	try {
		let user = req.body.meta


		//TODO: validate answers
		let answers = req.body.answers
		assert.ok(answers, 'answers not present')


		assert.ok(user, 'meta not present')
		assert.ok(user.phone, 'phone not present')
		user = await zammad.createUser(user)

		assert.ok(user.id, 'user creation failed');

		const { medical_priority, note } = await eval.evaluate(answers)
		console.info(`medical score ${medical_priority}`)

		const response = await zammad.createTicket({
			"title": "Corona Test",
			"group": "Users",
			"customer_id": user.id,
			"article": {
				"subject": "Corona Fragen",
				"body": note,
				"type": "note",
				"internal": false
			},
			med_prio: medical_priority,
		})
		res.json({
			id: response.id,
			priority: response.priority_id
		})
	} catch (error) {
		console.error(error)
		res.status(500).send(error.message)
	}
})

app.listen(process.env.PORT || 3000, () => {
	console.debug('App listening on :3000');
});
