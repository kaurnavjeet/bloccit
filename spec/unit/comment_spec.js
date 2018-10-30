const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;
const Comment = require("../../src/db/models").Comment;

describe("Comment", () => {
  beforeEach(done => {
    this.user;
    this.topic;
    this.post;
    this.comment;

    sequelize.sync({ force: true }).then(res => {
      User.create({
        email: "user@example.com",
        password: "1234567890"
      }).then(user => {
        this.user = user;

        Topic.create(
          {
            title: "First topic",
            description: "This is my first topic.",
            posts: [
              {
                title: "First post",
                body: "This is my first post.",
                userId: this.user.id
              }
            ]
          },
          {
            include: {
              model: Post,
              as: "posts"
            }
          }
        ).then(topic => {
          this.topic = topic;
          this.post = this.topic.posts[0];

          Comment.create({
            body: "This is also my first post.",
            userId: this.user.id,
            postId: this.post.id
          })
            .then(comment => {
              this.comment = comment;
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });
    });
  });

  describe("#create()", () => {
    it("should create a comment with a body, assigned post and user", done => {
      Comment.create({
        body: "Commenting on a post.",
        userId: this.user.id,
        postId: this.post.id
      })
        .then(comment => {
          expect(comment.body).toBe("Commenting on a post.");
          expect(comment.postId).toBe(this.post.id);
          expect(comment.userId).toBe(this.user.id);
          done();
        })
        .catch(err => {
          console.log(err);
          done();
        });
    });

    it("should not create a comment wiht missing body, assigned post or user", done => {
      Comment.create({
        body: "Will this comment post?"
      })
        .then(comment => {
          done();
        })
        .catch(err => {
          expect(err.message).toContain("Comment.userId cannot be null");
          expect(err.message).toContain("Comment.postId cannot be null");
          done();
        });
    });
  });

  describe("#setUser()", () => {
    it("should associate a comment and a user together", done => {
      User.create({
        email: "me@example.com",
        password: "123456789"
      }).then(newUser => {
        expect(this.comment.userId).toBe(this.user.id);

        this.comment.setUser(newUser).then(comment => {
          expect(comment.userId).toBe(newUser.id);
          done();
        });
      });
    });
  });

  describe("#getUser()", () => {
    it("should return the associated user", done => {
      this.comment.getUser().then(associatedUser => {
        expect(associatedUser.email).toBe("user@example.com");
        done();
      });
    });
  });

  describe("#setPost()", () => {
    it("should associate a post and a comment together", done => {
      Post.create({
        title: "Set this post",
        body: "Set this post to the comment",
        topicId: this.topic.id,
        userId: this.user.id
      }).then(newPost => {
        expect(this.comment.postId).toBe(this.post.id);

        this.comment.setPost(newPost).then(comment => {
          expect(comment.postId).toBe(newPost.id);
          done();
        });
      });
    });
  });

  describe("#getPost()", () => {
    it("should return the associated post", done => {
      this.comment.getPost().then(associatedPost => {
        expect(associatedPost.title).toBe("First post");
        done();
      });
    });
  });
});
