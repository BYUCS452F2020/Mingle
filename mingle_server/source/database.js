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
    saveProfilePictureName: saveProfilePictureName,
    getProfilePictureName: getProfilePictureName
}
