const main = require('./dist/main');
const handler = main.default || main;

module.exports = handler;
module.exports.default = handler;
