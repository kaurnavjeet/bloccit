const Advertisement = require("./models").Advertisement;

module.exports = {
  getAllAds(callback) {
    return Advertisement.all()
      .then(advertisements => {
        callback(null, advertisements);
      })
      .catch(err => {
        callback(err);
      });
  },
  getAd(id, callback) {
    return Advertisement.findById(id)
      .then(advertisement => {
        callback(null, advertisement);
      })
      .catch(err => {
        callback(err);
      });
  },
  addAd(newAd, callback) {
    return Advertisement.create({
      title: newAd.title,
      description: newAd.description
    })
      .then(advertisement => {
        callback(null, advertisement);
      })
      .catch(err => {
        callback(err);
      });
  },
  updateAd(id, updatedAd, callback) {
    return Advertisement.findById(id).then(advertisement => {
      if (!advertisement) {
        return callback("Advertisement not found");
      }
      advertisement
        .update(updatedAd, {
          field: Object.keys(updatedAd)
        })
        .then(() => {
          callback(null, advertisement);
        })
        .catch(err => {
          callback(err);
        });
    });
  },
  deleteAd(id, callback) {
    return Advertisement.destroy({
      where: { id }
    })
      .then(advertisement => {
        callback(null, advertisement);
      })
      .catch(err => {
        callback(err);
      });
  }
};
