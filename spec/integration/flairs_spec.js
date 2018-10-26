const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics";

const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Flair = require("../../src/db/models").Flair;

describe("routes : flairs", () => {
  beforeEach(done => {
    this.topic;
    this.flair;
    sequelize.sync({ force: true }).then(res => {
      Topic.create({
        title: "Flair Test One",
        description: "Testing flair one."
      }).then(topic => {
        this.topic = topic;
        Flair.create({
          name: "Discussion",
          color: "blue",
          topicId: this.topic.id
        })
          .then(flair => {
            this.flair = flair;
            done();
          })
          .catch(err => {
            console.log(err);
            done();
          });
      });
    });
  });

  describe("GET /topics/:topicId/flairs/new", () => {
    it("should render a form to create a new flair", done => {
      request.get(`${base}/${this.topic.id}/flairs/new`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("New Flair");
        done();
      });
    });
  });
  describe("POST /topics/:topicId/flairs/create", () => {
    it("should create a new flair and redirect", done => {
      const options = {
        url: `${base}/${this.topic.id}/flairs/create`,
        form: {
          name: "Resource",
          color: "yellow"
        }
      };
      request.post(options, (err, res, body) => {
        Flair.findOne({ where: { name: "Resource" } })
          .then(flair => {
            expect(flair).not.toBeNull();
            expect(flair.name).toBe("Resource");
            expect(flair.color).toBe("yellow");
            expect(flair.topicId).not.toBeNull();
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
