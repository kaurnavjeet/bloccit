const Topic = require("./models").Topic;
const Post = require("./models").Post;
const Comment = require("./models").Comment;
const User = require("./models").User;

module.exports = {
  getPost(id, callback) {
    return Post.findById(id, {
      include: [
        {
          model: Comment,
          as: "comments",
          include: [
            {
              model: User
            }
          ]
        }
      ]
    })
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
