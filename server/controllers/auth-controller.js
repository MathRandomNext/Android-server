"use strict";

const User = require("../models/user");
const passport = require("passport");
const encryption = require("../utils/encryption");
const config = require("../config");
const jwt = require('jwt-simple');

function getToken(headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

module.exports = () => {
    return {
        registerUser(req, res) {
            let body = req.body;

            User.findOne({ username: body.username }, (err, user) => {
                if (err) {
                    res.json(err);
                    return;
                }

                if (user) {
                    return res.json("{\"error\": \"Username already exists\"}");                
                }
                
                User.create(body, (error, result) => {
                    if (error) {
                        return res.json(error);
                    }

                    return res.json({
                        username: result.username,
                        _id: result._id
                    });
                });
            })
        },
        loginUser(req, res, next) {
            User.findOne({ username: req.body.username, passHash: req.body.passHash }, (err, user) => {
                if (err) {
                    throw err;
                }

                if (!user) {
                    res.json("{\"error\": \"Invalid username or password.\"}");
                } else {
                    if (user) {
                        let result = {
                            username: user.username,
                            _id: user._id
                        };

                        return res.json({ result });
                    }

                    return res.json("{\"error\": \"Invalid username or password.\"}");
                }
            });
        },
        logoutUser(req, res) {
            req.logout();
            res.sendStatus(200);
        }
    };
};