"use strict";

module.exports = ({ app, controllers }) => {
    app.get("/users/all", controllers.user.getAllUsersData);
};