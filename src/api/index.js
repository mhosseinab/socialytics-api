'use strict';

const Hapi = require('@hapi/hapi')
, firebase = require('../common/firebase')
, mongoose = require('../common/db')
, kue = require('kue')
, queue = kue.createQueue()
, API_VERSION = 'v1';

const server = Hapi.server({
  port: 5000,
  host: '0.0.0.0'
});

server.app.firebase = firebase;
server.app.mongoose = mongoose;
server.app.queue = queue;
//firebase db will be accessible via request.server.app.firebase.db

server.route({
  method: 'GET',
  path: '/',
  handler: (request, h) => {

    return 'socialytics API set';
  }
});

const init_server = async () => {
  await server.register([
    {
      plugin: require('./plugins/instawrapper'),
      routes: {
        prefix: `/${API_VERSION}/instawrapper`
      }
    }, 
    {
      plugin: require('./plugins/tools'),
      routes: {
        prefix: `/${API_VERSION}/tools`
      }
    }, 
  ]);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

const init = async () => {
  await init_server();
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

init();