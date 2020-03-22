const superagent = require('superagent');
const assert = require('assert');

let tagParameters = [];
// Influenza 1
tagParameters.push({ name: "Influenza", condition: [{ "q31": "answer_yes" }, { "q26": "answer_yes" }, { "q32": "answer_no" }] });
tagParameters.push({ name: "Influenza", condition: [{ "q31": "answer_yes" }, { "q26": "answer_yes" }, { "q50":"answer_yes" }] });
tagParameters.push({ name: "Influenza", condition: [{ "q31": "answer_yes" }, { "q26": "answer_yes" }, { "q25": "answer_yes" }] });
tagParameters.push({ name: "Influenza", condition: [{ "q25": "answer_yes" }, { "q21": "answer_yes" }, { "q26": "answer_yes" }] });
tagParameters.push({ name: "Influenza", condition: [{ "q25": "answer_yes" }, { "q21": "answer_yes" }, { "q31": "answer_yes" }] });

// Erkältung
tagParameters.push({name: "Erkältung", condition: [{ "q33": "answer_no" }, { "q30": "answer_yes" }, { "q50": "answer_yes" }] });
tagParameters.push({name: "Erkältung", condition: [{ "q33": "answer_no" }, { "q28": "answer_yes" }, { "q50": "answer_yes" }] });
tagParameters.push({name: "Erkältung", condition: [{ "q21": "answer_no" }, { "q27": "answer_no" }, { "q50": "answer_yes" }] });
// Dringlich
tagParameters.push({ name: "Dringlich", condition: [{ "q21": "answer_yes" }, { "q18": "answer_yes" }] }); // Evtl. q18 -> q19 wegen Verdachtsfall

// Risikogruppen
tagParameters.push({ name: "Risikogruppe", condition: [{ "q37": "answer_yes" }] });
tagParameters.push({ name: "Risikogruppe", condition: [{ "q37": "answer_yes" }] }); // ToDo: Bluthochdruck only
tagParameters.push({ name: "Risikogruppe", condition: [{ "q34": "answer_yes" }] });
tagParameters.push({ name: "Risikogruppe", condition: [{ "q39": "answer_yes" }] });
tagParameters.push({ name: "Risikogruppe", condition: [{ "q35": "answer_yes" }] });
tagParameters.push({ name: "Risikogruppe", condition: [{ "q36": "answer_yes" }] });
tagParameters.push({ name: "Risikogruppe", condition: [{ "q40": "answer_yes" }] });
tagParameters.push({ name: "Risikogruppe", condition: [{ "q38": "answer_yes" }] });

// Information Only
tagParameters.push({ name: "Information", condition: [{ "q00a": "answer_yes" }, {"q00b": "answer_no"}]});

class Evaluation {
	constructor() {
		this.question_url = process.env.QUESTION_API_URL || "";
		console.debug("Connecting to question metadata at " + this.question_url);
		this.questions = {};
	}

	getQuestions() {
		return superagent.get(this.question_url).then(res => res.body)
	}

	/**
	 *
	 * questionId: optionId
	 * {
	 * 	q1: 2,
	 * 	q2: 3,
	 * 	q3: 1,
	 *  ...
	 * }
	 * @param {[string]: number} answers
	 */
	async evaluate(answers) {
		try {
			const questions = await this.getQuestions();
			let tags = [];
			let note = ''
			let medical_priority = 0
			// console.log(questions)
			// Questions and medical prio
			questions.forEach(question => {
				const answerOption = answers[question.id]
				if (answerOption === undefined) {
					// note+='  --- keine antwort --- \n'
				} else {
					note += question.text + '\n'
					if (question.options === null) {
						if (typeof answerOption === 'string' && Date.parse(answerOption)) {
							// answer option is date
							const d = new Date(answerOption)
							const year = new Intl.DateTimeFormat('de', { year: 'numeric' }).format(d)
							const month = new Intl.DateTimeFormat('de', { month: 'numeric' }).format(d)
							const day = new Intl.DateTimeFormat('de', { day: '2-digit' }).format(d)
							note += "> " + `${day}. ${month}. ${year}\n`
						} else {
							note += "> " + answerOption + '\n'
						}
						return
					}
					assert.ok(question.options, "question options not set");
					const answerValues = question.options.filter(option => option.id === answerOption)
					if (answerValues.length === undefined) {
						throw Error('question definition does not have option ' + answerOption)
					}
					const answerValue = answerValues[0]
					note += "> " + answerValue.text + '\n'
					medical_priority += answerValue.value || 0
				}
			});

			// Tags
			tagParameters.forEach(t => {
				let name = t.name;
				let active = true;
				let checked = false;
				t.condition.forEach(c => {
					// Check if key is in answers
					let c_key = Object.keys(c)[0];
					if (Object.keys(answers).includes(c_key)) {
						checked = true;
						if (c[c_key] !== answers[c_key]) {
							active = false;
						}
					}
				});
				if (checked != true) {
					active = false;
				}
				if (active) {
					if (!tags.includes(name)) {
						tags.push(name);
						// console.debug("Tag "+name+" active");
					}
				}
			});
			// End Tags
			return {
				note,
				medical_priority,
				tags
			};
		} catch (err) {
			console.error("Error getting Question Metadata!");
			console.error(err);
			throw Error(err.message);
		}
	}
}

module.exports = Evaluation;
