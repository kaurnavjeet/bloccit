const Topic = require("./models").Topic;
const Post = require("./models").Post;

module.exports = {
  getPost(id, callback) {
    return Post.findById(id)
      .then(post => {
        callback(null, post);
      })
      .catch(err => {
        callback(err);
      });
  },
  addPost(newPost, callback) {
    return Post.create(newPost)
      .then(post => {
        callback(null, post);
      })
      .catch(err => {
        callback(err);
      });
  },
  updatePost(id, updatedPost, callback) {
    return Post.findById(id).then(post => {
      if (!post) {
        return callback("Post not found");
      }

      post
        .update(updatedPost, {
          field: Object.keys(updatedPost)
        })
        .then(() => {
          callback(null, post);
        })
        .catch(err => {
          callback(err);
        });
    });
  },
  deletePost(id, callback) {
    return Post.destroy({
      where: { id }
    })
      .then(post => {
        callback(null, post);
      })
      .catch(err => {
        callback(err);
      });
  }
};
