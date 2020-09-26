let express = require('express');
let bodyparser = require('body-parser');

let log = require('./log');
let database = require('./database');

// JSON file containing configuration parameters that could differ by environment
let configuration = require('../config.json');

// If no port specified in configuration file, set to default.
configuration.server.port = configuration.server.port || 4000;
configuration.server.logLevel = configuration.log.logLevel || 'debug';

log.createLogger(configuration.log);
let logger = log.getLogger();

// TODO: Pass database configuration details in here once they are added to the configuration file.
database.connectToDatabase();

let app = express();

app.use(bodyparser.urlencoded({extended: false}));

app.post('/register', (request, response) => {
    logger.debug(`Username: ${request.body.username}`);
    logger.debug(`Password: ${request.body.password}`);
    logger.debug(`Email: ${request.body.email}`);

    // Check that all required fields are present
    if (request.body.username && request.body.password && request.body.email) {

        if (database.registerUser(request.body.username, request.body.password, request.body.email)) {
            // Registration success
            response.sendStatus(200);
        } else {
            // Conflict
            response.sendStatus(409);
        }
    }
    else {
        // Bad request
        response.sendStatus(400);
    }

    response.sendStatus(200);
});

// Login endpoint, takes a url encoded 'username' and 'password'
app.post('/login', (request, response) => {
    logger.debug(`Username: ${request.body.username}`);
    logger.debug(`Password: ${request.body.password}`);

    // Check that all required fields are present
    if (request.body.username && request.body.password) {

        if (database.verifyUser(request.body.username, request.body.password)) {
            // Login success
            response.sendStatus(200);
        } else {
            // Login failure
            response.sendStatus(401);
        }
    }
    else {
        // Bad Request
        response.sendStatus(400);
    }
});

logger.info(`Listening on port ${configuration.server.port}`);
app.listen(configuration.server.port);
