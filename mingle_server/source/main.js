let express = require('express');
let bodyparser = require('body-parser');
let configuration = require('./configuration')
let log = require('./log');
let database = require('./database');

let logger = log.getLogger();

database.connectToDatabase(configuration.database).then(() => {
    logger.debug(`Connection pool created`);
}).catch((exception) => {
    logger.error(`Failed to create connection pool`);
    logger.error(exception);
});

let app = express();

app.use(bodyparser.urlencoded({extended: false}));

// Endpoints

app.post('/register', async (request, response) => {
    logger.debug(`Request Body: ${JSON.stringify(request.body)}`);

    // Check that all required fields are present
    if (request.body.username && request.body.password && request.body.email) {

        if (await database.registerUser(request.body.username, request.body.password, request.body.email)) {
            // Registration success
            response.sendStatus(200);
        } else {
            // Conflict
            response.sendStatus(409);
        }
    } else {
        // Bad request
        response.sendStatus(400);
    }
});

// Login endpoint, takes a url encoded 'username' and 'password'
app.post('/login', async (request, response) => {
    logger.debug(`Request Body: ${JSON.stringify(request.body)}`);

    // Check that all required fields are present
    if (request.body.username && request.body.password) {

        if (await database.verifyUser(request.body.username, request.body.password)) {
            // Login success
            response.sendStatus(200);
        } else {
            // Unauthorized
            response.sendStatus(401);
        }
    } else {
        // Bad Request
        response.sendStatus(400);
    }
});

logger.info(`Listening on port ${configuration.server.port}`);
app.listen(configuration.server.port);
