module.exports = {
  init(app) {
    const staticRoutes = require("../routes/static");
    const postRoutes = require("../routes/posts");
    const topicRoutes = require("../routes/topics");
    const userRoutes = require("../routes/users");

    if (process.env.NODE_ENV === "test") {
      const mockAuth = require("../../spec/support/mock-auth.js");
      mockAuth.fakeIt(app);
    }

    app.use(staticRoutes);
    app.use(postRoutes);
    app.use(topicRoutes);
    app.use(userRoutes);
  }
};
