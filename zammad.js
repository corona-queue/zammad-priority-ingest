const superagent = require('superagent');

class Zammad {
	constructor() {
		this.api_url = process.env.ZAMMAD_API_PATH || "https://zammad.example.com/api/";
		this.api_token = process.env.ZAMMAD_API_TOKEN || "exampletoken";
		console.debug("Connecting to zammad at "+this.api_url);
	}

	_get(command){
		return superagent.get(this.api_url+command).set("Authorization", "Token token="+this.api_token).then(response=>response.body)
	}

	_post(command, data){
		return superagent.post(this.api_url+command).set("Authorization", "Token token="+this.api_token).send(data).then(response=>response.body)
	}

	createTicket(ticket){
		return this._post('v1/tickets', ticket)
	}

	listTickets() {
		return this._get('v1/tickets')
	}

	createUser(user){
		return this._post('v1/users', user)
	}


	listUsers() {
		return this._get('v1/users')
	}
}

module.exports = Zammad;
