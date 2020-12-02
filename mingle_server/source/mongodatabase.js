const mongoose = require('mongoose');
const log = require('./log');

let logger = log.getLogger();

let connection;

let User;
let Friend;
let Event;

let connectToDatabase = async (configuration) => {
    console.log('Attempting to connect to MongoDB');
    mongoose.connect('mongodb://localhost:27017/mingle', { useNewUrlParser: true, useUnifiedTopology: true });
    connection = mongoose.connection;
    connection.on('error', console.error.bind(console, 'connection error:'));
    connection.once('open', () => {
        console.log('Connected to MongoDB');
    });

    let UserSchema = mongoose.Schema({
        username: String,
        password: String,
        email: String,
        latitude: Number,
        longitude: Number,
    });

    let FriendSchema = mongoose.Schema({
        username: String,
        firstName: String,
        homeTown: String,
        age: Number,
        state: String,
        country: String,
        aboutMe: String,
        verified: Boolean,
        friends: Array,
        events: Array,
        profilePicture: String,
    });

    let EventsSchema = mongoose.Schema({
        eventId: String,
        username: String,
        location: String,
        latitude: Number,
        longitude: Number,
        dateTime: Date,
        eventDescription: String,
        otherInformation: String,
        verified: Boolean,
        image: String,
    });

    User = mongoose.model('User', UserSchema, 'Users');
    Friend = mongoose.model('Friend', FriendSchema, 'Friends');
    Event = mongoose.model('Event', EventsSchema, 'Events');
}


let registerUser = async (username, password, email) => {
    try {
        let result = await User.find({ username: username, email: email });
        if (result.length > 0)
        {
            return false;
        }
        let user = new User({
            username: username,
            password: password,
            email: email,
        });
        user.save();
    } catch (exception) {
        logger.error(exception);
        return false;
    }
    return true;
}

let verifyUser = async (username, password) => {
    try {
        let result = await User.find({ username: username, password: password });
        return result.length > 0;
    } catch (exception) {
        logger.error(exception);
        return false;
    }
}

let setUserLocation = async (username, latitude, longitude) => {
    try {
        let result = await User.update({ username: username }, { latitude: latitude, longitude: longitude });
    } catch (exception) {
        logger.error(exception);
        return false;
    }
    return true;
}

let saveProfileInformation = async (username, firstName, homeTown, age, state, country, aboutMe, verified) => {
    try {
        let result = await Friend.find({ username: username });
        if (result.length > 0)
        {
            await Friend.update({ username: username }, {
                username: username,
                firstName: firstName,
                homeTown: homeTown,
                age: age,
                state: state,
                country: country,
                aboutMe: aboutMe,
                verified: verified,
            });
        }
        else
        {
            let friend = new Friend({
                username: username,
                firstName: firstName,
                homeTown: homeTown,
                age: age,
                state: state,
                country: country,
                aboutMe: aboutMe,
                verified: verified,
            });
            friend.save();
        }
    } catch (exception) {
        logger.error(exception);
        return false;
    }
    return true;
}

let setMatchedFriends = async (username, otherUsername) => {
    try {
        await Friend.findOneAndUpdate({ username: username },
            { $push: { friends: otherUsername } },
            { safe: true, upsert: true },
        );
        await Friend.findOneAndUpdate({ username: otherUsername },
            { $push: { friends: username } },
            { safe: true, upsert: true },
        );
    } catch (exception) {
        logger.error(exception);
        return false;
    }
    return true;
}

let saveProfilePictureName = async (username, image) => {
    try {
        await Friend.update({ username: username }, { profilePicture: image });
    } catch (exception) {
        logger.error(exception);
        return false;
    }
    return true;
}

let saveEventImageName = async (eventId, image) => {
    try {
        await Event.update({ eventId: eventId }, { image: image });
    } catch (exception) {
        logger.error(exception);
        return false;
    }
    return true;
}

let getProfilePictureName = async (username) => {
    try {
        let result = await Friend.find({ username: username });
        if (result.length <= 0)
        {
            return "";
        }
        return result;
    } catch (exception) {
        logger.error(exception);
        return "";
    }
}

let getEventImageName = async (eventId) => {
    try {
        let result = await Event.find({ eventId: eventId });
        if (result.length <= 0)
        {
            return "";
        }
    } catch (exception) {
        logger.error(exception);
        return "";
    }
}

let getProfileInformation = async (username) => {
    try {
        let result = await Friend.find({ username: username });
        if (result.length <= 0)
        {
            return "";
        }
        delete result[0].friends;
        delete result[0].events;
        return result[0];
    } catch (exception) {
        logger.error(exception);
        return "";
    }
}

let getFriendsOfUser = async (username) => {
    try {
        let result = await Friend.find({username: username});
        if (result.length <= 0) return [];
        result = result[0];
        let profiles = await Friend.find({});
        let friends = [];
        for (let profile of profiles)
        {
            if (profile.username == username) continue;
            if (result.friends.includes(profile.username))
            {
                delete profile.friends;
                delete profile.events;
                friends.push(profile);
            }
        }
        return friends;
    } catch (exception) {
        logger.error(exception);
        return [];
    }
}

let getAllUnmatchedProfilesForUser = async (username) => {
    try {
        let result = await Friend.find({});
        let unmatched = [];
        for (let profile of result)
        {
            if (profile.username === username) continue;
            if (!profile.friends.includes(username))
            {
                delete profile.friends;
                delete profile.events;
                unmatched.push(profile);
            }
        }
        return unmatched;
    } catch (exception) {
        logger.error(exception);
        return [];
    }
}

let createEvent = async (eventId, username, location, latitude, longitude, dateTime, eventDescription, otherInformation, verified) => {
    try {
        let event = new Event({
            eventId: eventId,
            username: username,
            location: location,
            latitude: latitude,
            longitude: longitude,
            dateTime: dateTime,
            eventDescription: eventDescription,
            otherInformation: otherInformation,
            verified: verified,
        });
        event.save();
    } catch (exception) {
        logger.error(exception);
        return false;
    }
    return true;
}

let getEventsOfUser = async (username) => {
    try {
        let result = await Friend.find({username: username});
        if (result.length <= 0) return [];
        result = result[0];
        let events = await Event.find({});
        let userEvents = [];
        for (let event of events)
        {
            if (result.events.includes(event.eventId) || event.username == username)
            {
                userEvents.push(event);
            }
        }
        return userEvents;
    } catch (exception) {
        logger.error(exception);
        return [];
    }
}

let getAllUnmatchedEventsForUser = async (username) => {
    try {
        let result = await Friend.find({username: username});
        if (result.length <= 0) return [];
        result = result[0];
        let events = await Event.find({});
        let userEvents = [];
        for (let event of events)
        {
            if (!result.events.includes(event.eventId))
            {
                userEvents.push(event);
            }
        }
        return userEvents;
    } catch (exception) {
        logger.error(exception);
        return [];
    }
}

let setMatchedEvent = async (username, eventId) => {
    try {
        await Friend.findOneAndUpdate({ username: username },
            { $push: { events: eventId } },
            { safe: true, upsert: true },
        );
    } catch (exception) {
        logger.error(exception);
        return false;
    }
    return true;
}

module.exports = {
    connectToDatabase: connectToDatabase,
    verifyUser: verifyUser,
    registerUser: registerUser,
    setUserLocation: setUserLocation,
    setMatchedFriends: setMatchedFriends,
    saveProfileInformation: saveProfileInformation,
    saveProfilePictureName: saveProfilePictureName,
    saveEventImageName: saveEventImageName,
    getProfilePictureName: getProfilePictureName,
    getEventImageName: getEventImageName,
    getProfileInformation: getProfileInformation,
    getFriendsOfUser: getFriendsOfUser,
    getAllUnmatchedProfilesForUser: getAllUnmatchedProfilesForUser,
    createEvent: createEvent,
    getEventsOfUser: getEventsOfUser,
    getAllUnmatchedEventsForUser: getAllUnmatchedEventsForUser,
    setMatchedEvent: setMatchedEvent,
}
