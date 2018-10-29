const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics";

const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;

describe("routes : posts", () => {
  beforeEach(done => {
    this.topic;
    this.post;
    this.user;

    sequelize.sync({ force: true }).then(res => {
      User.create({
        email: "user@example.com",
        password: "1234567890"
      }).then(user => {
        this.user = user;

        Topic.create(
          {
            title: "New topic",
            description: "This is my new topic",
            posts: [
              {
                title: "New post",
                body: "This is my new post",
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
          this.post = topic.posts[0];
          done();
        });
      });
    });
  });

  describe("GET /topics/:topicId/posts/new", () => {
    it("should render a new post form", done => {
      request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("New Post");
        done();
      });
    });
  });
  describe("POST /topics/:topicsId/posts/create", () => {
    it("should create a new post and redirect", done => {
      const options = {
        url: `${base}/${this.topic.id}/posts/create`,
        form: {
          title: "Watching snow melt",
          body: "Without a doubt my favorite thing to do."
        }
      };
      request.post(options, (err, res, body) => {
        Post.findOne({ where: { title: "Watching snow melt" } })
          .then(post => {
            expect(post).not.toBeNull();
            expect(post.title).toBe("Watching snow melt");
            expect(post.body).toBe("Without a doubt my favorite thing to do.");
            expect(post.topicId).not.toBeNull();
            done();
          })
          .catch(err => {
            console.log(err);
            done();
          });
      });
    });
    it("should not create a new post that fails validations", done => {
      const options = {
        url: `${base}/${this.topic.id}/posts/create`,
        form: {
          title: "a",
          body: "b"
        }
      };
      request.post(options, (err, res, body) => {
        Post.findOne({ where: { title: "a" } })
          .then(post => {
            expect(post).toBeNull();
            done();
          })
          .catch(err => {
            console.log(err);
            done();
          });
      });
    });
  });
  describe("GET /topics/:topicId/posts/:id", () => {
    it("should render a view with the selected post", done => {
      request.get(
        `${base}/${this.topic.id}/posts/${this.post.id}`,
        (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Snowball fighting");
          done();
        }
      );
    });
  });
  describe("POST /topics/:topicId/posts/:id/destroy", () => {
    it("should delete the post with the associated id", done => {
      expect(this.post.id).toBe(1);
      request.post(
        `${base}/${this.topic.id}/posts/${this.post.id}/destroy`,
        (err, res, body) => {
          Post.findById(1).then(post => {
            expect(err).toBeNull();
            expect(post).toBeNull();
            done();
          });
        }
      );
    });
  });
  describe("GET /topics/:topicId/posts/:id/edit", () => {
    it("should return a form to edit the post with the associated id", done => {
      request.get(
        `${base}/${this.topic.id}/posts/${this.post.id}/edit`,
        (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Edit Post");
          expect(body).toContain("Snowball fighting");
          done();
        }
      );
    });
  });
  describe("POST /topics/:topicId/posts/:id/update", () => {
    it("return a status code 302", done => {
      request.post(
        {
          url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
          form: {
            title: "Making snowman",
            body: "With eyes, nose, and lips."
          }
        },
        (err, res, body) => {
          expect(res.statusCode).toBe(302);
          done();
        }
      );
    });
    it("should update the post with the given value", done => {
      const options = {
        url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
        form: {
          title: "Making snowman",
          body: "With eyes, nose, and lips."
        }
      };
      request.post(options, (err, res, body) => {
        expect(err).toBeNull();
        Post.findOne({ where: { id: this.post.id } }).then(post => {
          expect(post.title).toBe("Making snowman");
          expect(post.body).toBe("With eyes, nose, and lips.");
          done();
        });
      });
    });
  });
});
