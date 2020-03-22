const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const jsonErrorHandler = require('express-json-error-handler').default;
require('dotenv').config()
const zammadClient = require('./zammad');
const zammad = new zammadClient();
const assert = require('assert')
const Evaluation = require('./evaluation');
const eval = new Evaluation();

// Prio definition
const prio_medium = 16;
const prio_high = 21;

const app = express();
app.use(express.json());
app.use(jsonErrorHandler());
app.use(morgan('combined'));

zammad.listUsers()
	.then(() => console.log('zammad works'));

app.use(cors());

app.get('/', (req, res) => {
	res.json({});
});

/**
 * Create new ticket
 *
 * POST with body:
 *
 * {
 * 	 q1: "q1_option2",
 * 	 q2: "q2_option0",
 * 	 q3: "q3_option1",
 * 	 ...
 * }
 */
app.options('/evaluate', cors()); // Pre-Flight
app.post('/evaluate', async (req, res) => {
	let answers = req.body

	try {
		assert.ok(answers, 'answers not present')
		const evaluation = await eval.evaluate(answers)
		res.json(evaluation)
	} catch (err) {
		res.status(500).send(err.message)
	}
})

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
app.options('/ticket', cors()); // Pre-Flight
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

		const { medical_priority, note, tags } = await eval.evaluate(answers)
		let priority = "1 low";
		if(medical_priority>prio_medium) {
			priority = "2 medium";
		}
		if(medical_priority > prio_high) {
			priority = "3 high";
		}
		const response = await zammad.createTicket({
			"title": "Rückrufwunsch Corona-Hotline Prio " + medical_priority,
			"group": "Users",
			"customer_id": user.id,
			"priority_id": priority,
			"article": {
				"subject": "Rückrufwunsch Corona-Hotline Prio "+medical_priority,
				"body": note,
				"type": "note",
				"internal": false
			},
			med_prio: medical_priority,
		})

		assert.ok(response.id, 'ticket creation failed');

		// Create Tags
		for(t of tags) {
			await zammad.addTag(response.id, t)
		}

		res.json({
			id: response.id,
			priority: response.priority_id,
			med_prio: response.med_prio,
			tags: tags

		})
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: error.message });
	}
})

app.listen(process.env.PORT || 3000, () => {
	console.debug('App listening on :3000');
});
