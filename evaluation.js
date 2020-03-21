const superagent = require('superagent');

class Evaluation {
	constructor() {
		this.question_url = process.env.QUESTION_API_URL || "";
		console.debug("Connecting to question metadata at "+this.question_url);
		this.questions = {};
	}

	_getQuestions() {
		return superagent.get(this.question_url).then((res) => {
			this.questions = res;
		});
	}

	evaluate(questions) {
		this._getQuestions().then(() => {
			console.log(this.questions);
		}).catch((err) => {
			console.error("Error getting Question Metadata!");
			console.error(err);
		});
	}
}

module.exports = Evaluation;
