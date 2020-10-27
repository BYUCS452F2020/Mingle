let mysql = require('mysql2/promise');
let log = require('./log');

let logger = log.getLogger();

let connectionPool;

let connectToDatabase = async (configuration) => {
    logger.info(`Database configuration: ${JSON.stringify(configuration)}`);
    connectionPool = await mysql.createPool(configuration);
}


let registerUser = async (username, password, email, latitude, longitude) => {
    try {
        await connectionPool.query('INSERT INTO Users (username, password, email, latitude, longitude) VALUES (?, ?, ?, ?, ?)', [username, password, email, latitude, longitude]);
        await connectionPool.query('INSERT INTO Friends (username) VALUES (?)', [username]);
        logger.info(`Added user ${username} to database`);
    } catch (exception) {
        logger.error(exception);
        return false;
    }
    return true;
}

let verifyUser = async (username, password) => {
    try {
        let result = await connectionPool.query('SELECT username, password FROM Users WHERE username = ? AND password = ?', [username, password]);
        let returnedRows = result[0];
        if (returnedRows.length > 0) {
            return true;
        } else {
            return false;
        }
    } catch (exception) {
        logger.error(exception);
        return false;
    }
}

let setUserLocation = async (username, latitude, longitude) => {
    try {
        await connectionPool.query('UPDATE Users SET latitude = ?, longitude = ? WHERE username = ?', [latitude, longitude, username]);
    } catch (exception) {
        logger.error(exception);
        return false;
    }
    return true;
}

let saveProfileInformation = async (username, firstName, homeTown, age, state, country, aboutMe, verified) => {
    try {
        let query = 'UPDATE Friends ' +
            'SET ' +
            'first_name = ?, ' +
            'hometown = ?, ' +
            'age = ?, ' +
            'state = ?, ' +
            'country = ?, ' +
            'about_me = ?, ' +
            'verified_profile = ? ' +
            'WHERE username = ?';
        let parameters = [
            firstName,
            homeTown,
            age,
            state,
            country,
            aboutMe,
            verified,
            username
        ]
        await connectionPool.query(query, parameters);
    } catch (exception) {
        logger.error(exception);
        return false;
    }
    return true;
}

let setMatchedFriends = async (username, otherUsername) => {
    try {
        await connectionPool.query('INSERT INTO Matching_Friends (username, matching_username) VALUES (?, ?)', [username, otherUsername]);
    } catch (exception) {
        logger.error(exception);
        return false;
    }
    return true;
}

let saveProfilePictureName = async (username, image) => {
    try {
        await connectionPool.query('UPDATE Friends SET Profile_Picture = ? WHERE username = ?', [image, username]);
        logger.info(`Added user ${username} to database`);
    } catch (exception) {
        logger.error(exception);
        return false;
    }
    return true;
}

let getProfilePictureName = async (username) => {
    try {
        let result = await connectionPool.query('SELECT profile_picture FROM Friends WHERE username = ?', [username]);
        let returnedRows = result[0];
        if (returnedRows.length > 0) {
            return returnedRows[0].profile_picture;
        } else {
            return "";
        }
    } catch (exception) {
        logger.error(exception);
        return "";
    }
}

let getProfileInformation = async (username) => {
    try {
        let result = await connectionPool.query('SELECT * FROM Friends WHERE username = ?', [username]);
        let returnedRows = result[0];
        if (returnedRows.length > 0) {
            return returnedRows[0];
        } else {
            return ""
        }
    } catch (exception) {
        logger.error(exception);
        return "";
    }
}

let getFriendsOfUser = async (username) => {
    try {
        let query = 'SELECT Friends.* FROM Friends JOIN Matching_Friends ON Friends.username = Matching_Friends.username WHERE matching_username = ? ' +
            'UNION SELECT Friends.* FROM Friends JOIN Matching_Friends ON Friends.username = Matching_Friends.matching_username WHERE Matching_Friends.username = ? ';
        let result = await connectionPool.query(query, [username, username]);
        return result[0];
    } catch (exception) {
        logger.error(exception);
        return [];
    }
}

let getAllUnmatchedProfilesForUser = async (username) => {
    try {
        let query = 'SELECT Friends.* FROM Friends WHERE username != ? AND username NOT IN ' +
            '(SELECT matching_username FROM Matching_Friends WHERE username = ? ' +
            'UNION SELECT username FROM Matching_Friends WHERE matching_username = ?)';
        let result = await connectionPool.query(query, [username, username, username]);
        return result[0];
    } catch (exception) {
        logger.error(exception);
        return [];
    }
}

module.exports = {
    connectToDatabase: connectToDatabase,
    verifyUser: verifyUser,
    registerUser: registerUser,
    setUserLocation: setUserLocation,
    setMatchedFriends: setMatchedFriends,
    saveProfileInformation: saveProfileInformation,
    saveProfilePictureName: saveProfilePictureName,
    getProfilePictureName: getProfilePictureName,
    getProfileInformation: getProfileInformation,
    getFriendsOfUser: getFriendsOfUser,
    getAllUnmatchedProfilesForUser: getAllUnmatchedProfilesForUser,
}
