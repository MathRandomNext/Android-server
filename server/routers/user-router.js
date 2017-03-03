"use strict";

module.exports = ({ app, controllers }) => {
    app.get("/user/:username", controllers.user.getUser);
    app.post("/user/saveVenueToUser", controllers.user.saveVenueToUser);
};