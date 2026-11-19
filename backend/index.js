// Vercel serverless entrypoint for DataChance CO Backend - Resilient Diagnostic Entrypoint
const fs = require('fs');
const path = require('path');

let handlerInstance = null;
let loadError = null;

function getHandler() {
  if (handlerInstance) return handlerInstance;
  if (loadError) throw loadError;

  const candidates = [
    path.join(__dirname, 'dist', 'bundle.js'),
    path.join(__dirname, 'dist', 'main.js'),
    path.join(process.cwd(), 'dist', 'bundle.js'),
    path.join(process.cwd(), 'dist', 'main.js'),
    path.join(process.cwd(), 'backend', 'dist', 'bundle.js'),
    path.join(process.cwd(), 'backend', 'dist', 'main.js'),
  ];

  let resolvedPath = null;
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      resolvedPath = c;
      break;
    }
  }

  if (!resolvedPath) {
    throw new Error(
      `Neither bundle.js nor dist/main.js found. Checked candidates: ${JSON.stringify(candidates)}. ` +
      `__dirname: ${__dirname}, cwd: ${process.cwd()}, ` +
      `__dirname files: ${JSON.stringify(fs.readdirSync(__dirname))}, ` +
      `cwd files: ${JSON.stringify(fs.readdirSync(process.cwd()))}`
    );
  }

  try {
    const bundle = require(resolvedPath);
    handlerInstance = typeof bundle === 'function' ? bundle : (bundle.default && typeof bundle.default === 'function' ? bundle.default : bundle);
    return handlerInstance;
  } catch (err) {
    loadError = err;
    throw err;
  }
}

const serverlessHandler = (req, res) => {
  const url = req.url || '';

  // 1. Endpoint ultra-ligero de ping
  if (url.includes('ping')) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    return res.end('PONG');
  }

  // 2. Endpoint de diagnóstico de runtime
  if (url.includes('diag')) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    let diag = {
      cwd: process.cwd(),
      dirname: __dirname,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
        hasDirectUrl: Boolean(process.env.DIRECT_URL),
        prismaQueryEngineLibrary: process.env.PRISMA_QUERY_ENGINE_LIBRARY || null,
      },
    };
    try {
      diag.cwdFiles = fs.readdirSync(process.cwd());
    } catch (e) {
      diag.cwdFilesError = e.message;
    }
    try {
      diag.dirnameFiles = fs.readdirSync(__dirname);
    } catch (e) {
      diag.dirnameFilesError = e.message;
    }
    try {
      const distDir = path.join(__dirname, 'dist');
      diag.distFiles = fs.existsSync(distDir) ? fs.readdirSync(distDir) : 'dist not found';
    } catch (e) {
      diag.distFilesError = e.message;
    }
    try {
      const nmPrisma = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
      diag.prismaClientFiles = fs.existsSync(nmPrisma) ? fs.readdirSync(nmPrisma) : '.prisma/client not found';
    } catch (e) {
      diag.prismaClientError = e.message;
    }
    return res.end(JSON.stringify(diag, null, 2));
  }

  // 3. Ejecución de la aplicación NestJS
  let fn;
  try {
    fn = getHandler();
  } catch (err) {
    console.error('CRITICAL: Error loading bundle.js:', err);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(
      JSON.stringify(
        {
          error: 'BUNDLE_LOAD_FAILURE',
          message: err?.message || String(err),
          stack: err?.stack || null,
          code: err?.code || null,
        },
        null,
        2,
      ),
    );
  }

  try {
    const result = fn(req, res);
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

module.exports = serverlessHandler;
module.exports.default = serverlessHandler;
