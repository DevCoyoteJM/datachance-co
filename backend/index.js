// Vercel serverless entrypoint - Pure CommonJS
const bundle = require('./dist/bundle.js');
const handler = typeof bundle === 'function' ? bundle : (bundle.default && typeof bundle.default === 'function' ? bundle.default : bundle);

module.exports = handler;
module.exports.default = handler;
