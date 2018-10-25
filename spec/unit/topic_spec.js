const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;

describe("Topic", () => {
  beforeEach(done => {
    this.topic;
    this.post;
    sequelize.sync({ force: true }).then(res => {
      Topic.create({
        title: "Topic 1",
        description: "Topic created before each test"
      })
        .then(topic => {
          this.topic = topic;

          Post.create({
            title: "Testing Topic",
            body: "Unit test of topic being implemented",
            topicId: this.topic.id
          }).then(post => {
            this.post = post;
            done();
          });
        })
        .catch(err => {
          console.log(err);
          done();
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
        expect(associatedPost[0].title).toBe("Testing Topic");
        done();
      });
    });
  });
});
