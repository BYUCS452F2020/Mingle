let mysql = require('mysql2/promise');
let log = require('./log');

let logger = log.getLogger();

let connectionPool;

let connectToDatabase = async (configuration) => {
    logger.info(`Database configuration: ${JSON.stringify(configuration)}`);
    connectionPool = await mysql.createPool(configuration);
}


let registerUser = async (username, password, email) => {
    try {
        await connectionPool.query('INSERT INTO Users (username, password, email) VALUES (?, ?, ?)', [username, password, email]);
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
    return true;
}


module.exports = {
    connectToDatabase: connectToDatabase,
    verifyUser: verifyUser,
    registerUser: registerUser
}