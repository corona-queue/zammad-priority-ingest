const superagent = require('superagent');

class Evaluation {
	constructor() {
		this.question_url = process.env.QUESTION_API_URL || "";
		console.debug("Connecting to question metadata at "+this.question_url);
		this.questions = {};
	}

	_getQuestions() {
		return superagent.get(this.question_url).then((res) => {
			if(res.body) {
				this.questions = res.body;
			} else {
				throw Error("Invalid question body");
			}
		});
	}

	evaluate(answers) {
		this._getQuestions().then(() => {
			console.log(this.questions);
			const r = {};
			r["note"] = "Schön formatierte Informationen";
			r["medical_priority"] = 142;
			return r;
		}).catch((err) => {
			console.error("Error getting Question Metadata!");
			console.error(err);
			throw Error(err);
		});
	}
}

module.exports = Evaluation;
