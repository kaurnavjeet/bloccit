const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Flair = require("../../src/db/models").Flair;

describe("Flair", () => {
  beforeEach(done => {
    this.topic;
    this.flair;
    sequelize.sync({ force: true }).then(res => {
      Topic.create({
        title: "How to create flair?",
        description: "Give it a name and color"
      })
        .then(topic => {
          this.topic = topic;

          Flair.create({
            name: "Discussion",
            color: "blue",
            topicId: this.topic.id
          }).then(flair => {
            this.flair = flair;
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
    it("should create a flair with a name and color and assigned topic", done => {
      Flair.create({
        name: "Resource",
        color: "orange",
        topicId: this.topic.id
      })
        .then(flair => {
          expect(flair.name).toBe("Resource");
          expect(flair.color).toBe("orange");
          done();
        })
        .catch(err => {
          console.log(err);
          done();
        });
    });
    it("should not create a flair with missing name and color, or assigned topic", done => {
      Flair.create({
        name: "Resource"
      })
        .then(flair => {
          done();
        })
        .catch(err => {
          expect(err.message).toContain("Flair.color cannot be null");
          expect(err.message).toContain("Flair.topicId cannot be null");
          done();
        });
    });
  });
  describe("#setTopic()", () => {
    it("should associate a flair and a topic together", done => {
      Topic.create({
        title: "Making Flairs",
        description: "With name and color."
      }).then(newTopic => {
        expect(this.flair.topicId).toBe(this.topic.id);
        this.flair.setTopic(newTopic).then(flair => {
          expect(flair.topicId).toBe(newTopic.id);
          done();
        });
      });
    });
  });
  describe("#getTopic()", () => {
    it("should return the associated topic", done => {
      this.flair.getTopic().then(associatedTopic => {
        expect(associatedTopic.title).toBe("How to create flair?");
        done();
      });
    });
  });
});
