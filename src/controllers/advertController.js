const advertQueries = require("../db/queries.adverts.js");

module.exports = {
  index(req, res, next) {
    advertQueries.getAllAds((err, advertisements) => {
      if (err) {
        res.redirect(500, "static/index");
      } else {
        res.render("advertisements/index", { advertisements });
      }
    });
  },
  new(req, res, next) {
    res.render("advertisements/new");
  },
  create(req, res, next) {
    let newAd = {
      title: req.body.title,
      description: req.body.description
    };
    advertQueries.addAd(newAd, (err, advertisement) => {
      if (err) {
        res.redirect(500, "/advertisements/new");
      } else {
        res.redirect(303, `/advertisements/${advertisement.id}`);
      }
    });
  },
  show(req, res, next) {
    advertQueries.getAd(req.params.id, (err, advertisement) => {
      if (err || advertisement == null) {
        res.redirect(404, "/");
      } else {
        res.render("advertisements/show", { advertisement });
      }
    });
  },
  edit(req, res, next) {
    advertQueries.getAd(req.params.id, (err, advertisement) => {
      if (err || advertisement == null) {
        res.redirect(404, "/");
      } else {
        res.render("advertisements/edit", { advertisement });
      }
    });
  },
  update(req, res, next) {
    advertQueries.updateAd(req.params.id, req.body, (err, advertisement) => {
      if (err || advertisement == null) {
        req.redirect(404, `/advertisements/${advertisement.id}/edit`);
      } else {
        res.redirect(`/advertisements/${advertisement.id}`);
      }
    });
  },
  destroy(req, res, next) {
    advertQueries.deleteAd(req.params.id, (err, advertisement) => {
      if (err) {
        res.redirect(500, `/advertisement/${advertisement.id}`);
      } else {
        res.redirect(303, "/advertisements");
      }
    });
  }
};
