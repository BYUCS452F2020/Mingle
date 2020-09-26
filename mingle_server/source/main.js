let express = require('express');
let bodyparser = require('body-parser');

let log = require('./log');

// JSON file containing configuration parameters that could differ by environment
let configuration = require('../config.json');

// If no port specified in configuration file, set to default.
configuration.server.port = configuration.server.port || 4000;
configuration.server.logLevel = configuration.log.logLevel || 'debug';

log.createLogger(configuration.log);
let logger = log.getLogger();

let app = express();

app.use(bodyparser.urlencoded({extended: false}));

// Login endpoint, takes a url encoded 'username' and 'password'
app.post('/login', (request, response) => {
    console.log(`Username: ${request.body.username}`);
    console.log(`Password: ${request.body.password}`);

    // Fake hardcoded credentials for testing.
    if (request.body.username == "test" && request.body.password == "password") {
        // Login success.
        response.sendStatus(200);
    } else {
        // Login failed, unauthorized.
        response.sendStatus(401);
    }
});

logger.info(`Listening on port ${configuration.server.port}`);
app.listen(configuration.port);
