// Vercel serverless entrypoint for DataChance CO Backend - Safe CommonJS
let handlerInstance = null;
let initError = null;

try {
  const bundle = require('./dist/bundle.js');
  handlerInstance = typeof bundle === 'function' ? bundle : (bundle.default && typeof bundle.default === 'function' ? bundle.default : bundle);
} catch (err) {
  console.error('Fatal error loading bundle.js:', err);
  initError = err;
}

const entrypointHandler = (req, res) => {
  if (initError) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(
      JSON.stringify(
        {
          error: 'BUNDLE_LOAD_ERROR',
          message: initError.message,
          stack: initError.stack,
          code: initError.code,
        },
        null,
        2,
      ),
    );
  }

  try {
    const result = handlerInstance(req, res);
    if (result && typeof result.catch === 'function') {
      result.catch((asyncErr) => {
        console.error('Async Handler Error:', asyncErr);
        if (!res.headersSent) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify(
              {
                error: 'ASYNC_HANDLER_ERROR',
                message: asyncErr?.message || String(asyncErr),
                stack: asyncErr?.stack || null,
              },
              null,
              2,
            ),
          );
        }
      });
    }
    return result;
  } catch (err) {
    console.error('Sync Handler Error:', err);
    if (!res.headersSent) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify(
          {
            error: 'SYNC_HANDLER_ERROR',
            message: err?.message || String(err),
            stack: err?.stack || null,
          },
          null,
          2,
        ),
      );
    }
  }
};

module.exports = entrypointHandler;
module.exports.default = entrypointHandler;
