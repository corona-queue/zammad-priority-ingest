const express = require('express');
const morgan = require('morgan');

const app = express();
app.use(express.json());

app.get('/', (req,res) => {
	res.json({});
});
app.listen(3000, () => {
	console.debug('App listening on :3000');
});
