
const request = require("request")
, crypto = require('crypto');

function md5(data){
  return crypto.createHash('md5').update(data).digest("hex");
}

function http_get(url, RHXGIS){
  return new Promise((resolve, reject) => {
    request.get({
      url: url,
      gzip: true,
      headers: {
        "accept" : "*/*",
        "accept-encoding": "gzip, deflate, br",
        "accept-language" : "en-US,en;q=0.5",
        "cache-control" : "no-cache",
        "dnt" : "1",
        "pragma" : "no-cache",
        "referer" : "https://www.instagram.com/instagram/",
        "user-agent" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0",
        "x-ig-app-id": "936619743392459",
        "x-requested-with" : "XMLHttpRequest",
        "x-instagram-gis" : RHXGIS||'',
      }
    }, (error, response, body) => {
      // console.log(response.request.headers)
      // console.log('body',body)
      if (error || response.statusCode != 200) {
        reject({message:`http ${response.statusCode}`})
        return;
      }
      resolve(body);
      return;
    });
  });
}

function get_rhx_gis(){
  return new Promise((resolve, reject) => {
    http_get("https://www.instagram.com/",null)
      .then(response => {
        let matches = response.match(/rhx_gis":"(\w+)/);
        if(matches){
          resolve(matches[1]);
          return;
        }
        // console.log(response)
        reject({message:'regex not found'})
        return;
      })
      .catch(error => reject(error));
  });
}

async function rhx_gis(){
  let rhx = null; //TODO: cache;
  if(!rhx){
    rhx = await get_rhx_gis()
  }
  return rhx;
}

async function generate_gis(queryVariables) {
  let rhx = await rhx_gis();
  // console.log('rhx', queryVariables)
  return md5(`${rhx}:${queryVariables}`) ;
}

module.exports = {
  md5,
  http_get,
  generate_gis,
}
