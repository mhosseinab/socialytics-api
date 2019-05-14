
const utils = require('./utils');

async function GetMediaComments (request, h) {
  let shortcode = request.params.shortcode;
  let first = request.params.first;
  let after = request.params.after;
  if(after==0) after = '';

  try{
    let variables = `{"shortcode":"${shortcode}","first":${first},"after":"${after}"}`
    let gis = await utils.generate_gis(variables);
    let data = await utils.http_get(`https://www.instagram.com/graphql/query/?query_hash=97b41c52301f77ce508f55e66d17620e&variables=${variables}`,gis);
    return JSON.parse(data);
  } catch(e){
    console.log(e)
    return false
  }


}

module.exports =  GetMediaComments;