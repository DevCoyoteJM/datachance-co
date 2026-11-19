// Vercel serverless entrypoint proxy - points to index.js
const handler = require('./index.js');

module.exports = handler;
module.exports.default = handler;
