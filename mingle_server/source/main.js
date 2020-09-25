let express = require('express');
let bodyparser = require('body-parser');

// JSON file containing configuration parameters that could differ by environment
let configuration = require('../config.json');

// If no port specified in configuration file, set to default.
configuration.port = configuration.port || 4000;

let app = express();

app.use(bodyparser.urlencoded({ extended: false }));

// Login endpoint, takes a url encoded 'username' and 'password'
app.post('/login', (request, response) => {
    console.log(`Username: ${request.body.username}`);
    console.log(`Password: ${request.body.password}`);

    // Fake hardcoded credentials for testing.
    if (request.body.username == "test" && request.body.password == "password")
    {
        // Login success.
        response.sendStatus(200);
    }
    else
    {
        // Login failed, unauthorized.
        response.sendStatus(401);
    }
});

console.log(`Listening on port ${configuration.port}`);
app.listen(configuration.port);
