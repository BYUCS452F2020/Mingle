const log = require('./log');

let configuration;
try {
    // JSON file containing configuration parameters that could differ by environment
    configuration = require('../config.json');
} catch (exception) {
    console.log("Failed to find a configuration file, see readme for details in creating a config file.");
    process.exit();
}

// If no port specified in configuration file, set to default.
configuration.server.port = configuration.server.port || 4000;
configuration.server.logLevel = configuration.log.logLevel || 'debug';

module.exports = configuration;

log.createLogger(configuration.log);