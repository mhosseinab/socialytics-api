
const utils = require('./utils');

async function GetUserMedia (request, h) {
  let userid = request.params.userid;
  let first = request.params.first;
  let after = request.params.after;
  if(after==0) after = '';

  try{
    let gis = await utils.generate_gis(`{"id":"${userid}","first":${first},"after":"${after}"}`);
    let data = await utils.http_get(`https://www.instagram.com/graphql/query/?query_hash=f2405b236d85e8296cf30347c9f08c2a&variables={"id":"${userid}","first":${first},"after":"${after}"}`,gis);
    return JSON.parse(data);
  } catch(e){
    console.log(e)
    return false
  }


}

module.exports =  GetUserMedia;