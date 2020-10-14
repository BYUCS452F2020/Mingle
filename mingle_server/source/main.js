let express = require('express');
let bodyparser = require('body-parser');
let multer = require('multer');
let filesystem = require('fs');
let path = require('path');
let configuration = require('./configuration')
let log = require('./log');
let database = require('./database');

let storage = multer.diskStorage({
    destination: function (request, file, callback) {
        callback(null, configuration.storage.imageStoragePath);
    },
    filename: function (request, file, callback) {
        callback(null, file.originalname);
    }
})

let upload = multer({storage: storage});

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
    logger.info(`Request Body: ${JSON.stringify(request.body)}`);

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
    logger.info(`Request Body: ${JSON.stringify(request.body)}`);

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

// Upload profile picture
app.post('/profile/picture', upload.single('profilePicture'), async (request, response) => {
    if (request.body.username && request.file) {
        logger.info(`Received profile picture for user: ${request.body.username}`);
        await database.saveProfilePictureName(request.body.username, request.file.originalname);
        // Successfully loaded profile picture
        response.sendStatus(200);
    } else {
        // Bad Request
        response.sendStatus(400);
    }
})

app.get('/profile/picture/:username', async (request, response) => {
    let imageName = await database.getProfilePictureName(request.params.username);
    if (imageName) {
        let imagePath = path.join(__dirname, '..', configuration.storage.imageStoragePath, imageName);
        logger.debug(imagePath);
        if (filesystem.existsSync(imagePath)) {
            response.sendFile(imagePath);
        } else {
            response.sendStatus(404);
        }
    } else {
        response.sendStatus(404);
    }
})

logger.info(`Listening on port ${configuration.server.port}`);
app.listen(configuration.server.port);
