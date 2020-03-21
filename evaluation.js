const superagent = require('superagent');

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
			})
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
