import path from 'path';
import debug from 'debug';

import koa from 'koa';
import jade from 'koa-jade';
import mount from 'koa-mount';
import helmet from 'koa-helmet';
import logger from 'koa-logger';
import favicon from 'koa-favicon';
import staticCache from 'koa-static-cache';
import responseTime from 'koa-response-time';

import router from './router';
import config from './config/init';

const app = koa();
const env = process.env.NODE_ENV || 'development';

// add header `X-Response-Time`
app.use(responseTime());
app.use(logger());

// various security headers
app.use(helmet.defaults());

if (env === 'production') {
  // set debug env to `koa` only
  // must be set programmaticaly for windows
  debug.enable('koa');

  // load production middleware
  app.use(require('koa-conditional-get')());
  app.use(require('koa-etag')());
  app.use(require('koa-compressor')());

  // Cache pages
  const cache = require('lru-cache')({maxAge: 3000});
  app.use(require('koa-cash')({
    get: function* (key) {
      return cache.get(key);
    },
    set: function* (key, value) {
      cache.set(key, value);
    }
  }));
}

if (env === 'development') {
  // set debug env, must be programmaticaly for windows
  debug.enable('dev,koa');
  // log when process is blocked
  require('blocked')((ms) => debug('koa')(`blocked for ${ms}ms`));
}

app.use(favicon(path.join(__dirname, '../app/images/favicon.ico')));

// Template middleware
app.use(jade.middleware({
  viewPath: path.join(__dirname, '/views')
}));

const cacheOpts: Object = {maxAge: 86400000, gzip: true};

// Proxy asset folder to webpack development server in development mode
if (env === 'development') {
  const webpackConfig: Object = require('./../webpack/dev.config');
  app.use(mount('/assets', require('koa-proxy')({host: `http://0.0.0.0:${webpackConfig.server.port}`})));
} else {
  app.use(mount('/assets', staticCache(path.join(__dirname, '../dist'), cacheOpts)));
}

app.use(router);

app.listen(config.port);

// Tell parent process koa-server is started
if (process.send) process.send('online');
debug('koa')(`Application started on port ${config.port}`);
