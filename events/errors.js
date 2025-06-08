const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, '../data/error.log');

function logError(error, context = '') {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}]${context ? ' [' + context + ']' : ''} ${error.stack || error}\n`;
    fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
    fs.appendFileSync(LOG_PATH, message);
}

process.on('uncaughtException', error => {
    console.error('Uncaught Exception:', error);
    logError(error, 'uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    logError(reason, 'unhandledRejection');
});

module.exports = { logError };