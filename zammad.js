const Request = require('request');

class Zammad {
	constructor() {
		this.api_url = process.env.ZAMMAD_API_PATH || "https://zammad.example.com/api/";
		this.api_token = process.env.ZAMMAD_API_TOKEN || "exampletoken";
		console.debug("Connecting to zammad at "+this.api_url);
		this.request = Request.defaults({
			baseUrl: this.api_url,
			headers: {
				"Authorization": "Token token="+this.api_token
			}
		});
	}

	test() {
		this.request.get('v1/users',(error, response) => {
			console.log(error);
			console.log(response);
		});
	}
}

module.exports = Zammad;
