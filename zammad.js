class Zammad {
	constructor() {
		this.api_url = process.env.ZAMMAD_API_PATH || "https://zammad.example.com/api/";
		this.api_token = process.env.ZAMMAD_API_TOKEN || "exampletoken";
		console.debug("Connecting to zammad at "+this.api_url);
	}
}

module.exports = Zammad;
