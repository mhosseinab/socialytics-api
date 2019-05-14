
const utils = require('./utils');

async function GetUserInfo (request, h) {
  console.log('GetUserInfo')
  try{
    let gis = await utils.generate_gis(`/${request.params.username}/`);
    let data = await utils.http_get(`https://www.instagram.com/${request.params.username}/?__a=1`,gis);
    return JSON.parse(data);
  } catch(e){
    console.log(e)
    return false
  }


}

module.exports =  GetUserInfo;
