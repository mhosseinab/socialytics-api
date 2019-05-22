const kue = require('kue')
 , queue = kue.createQueue()
 , axios = require("axios")
 , chalk = require('chalk')
 , log = console.log
 , { Comment } = require('../common/models')
 , firebase = require('../common/firebase')
 , firestore = firebase.firestore;

 const PAGESIZE = 300;

const GetInstaComments = (server, post_id, first = PAGESIZE, after=0) =>{
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

const GetCommentsThread = (server, post_id, comment_id, first = PAGESIZE, after=0) =>{
  return new Promise((resolve, reject) => {
    axios.get(`${server}/v1/instawrapper/commentthread/${comment_id}/${first}/${after}`)
    .then(response => {
      response.post_id = post_id
      response.server_url = server
      resolve(response)
    })
    .catch(err => reject(err))
  });
}

const ParseInstaComments = async response =>{
  let post_id = response.post_id;
  let json = response.data;
  if(!json)
    return false
  let count = json.data.shortcode_media.edge_media_to_parent_comment.count;
  let page_info = json.data.shortcode_media.edge_media_to_parent_comment.page_info;
  let comments = json.data.shortcode_media.edge_media_to_parent_comment.edges;
  // console.log('comments', comments)
  for(let key in comments){
    let node = comments[key].node
    SaveComment(node, post_id)

    if(node.edge_threaded_comments.count > 0){

      console.log('threaded: ', node.id)

      for(let key in node.edge_threaded_comments.edges){
        let child_node = node.edge_threaded_comments.edges[key].node
        SaveComment(child_node, post_id, node.id)
      }

      if(node.edge_threaded_comments.page_info.has_next_page){
        setTimeout(()=>{
          queue.create('comments_thread', {
            post_id: post_id
            , comment_id: node.id
            , first: PAGESIZE
            , after: node.edge_threaded_comments.page_info.end_cursor
            , server : response.server_url
          }).save()
        }, 1000)
      } 
    }
  }

  if(page_info.has_next_page){ 

    console.log('has next page: ', page_info.end_cursor)
    
    setTimeout(()=>{
      queue.create('post_comments', {
          post_id: response.post_id
        , first: PAGESIZE
        , after: page_info.end_cursor
        , server : response.server_url
      }).save()
    }, 1000)
    
  } else {
    log(chalk.bgYellow.bold('Done: ', post_id));
  }

  return {count, page_info, post_id}
}

const ParseCommentsThread = async response =>{
  let post_id = response.post_id;
  let json = response.data;
  if(!json)
    return false
  if(!json.data.comment.edge_threaded_comments){
    console.log("_________ParseCommentsThread____\n",json,"\n\n______");
    return
  }

  let comment_id = json.data.comment.id;
  let page_info = json.data.comment.edge_threaded_comments.page_info;
  let comments = json.data.comment.edge_threaded_comments.edges;

  log(chalk.blue.bold('Parsing threaded comment: ', comment_id));

  // console.log('comments', comments)
  for(let key in comments){
    let node = comments[key].node
    SaveComment(node, post_id, comment_id)
  }

  if(page_info.has_next_page){ 
    log(chalk.yellow.bold('threaded comments has next page: ', comment_id));
    setTimeout(()=>{
      queue.create('comments_thread', {
          post_id: post_id
        , comment_id : comment_id
        , first: PAGESIZE
        , after: page_info.end_cursor
        , server : response.server_url
      }).save()
    }, 1000)
    
  }

  return {page_info, post_id}
}

// const SaveInstaComments = (result) =>{
//   return new Promise((resolve, reject) => {
//     if(!result)
//       return false;
//     let post_id = result.post_id;
//     console.log('post_id', post_id);
//     firestore.doc(`instacomments/${post_id}`).get()
//     .then( doc => {
        
//       if(!doc.exists || doc.data().count != result.count){
//         console.log('doc not exists');
//         firestore.doc(`instacomments/${post_id}`).set({count:result.count})
//         .then(()=>{
//             firestore.doc(`/instacomments/${post_id}/comments/comments`).set(result.comments)
//             .then(d => resolve(d));
//         });
//       } else {
//         console.log('updating');
//         firestore.doc(`/instacomments/${post_id}/comments/comments`).update(result.comments)
//         .then(d => resolve(d))
//         .catch(err => {
//             console.log(err.message)
//             reject(err)
//         });
//       }

//     });

//   });
// }

const SaveComment = async (node, post_id, parrent_id) => {
  let mention = node.text.match(/\@[^\s\#]*/g) || [];
  let hashtag = node.text.match(/\#[^\s\@]*/g) || [];
  
  await new Comment({
    comment_id:node.id,
    post_id: post_id,
    parrent_id: parrent_id || null,
    created_at: node.created_at,
    text: node.text ,
    mention: mention,
    mention_count :mention.length ,
    hashtag: hashtag,
    hashtag_count: hashtag.length ,
    likes_count: node.edge_liked_by.count,
    thread_count: (node.edge_threaded_comments) ? node.edge_threaded_comments.count || null : null,
    owner: {
        username: node.owner.username,
        userid: node.owner.id,
        is_verified: node.owner.is_verified || null ,
        profile_pic_url: node.owner.profile_pic_url
    }
  }).save((err) => {
    //duplicate key
    if ( err && err.code === 11000 ) {
      // console.log('duplicate key: ', err.message);
    } else if(err){
      console.log(err)
    }
  });
}

const DoPostCommentsJob = async (server, post_id ,first ,after, done) => {
  json = await GetInstaComments(server, post_id, first, after);
  if(!json)
    console.log('GetInstaComments failed')
  result = ParseInstaComments(json);
  if(!result)
    console.log('ParseInstaComments failed')
  done();
  return 
  // return done(new Error('aria2c failed'));
}

const DoCommentsThreadJob = async (server, post_id, comment_id ,first ,after, done) => {
  json = await GetCommentsThread(server, post_id, comment_id, first, after);
  if(!json)
    console.log('GetCommentsThread failed')
  result = ParseCommentsThread(json);
  if(!result)
    console.log('ParseCommentsThread failed')
  done();
  return 
  // return done(new Error('aria2c failed'));
}

queue.process('post_comments', 5, function(job, done){
  // console.log(job.data);
  DoPostCommentsJob(job.data.server ,job.data.post_id ,job.data.first ,job.data.after, done);
});

queue.process('comments_thread', 5, function(job, done){
  // console.log(job.data);
  DoCommentsThreadJob(
    job.data.server,
    job.data.post_id,
    job.data.comment_id,
    job.data.first,
    job.data.after, 
    done);
});