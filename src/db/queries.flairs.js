const Flair = require("./models").Flair;
const Topic = require("./models").Topic;

module.exports = {
  getFlair(id, callback) {
    return Flair.findById(id)
      .then(flair => {
        callback(null, flair);
      })
      .catch(err => {
        callback(err);
      });
  },
  addFlair(newFlair, callback) {
    return Flair.create(newFlair)
      .then(flair => {
        callback(null, flair);
      })
      .catch(err => {
        callback(err);
      });
  },
  updateFlair(id, updatedFlair, callback) {
    return Flair.findById(id).then(flair => {
      if (!flair) {
        return callback("Flair not found");
      }
      flair
        .update(updatedFlair, {
          field: Object.keys(updatedFlair)
        })
        .then(() => {
          callback(null, flair);
        })
        .catch(err => {
          callback(err);
        });
    });
  },
  deleteFlair(id, callback) {
    return Flair.destroy({
      where: { id }
    })
      .then(flair => {
        callback(null, flair);
      })
      .catch(err => {
        callback(err);
      });
  }
};
