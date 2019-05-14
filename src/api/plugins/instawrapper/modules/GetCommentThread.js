
const utils = require('./utils');

async function GetCommentThread (request, h) {
  let comment_id = request.params.comment_id;
  let first = request.params.first;
  let after = request.params.after;
  if(after==0) after = '';

  try{
    let variables = `{"comment_id":"${comment_id}","first":${first},"after":"${after}"}`
    let gis = await utils.generate_gis(variables);
    let data = await utils.http_get(`https://www.instagram.com/graphql/query/?query_hash=51fdd02b67508306ad4484ff574a0b62&variables=${variables}`,gis);
    return JSON.parse(data);
  } catch(e){
    console.log(e)
    return false
  }


}

module.exports =  GetCommentThread;