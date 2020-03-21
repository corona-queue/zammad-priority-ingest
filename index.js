const express = require('express');
const morgan = require('morgan');
const jsonErrorHandler = require('express-json-error-handler').default;

const app = express();
app.use(express.json());
app.use(jsonErrorHandler());

app.get('/', (req,res) => {
	res.json({});
});

app.listen(3000, () => {
	console.debug('App listening on :3000');
});
