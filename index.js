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
app.use(morgan('combined'));

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

		const response = await zammad.createTicket({
			"title": "Rückrufwunsch Corona-Hotline Prio "+medical_priority,
			"group": "Users",
			"customer_id": user.id,
			"article": {
				"subject": "Rückrufwunsch Corona-Hotline Prio "+medical_priority,
				"body": note,
				"type": "note",
				"internal": false
			},
			med_prio: medical_priority,
		})

		assert.ok(response.id, 'ticket creation failed');

		res.json({
			id: response.id,
			priority: response.priority_id,
			med_prio: response.med_prio

		})
	} catch (error) {
		console.error(error)
		res.status(500).json({error: error.message});
	}
})

app.listen(process.env.PORT || 3000, () => {
	console.debug('App listening on :3000');
});
