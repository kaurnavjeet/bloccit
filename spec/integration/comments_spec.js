const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics/";

const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;
const Comment = require("../../src/db/models").Comment;

describe("routes : comments", () => {
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
          .then(topic => {
            this.topic = topic;
            this.post = this.topic.posts[0];

            Comment.create({
              body: "This is my first comment",
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
          })
          .catch(err => {
            console.log(err);
            done();
          });
      });
    });
  });

  describe("guest attempting to perform CRUD actions for Comment", () => {
    beforeEach(done => {
      request.get(
        {
          url: "http://localhost:3000/auth/fake",
          form: {
            userId: 0
          }
        },
        (err, res, body) => {
          done();
        }
      );
    });

    describe("POST /topics/:topicId/posts/:postId/comments/create", () => {
      it("should not create a new comment", done => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/comments/create`,
          form: {
            body: "This comment should not post"
          }
        };
        request.post(options, (err, res, body) => {
          Comment.findOne({ where: { body: "This comment should not post" } })
            .then(comment => {
              expect(comment).toBeNull();
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });
    });

    describe("POST /topics/:topicId/posts/:postId/comments/:id/destroy", () => {
      it("should not delete the comment with the associated ID", done => {
        Comment.all().then(comments => {
          const commentCountBeforeDelete = comments.length;

          expect(commentCountBeforeDelete).toBe(1);

          request.post(
            `${base}${this.topic.id}/posts/${this.post.id}/comments/${
              this.comment.id
            }/destroy`,
            (err, res, body) => {
              Comment.all().then(comments => {
                expect(err).toBeNull();
                expect(comments.length).toBe(commentCountBeforeDelete);
                done();
              });
            }
          );
        });
      });
    });
  });

  describe("signed in user performing CRUD actions for Comment", () => {
    beforeEach(done => {
      request.get(
        {
          url: "http://localhost:3000/auth/fake",
          form: {
            role: "member",
            userId: this.user.id
          }
        },
        (err, res, body) => {
          done();
        }
      );
    });

    describe("POST /topics/:topicId/posts/:postId/comments/create", () => {
      it("should create a new comment and redirect", done => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/comments/create`,
          form: {
            body: "This comment should post."
          }
        };
        request.post(options, (err, res, body) => {
          Comment.findOne({ where: { body: "This comment should post." } })
            .then(comment => {
              expect(comment).not.toBeNull();
              expect(comment.body).toBe("This comment should post.");
              expect(comment.id).not.toBeNull();
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });
    });

    describe("POST /topics/:topicId/posts/:postId/comments/:id/destroy", () => {
      it("should delete the comment with the associated ID", done => {
        Comment.all().then(comments => {
          const commentCountBeforeDelete = comments.length;

          expect(commentCountBeforeDelete).toBe(1);

          request.post(
            `${base}${this.topic.id}/posts/${this.post.id}/comments/${
              this.comment.id
            }/destroy`,
            (err, res, body) => {
              expect(res.statusCode).toBe(302);

              Comment.all().then(comments => {
                expect(err).toBeNull();
                expect(comments.length).toBe(commentCountBeforeDelete - 1);
                done();
              });
            }
          );
        });
      });

      it("should not delete the comment of a different user", done => {
        User.create({
          email: "member@example.com",
          password: "member"
        }).then(user => {
          expect(user.email).toBe("member@example.com");
          expect(user.id).toBe(2);
          request.get(
            {
              url: "http://localhost:3000/auth/fake",
              form: {
                role: "member",
                userId: user.id
              }
            },
            (err, res, body) => {
              done();
            }
          );
          Comment.all().then(comments => {
            const commentCountBeforeDelete = comments.length;

            expect(commentCountBeforeDelete).toBe(1);

            request.post(
              `${base}${this.topic.id}/posts/${this.post.id}/comments/${
                this.comment.id
              }/destroy`,
              (err, res, body) => {
                expect(res.statusCode).toBe(401);
                Comment.all().then(comments => {
                  expect(err).toBeNull();
                  expect(comments.length).toBe(commentCountBeforeDelete);
                  done();
                });
              }
            );
          });
        });
      });
    });
  });

  describe("admin user performing CRUD actions for Comment", () => {
    beforeEach(done => {
      request.get(
        {
          url: "http://localhost:3000/auth/fake",
          form: {
            role: "admin",
            userId: this.user.id
          }
        },
        (err, res, body) => {
          done();
        }
      );
    });

    describe("POST /topics/:topicId/posts/:postId/comments/:id/destroy", () => {
      it("should delete the comment with the associated ID", done => {
        Comment.all().then(comments => {
          const commentCountBeforeDelete = comments.length;

          expect(commentCountBeforeDelete).toBe(1);

          request.post(
            `${base}${this.topic.id}/posts/${this.post.id}/comments/${
              this.comment.id
            }/destroy`,
            (err, res, body) => {
              expect(res.statusCode).toBe(302);

              Comment.all().then(comments => {
                expect(err).toBeNull();
                expect(comments.length).toBe(commentCountBeforeDelete - 1);
                done();
              });
            }
          );
        });
      });
    });
  });
});
