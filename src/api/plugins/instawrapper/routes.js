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
      { 
        method: 'GET', path: '/mediacomments/{shortcode}/{first}/{after}', 
        config: { 
          handler: MODULE.GetMediaComments,
        } 
      },
      { 
        method: 'GET', path: '/commentthread/{comment_id}/{first}/{after}', 
        config: { 
          handler: MODULE.GetCommentThread,
        } 
      },
  ];
};