

async function Ping (request, h) {
  return new Promise((resolve, reject) => {
    const post_id = 'BxkgqvCAqGv'

    let job = request.server.app.queue.create('post_comments', {
        post_id: post_id
      , first: 300
      , server : request.server.info.uri
    }).priority('normal').attempts(3).backoff( {delay: 60*1000, type:'exponential'} )
      .save(err => {
        if( !err ) {
          resolve(job.id)
        } else {
          reject(err)
        };
      });


    /*
    request.server.inject('/v1/instawrapper/mediacomments/BwE2oWBFFEf/10/0')
    .then(res => {
      // console.log(res.result);
      const count = res.result.data.shortcode_media.edge_media_to_parent_comment.count;
      const page_info = res.result.data.shortcode_media.edge_media_to_parent_comment.page_info;
      const comments = res.result.data.shortcode_media.edge_media_to_parent_comment.edges;
      let cleaned_comments = {}
      for(let key in comments){
        let comment = {}
        let node = comments[key].node
        comment.text = node.text
        comment.created_at = new Date(node.created_at*1000)
        comment.owner = {}
        comment.owner.username = node.owner.username
        comment.owner.id = node.owner.id
        comment.owner.is_verified = node.owner.is_verified
        comment.owner.profile_pic_url = node.owner.profile_pic_url
        if(node.edge_liked_by.count>0) comment.likes_count = node.edge_liked_by.count

        cleaned_comments[node.id]=comment
      }
      return {comments:cleaned_comments, count}
      // console.log(cleaned_comments);
      // resolve({count,page_info,comments});
    })
    .then( res => {
      const db = request.server.app.firebase.db
      db.doc(`instacomments/${post_id}`).get()
      .then( doc => {
        
        if(!doc.exists || doc.data().count != res.count){
          console.log('doc not exists');
          db.doc(`instacomments/${post_id}`).set({count:res.count})
          .then(()=>{
            db.doc(`/instacomments/${post_id}/comments/comments`).set(res.comments);
          });
        } else {
          console.log('updating');
          db.doc(`/instacomments/${post_id}/comments/comments`).update(res.comments)
          .catch(err => {
            console.log(err.message)
            resolve(false)
          });
        }

      })
    })
    .catch(err => {
      console.log('Error getting document:', err.message);
      resolve(false)
    });
    */
    // 
    
    // return "pong"
  })
}

module.exports =  Ping;
