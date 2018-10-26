const flairQueries = require("../db/queries.flairs.js");

module.exports = {
  new(req, res, next) {
    res.render("flairs/new", { topicId: req.params.topicId });
  },
  create(req, res, next) {
    let newFlair = {
      name: req.body.name,
      color: req.body.color,
      topicId: req.params.topicid
    };
    flairQueries.addFlair(newFlair, (err, flair) => {
      if (err) {
        res.redirect(500, "/flairs/new");
      } else {
        res.redirect(303, `/topics/${newFlair.topicId}/flairs/${flair.id}`);
      }
    });
  }
};
