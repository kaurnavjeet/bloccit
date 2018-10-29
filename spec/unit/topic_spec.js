const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;

describe("Topic", () => {
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
            title: "First topic",
            description: "My first topic in this app",
            posts: [
              {
                title: "First post",
                body: "My first post in this app",
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

  describe("#create()", () => {
    it("should create a topic with valid title and description", done => {
      Topic.create({
        title: "Topic 2",
        description: "Testing topic 2"
      })
        .then(topic => {
          expect(topic.title).toBe("Topic 2");
          expect(topic.description).toBe("Testing topic 2");
          done();
        })
        .catch(err => {
          console.log(err);
          done();
        });
    });
  });
  describe("#getPosts()", () => {
    it("should return all posts associated with the topicId", done => {
      this.topic.getPosts().then(associatedPost => {
        expect(associatedPost[0].title).toBe("First post");
        done();
      });
    });
  });
});
