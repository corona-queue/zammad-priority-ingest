const superagent = require('superagent');

let tagParameters = [];
// Influenza 1
tagParameters.push({name: "Influenza", condition: [{"q31":"answer_yes"},{"q26":"answer_yes"}]});


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
			// Questions and medical prio
			questions.forEach(question => {
				const answerOption  = answers[question.id]
				if (answerOption===undefined) {
					// note+='  --- keine antwort --- \n'
				} else {
					note += question.text + '\n'
					const answerValues = question.options.filter(option=>option.id===answerOption)
					if(answerValues.length===undefined){
						throw Error('question definition does not have option '+ answerOption)
					}
					const answerValue = answerValues[0]
					note+="> " + answerValue.text + '\n'
					medical_priority+=answerValue.value || 0
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
					if(Object.keys(answers).includes(c_key)) {
						checked = true;
						if(c[c_key]!==answers[c_key]) {
								active = false;
						}
					}
				});
				if(checked!=true) {
					active = false;
				}
				if(active) {
					if(!tags.includes(name)) {
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
