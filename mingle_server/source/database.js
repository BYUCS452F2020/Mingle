// Database Access Object stub

let connectToDatabase = (configuration) => {
    // TODO: initialize database connection here
}


let registerUser = (username, password, email) => {
    return true;
}

let verifyUser = (username, password) => {
    return true;
}



module.exports = {
    connectToDatabase: connectToDatabase,
    verifyUser: verifyUser,
    registerUser: registerUser
}