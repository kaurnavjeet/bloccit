const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/users/";
const User = require("../../src/db/models").User;
const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const Comment = require("../../src/db/models").Comment;
const Favorite = require("../../src/db/models").Favorite;

describe("routes : users", () => {
  beforeEach(done => {
    sequelize
      .sync({ force: true })
      .then(() => {
        done();
      })
      .catch(err => {
        console.log(err);
        done();
      });
  });
  describe("GET /users/sign_up", () => {
    it("should render a view with a sign up form", done => {
      request.get(`${base}sign_up`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Sign Up");
        done();
      });
    });
  });
  describe("POST /users", () => {
    it("should create a new user with valid values and redirect", done => {
      const options = {
        url: base,
        form: {
          email: "user@example.com",
          password: "1234567890"
        }
      };
      request.post(options, (err, res, body) => {
        User.findOne({ where: { email: "user@example.com" } })
          .then(user => {
            expect(user).not.toBeNull();
            expect(user.email).toBe("user@example.com");
            expect(user.id).toBe(1);
            done();
          })
          .catch(err => {
            console.log(err);
            done();
          });
      });
    });
    it("should not create a user with invalid attributes and redirect", done => {
      request.post(
        {
          url: base,
          form: {
            email: "noemail",
            password: "1234567890"
          }
        },
        (err, res, body) => {
          User.findOne({ where: { email: "noemail" } })
            .then(user => {
              expect(user).toBeNull();
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        }
      );
    });
  });
  describe("GET /users/sign_in", () => {
    it("should render a view with a sign in form", done => {
      request.get(`${base}sign_in`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Sign in");
        done();
      });
    });
  });

  describe("GET /users/:id", () => {
    beforeEach(done => {
      this.user;
      this.post;
      this.comment;
      this.favorite;

      User.create({
        email: "get@example.com",
        password: "getexample"
      }).then(res => {
        this.user = res;

        Topic.create(
          {
            title: "Winter Games",
            description: "Post your Winter Games stories",
            posts: [
              {
                title: "Snowball fighting",
                body: "So much snow",
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
        ).then(res => {
          this.post = res.posts[0];

          Comment.create({
            body: "This comment is alright",
            userId: this.user.id,
            postId: this.post.id
          }).then(res => {
            this.comment = res;

            Favorite.create({
              userId: this.user.id,
              postId: this.post.id
            }).then(res => {
              this.favorite = res;
              done();
            });
          });
        });
      });
    });

    it("should present a list of comments and posts a user has created and favorited", done => {
      request.get(`${base}${this.user.id}`, (err, res, body) => {
        expect(body).toContain("Snowball fighting");
        expect(body).toContain("This comment is alright");
        expect(body).toContain("Favorite Posts");
        done();
      });
    });
  });
});
