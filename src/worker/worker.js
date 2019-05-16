const kue = require('kue')
 , queue = kue.createQueue()
 , axios = require("axios")
 , firebase = require('../common/firebase')
 , firestore = firebase.firestore;

const GetInstaComments = (server, post_id, first = 200, after=0) =>{
  return new Promise((resolve, reject) => {
    axios.get(`${server}/v1/instawrapper/mediacomments/${post_id}/${first}/${after}`)
    .then(response => {
      response.post_id = post_id
      response.server_url = server
      resolve(response)
    })
    .catch(err => reject(err))
  });
}

const ParseInstaComments = response =>{
  let post_id = response.post_id;
  let json = response.data;
  if(!json)
    return false
  const count = json.data.shortcode_media.edge_media_to_parent_comment.count;
  const page_info = json.data.shortcode_media.edge_media_to_parent_comment.page_info;
  const comments = json.data.shortcode_media.edge_media_to_parent_comment.edges;
  let cleaned_comments = {}
  
  for(let key in comments) {

    let comment = {}
    let node = comments[key].node
    comment.text = node.text
    comment.created_at = new Date(node.created_at*1000)
    comment.owner = {}
    comment.owner.username = node.owner.username
    comment.owner.id = node.owner.id
    comment.owner.is_verified = node.owner.is_verified
    comment.owner.profile_pic_url = node.owner.profile_pic_url
    comment.mention = comment.text.match(/\@[^\s\#]*/g) || [];
    comment.hashtag = comment.text.match(/\#[^\s\@]*/g) || [];
    if(node.edge_liked_by.count>0) comment.likes_count = node.edge_liked_by.count

    cleaned_comments[node.id]=comment

  }

  if(page_info.has_next_page){ 

    console.log('has next page: ', page_info.end_cursor)
    
    queue.create('post_comments', {
        post_id: response.post_id
      , first: 100
      , after: page_info.end_cursor
      , server : response.server_url
    }).priority('normal').attempts(3).ttl(60*1000).backoff( {delay: 60*1000, type:'exponential'} )
      .save()
    
  }

  return {comments:cleaned_comments, count, page_info, post_id}
}

const SaveInstaComments = (result) =>{
  return new Promise((resolve, reject) => {
    if(!result)
      return false;
    let post_id = result.post_id;
    console.log('post_id', post_id);
    firestore.doc(`instacomments/${post_id}`).get()
    .then( doc => {
        
      if(!doc.exists || doc.data().count != result.count){
        console.log('doc not exists');
        firestore.doc(`instacomments/${post_id}`).set({count:result.count})
        .then(()=>{
            firestore.doc(`/instacomments/${post_id}/comments/comments`).set(result.comments)
            .then(d => resolve(d));
        });
      } else {
        console.log('updating');
        firestore.doc(`/instacomments/${post_id}/comments/comments`).update(result.comments)
        .then(d => resolve(d))
        .catch(err => {
            console.log(err.message)
            reject(err)
        });
      }

    });

  });
}

const DoPostCommentsJob = async (server, post_id ,first ,after, done) => {
  json = await GetInstaComments(server, post_id, first, after);
  if(!json)
    console.log('GetInstaComments failed')
  result = ParseInstaComments(json);
  if(!result)
    console.log('ParseInstaComments failed')
  result = await SaveInstaComments(result);
  console.log('saved: ' + result);
  done();
  return 
  // return done(new Error('aria2c failed'));
}

queue.process('post_comments', 5, function(job, done){
  // console.log(job.data);
  DoPostCommentsJob(job.data.server ,job.data.post_id ,job.data.first ,job.data.after, done);
});