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


module.exports = {
    connectToDatabase: connectToDatabase,
    verifyUser: verifyUser,
    registerUser: registerUser,
    setUserLocation: setUserLocation,
    saveProfileInformation: saveProfileInformation,
    saveProfilePictureName: saveProfilePictureName,
    getProfilePictureName: getProfilePictureName
}
