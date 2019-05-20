const mongoose = require('./db');

const commentModel = mongoose.Schema({
    comment_id:{ type: String, index: { unique: true, expires: '90d' }},
    post_id: String ,
    parrent_id: String ,
    created_at: Number,
    text: String ,
    mention: [String],
    mention_count :Number ,
    hashtag: [String],
    hashtag_count: Number ,
    likes_count : Number ,
    owner: {
        username: String,
        userid: String,
        is_verified: Boolean ,
        profile_pic_url: String
    }
  }, {
  timestamps: true
});

const postModel = mongoose.Schema({
    post_id:{ type: String, index: { unique: true, expires: '90d' }},
    created_at: Number,
    text: String ,
    mention: [String],
    mention_count :Number ,
    hashtag: [String],
    hashtag_count: Number ,
    likes_count: Number,
    owner: {
        username: String,
        userid: String,
        is_verified: Boolean ,
        profile_pic_url: String
    },
    comments: [commentModel]
  }, {
    timestamps: true
  });


module.exports = {
    Comment : mongoose.model('Comment', commentModel),
    Post : mongoose.model('Post', postModel),
}