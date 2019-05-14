const MODULE = require('./modules');
const Joi = require('joi');

module.exports = function routes (options) {
  return [
      { 
        method: 'GET', path: '/userinfo/{username}', 
        config: { 
          handler: MODULE.GetUserInfo,
        } 
      },
      { 
        method: 'GET', path: '/usermedia/{userid}/{first}/{after}', 
        config: { 
          handler: MODULE.GetUserMedia,
        } 
      },
  ];
};