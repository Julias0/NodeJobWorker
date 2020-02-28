let express = require('express');
require('dotenv').config();
require('./db');
var bodyParser = require('body-parser');

require('./jobHandler').init();

let jobRequestRouter = require('./routers/jobRequest');

let app = express();

app.use(bodyParser.json());
app.use('/job', jobRequestRouter);

app.listen(process.env.PORT, function () {
   console.log(`listening on port ${process.env.PORT}`); 
});