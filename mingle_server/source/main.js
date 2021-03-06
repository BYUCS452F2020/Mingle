let express = require('express');
let bodyparser = require('body-parser');
let multer = require('multer');
let filesystem = require('fs');
let path = require('path');
let configuration = require('./configuration')
let log = require('./log');
let database = require('./mongodatabase');

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
    logger.debug(`Connected to database`);
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

app.post('/profile', async (request, response) => {
    if (request.body.username &&
        request.body.firstName &&
        request.body.homeTown &&
        request.body.age &&
        request.body.state &&
        request.body.country &&
        request.body.aboutMe &&
        request.body.verified) {
        if (await database.saveProfileInformation(
            request.body.username,
            request.body.firstName,
            request.body.homeTown,
            request.body.age,
            request.body.state,
            request.body.country,
            request.body.aboutMe,
            request.body.verified === "true" || request.body.verified === "True")) {
            // Successfully saved profile information
            response.sendStatus(200);
        } else {
            // Bad request, can't think of a better way to categorize this failure at the moment
            response.sendStatus(400);
        }
    } else {
        // Bad Request
        response.sendStatus(400);
    }
});

app.post('/profile/location', async (request, response) => {
    if (request.body.username && request.body.latitude && request.body.longitude) {
        if (await database.setUserLocation(request.body.username, request.body.latitude, request.body.longitude)) {
            response.sendStatus(200);
        } else {
            // Bad request, can't think of a better way to categorize this failure at the moment
            response.sendStatus(400);
        }
    } else {
        // Bad Request
        response.sendStatus(400);
    }
})

app.post('/profile/friend', async (request, response) => {
    if (request.body.username && request.body.otherUsername) {
        if (await database.setMatchedFriends(request.body.username, request.body.otherUsername)) {
            response.sendStatus(200);
        } else {
            // Conflict
            response.sendStatus(409);
        }
    } else {
        // Bad Request
        response.sendStatus(400);
    }
})

// Upload profile picture
app.post('/profile/picture', upload.single('profilePicture'), async (request, response) => {
    console.log('/profile/picture');
    if (request.body.username && request.file) {
        await database.saveProfilePictureName(request.body.username, request.file.originalname);
        // Successfully loaded profile picture
        response.sendStatus(200);
    } else {
        // Bad Request
        response.sendStatus(400);
    }
});

// Upload profile picture
app.post('/event/picture', upload.single('eventPicture'), async (request, response) => {
    if (request.body.eventId && request.file) {
        await database.saveEventImageName(request.body.eventId, request.file.originalname);
        // Successfully loaded event picture
        response.sendStatus(200);
    } else {
        // Bad Request
        response.sendStatus(400);
    }
});

app.get('/profile/picture/:username', async (request, response) => {
    let imageName = await database.getProfilePictureName(request.params.username);
    if (imageName) {
        let imagePath = path.join(configuration.storage.imageStoragePath, imageName);
        logger.debug(path.join(configuration.storage.imageStoragePath, imageName));
        if (filesystem.existsSync(imagePath)) {
            response.sendFile(imagePath);
        } else {
            response.sendStatus(404);
        }
    } else {
        response.sendStatus(404);
    }
});

app.get('/event/picture/:eventId', async (request, response) => {
    let imageName = await database.getEventImageName(request.params.eventId);
    if (imageName) {
        let imagePath = path.join(configuration.storage.imageStoragePath, imageName);
        logger.debug(path.join(configuration.storage.imageStoragePath, imageName));
        if (filesystem.existsSync(imagePath)) {
            response.sendFile(imagePath);
        } else {
            response.sendStatus(404);
        }
    } else {
        response.sendStatus(404);
    }
});

app.get('/profile/:username', async (request, response) => {
    let profile = await database.getProfileInformation(request.params.username);
    if (profile) {
        response.send(profile);
    } else {
        response.sendStatus(404);
    }
});

app.get('/profile/:username/friends', async (request, response) => {
    let friends = await database.getFriendsOfUser(request.params.username);
    response.send(friends);
});

app.get('/profile/:username/friends/potential', async (request, response) => {
    // In theory there would be some algorithm here to get potential friends based on some criteria, right now this just
    // returns a list of all profiles that the user has not matched with.
    let friends = await database.getAllUnmatchedProfilesForUser(request.params.username);
    response.send(friends);
});

app.post('/event', async (request, response) => {
    if (request.body.eventId &&
        request.body.username &&
        request.body.location &&
        request.body.latitude &&
        request.body.longitude &&
        request.body.dateTime &&
        request.body.eventDescription &&
        request.body.otherInformation &&
        request.body.verified) {
        if (await database.createEvent(
            request.body.eventId,
            request.body.username,
            request.body.location,
            request.body.latitude,
            request.body.longitude,
            request.body.dateTime,
            request.body.eventDescription,
            request.body.otherInformation,
            request.body.verified === "true" || request.body.verified === "True")) {
            // Successfully saved event information
            response.sendStatus(200);
        } else {
            // Bad request, can't think of a better way to categorize this failure at the moment
            response.sendStatus(400);
        }
    } else {
        // Bad Request
        response.sendStatus(400);
    }
});

app.get('/profile/:username/events', async (request, response) => {
    let events = await database.getEventsOfUser(request.params.username);
    response.send(events);
});

app.get('/profile/:username/events/potential', async (request, response) => {
    // In theory there would be some algorithm here to get potential friends based on some criteria, right now this just
    // returns a list of all profiles that the user has not matched with.
    let events = await database.getAllUnmatchedEventsForUser(request.params.username);
    response.send(events);
});

app.post('/profile/event', async (request, response) => {
    if (request.body.username && request.body.eventId) {
        if (await database.setMatchedEvent(request.body.username, request.body.eventId)) {
            response.sendStatus(200);
        } else {
            // Conflict
            response.sendStatus(409);
        }
    } else {
        // Bad Request
        response.sendStatus(400);
    }
})

logger.info(`Listening on port ${configuration.server.port}`);
app.listen(configuration.server.port);
