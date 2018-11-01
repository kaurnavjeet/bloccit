const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const Comment = require("../../src/db/models").Comment;
const User = require("../../src/db/models").User;
const Vote = require("../../src/db/models").Vote;

describe("Vote", () => {
  beforeEach(done => {
    this.user;
    this.topic;
    this.post;
    this.vote;

    sequelize.sync({ force: true }).then(res => {
      User.create({
        email: "user@example.com",
        password: "userexample"
      }).then(res => {
        this.user = res;

        Topic.create(
          {
            title: "My first topic",
            description: "This is my first topic",
            posts: [
              {
                title: "My first post",
                body: "This is my first post",
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
        )
          .then(res => {
            this.topic = res;
            this.post = this.topic.posts[0];

            Comment.create({
              body: "This is my first comment",
              userId: this.user.id,
              postId: this.post.id
            })
              .then(res => {
                this.comment = res;
                done();
              })
              .catch(err => {
                console.log(err);
                done();
              });
          })
          .catch(err => {
            console.log(err);
            done();
          });
      });
    });
  });

  describe("#create()", () => {
    it("should create an upvote on a post for a user", done => {
      Vote.create({
        value: 1,
        postId: this.post.id,
        userId: this.user.id
      })
        .then(vote => {
          expect(vote.value).toBe(1);
          expect(vote.postId).toBe(this.post.id);
          expect(vote.userId).toBe(this.user.id);
          done();
        })
        .catch(err => {
          console.log(err);
          done();
        });
    });

    it("should create a downvote on a post for a user", done => {
      Vote.create({
        value: -1,
        postId: this.post.id,
        userId: this.user.id
      })
        .then(vote => {
          expect(vote.value).toBe(-1);
          expect(vote.postId).toBe(this.post.id);
          expect(vote.userId).toBe(this.user.id);
          done();
        })
        .catch(err => {
          console.log(err);
          done();
        });
    });

    it("should not create a vote without assigned post or user", done => {
      Vote.create({
        value: 1
      })
        .then(vote => {
          done();
        })
        .catch(err => {
          expect(err.message).toContain("Vote.userId cannot be null");
          expect(err.message).toContain("Vote.postId cannot be null");
          done();
        });
    });
    it("should not create a vote if value is not 1 or -1", done => {
      Vote.create({
        value: -2,
        postId: this.post.id,
        userId: this.user.id
      })
        .then(vote => {
          done();
        })
        .catch(err => {
          expect(err.message).toContain("Validation isIn on value failed");
          done();
        });
    });
  });

  describe("#setUser()", () => {
    it("should associate a vote and a user together", done => {
      Vote.create({
        value: -1,
        postId: this.post.id,
        userId: this.user.id
      }).then(vote => {
        this.vote = vote;
        expect(vote.userId).toBe(this.user.id);

        User.create({
          email: "vote@example.com",
          password: "voteexample"
        })
          .then(newUser => {
            this.vote.setUser(newUser).then(vote => {
              expect(vote.userId).toBe(newUser.id);
              done();
            });
          })
          .catch(err => {
            console.log(err);
            done();
          });
      });
    });
  });

  describe("#getUser()", () => {
    it("should return the associated user", done => {
      Vote.create({
        value: 1,
        postId: this.post.id,
        userId: this.user.id
      })
        .then(vote => {
          vote.getUser().then(user => {
            expect(user.id).toBe(this.user.id);
            done();
          });
        })
        .catch(err => {
          console.log(err);
          done();
        });
    });
  });

  describe("#setPost()", () => {
    it("should associate a post and a vote togther", done => {
      Vote.create({
        value: -1,
        postId: this.post.id,
        userId: this.user.id
      }).then(vote => {
        this.vote = vote;

        Post.create({
          title: "Upvote this post",
          body: "I need people to upvote this post",
          topicId: this.topic.id,
          userId: this.user.id
        })
          .then(newPost => {
            expect(this.vote.postId).toBe(this.post.id);

            this.vote.setPost(newPost).then(vote => {
              expect(vote.postId).toBe(newPost.id);
              done();
            });
          })
          .catch(err => {
            console.log(err);
            done();
          });
      });
    });
  });

  describe("#getPost()", () => {
    it("should return the associated post", done => {
      Vote.create({
        value: 1,
        postId: this.post.id,
        userId: this.user.id
      })
        .then(vote => {
          this.comment.getPost().then(associatedPost => {
            expect(associatedPost.title).toBe("My first post");
            done();
          });
        })
        .catch(err => {
          console.log(err);
          done();
        });
    });
  });
  describe("#hasUpvoteFor()", () => {
    it("should return true if the user with matching userId has an upvote for a post", done => {
      Vote.create({
        value: 1,
        userId: this.user.id,
        postId: this.post.id
      }).then(vote => {
        this.vote = vote;

        Post.create({
          title: "Upvote",
          body: "Upvote this post.",
          topicId: this.topic.id,
          userId: this.user.id
        }).then(newPost => {
          expect(this.vote.postId).not.toBe(newPost.id);

          this.vote.setPost(newPost).then(vote => {
            expect(vote.postId).toBe(newPost.id);
            expect(this.vote.userId).toBe(newPost.userId);
            newPost.hasUpvoteFor(newPost.userId).then(votes => {
              expect(votes.length > 0).toBe(true);
              done();
            });
          });
        });
      });
    });
  });
  describe("#hasDownvoteFor()", () => {
    it("should return true if the user with matching userId has a downvote for a post", done => {
      Vote.create({
        value: -1,
        userId: this.user.id,
        postId: this.post.id
      }).then(vote => {
        this.vote = vote;

        Post.create({
          title: "Downvote",
          body: "Downvote this post.",
          topicId: this.topic.id,
          userId: this.user.id
        }).then(newPost => {
          expect(this.vote.postId).not.toBe(newPost.id);

          this.vote.setPost(newPost).then(vote => {
            expect(vote.postId).toBe(newPost.id);
            expect(this.vote.userId).toBe(newPost.userId);
            newPost.hasDownvoteFor(newPost.userId).then(votes => {
              expect(votes.length > 0).toBe(true);
              done();
            });
          });
        });
      });
    });
  });
});
