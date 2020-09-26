let winston = require('winston');
const {combine, timestamp, printf} = winston.format;

let globalLogger;

const customFormat = printf(({level, message, timestamp, ...metadata}) => {
    let msg = `${timestamp} [${level}] : ${message} `
    return msg
});

module.exports = {
    createLogger: (configuration) => {
        let transports = [];
        let consoleTransport = new winston.transports.Console();
        transports.push(consoleTransport);

        if (configuration.file) {
            let fileTransport = new winston.transports.File({
                filename: configuration.file
            });
            transports.push(fileTransport);
        }

        globalLogger = winston.createLogger({
            level: configuration.level,
            format: combine(timestamp({format: 'YYYY-MM-DD HH:mm:ss'}), customFormat),
            transports: transports,
            exitOnError: false
        })
    },
    getLogger: () => globalLogger
};