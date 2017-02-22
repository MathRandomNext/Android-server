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
                    res.json({errorMessage: "Unknown"});
                    res.status(404);
                    return;
                }

                if (user) {
                    res.json({ errorMessage: "Username already exists." });
                    res.status(404);              
                } else {
                    User.create(body, (error, newUser) => {
                        if (error) {
                            res.json({ errorMessage: "Enable to parse arguments." });
                            res.status(404);
                        } else {
                            let result = {
                                username: newUser.username,
                                _id: newUser._id
                            };

                            res.json({ result });
                            res.status(200);
                        }                      
                    });
                }
            })
        },
        loginUser(req, res, next) {
            User.findOne({ username: req.body.username, passHash: req.body.passHash }, (err, user) => {
                if (err) {
                    throw err;
                }

                if (!user) {
                    res.json({ errorMessage: "Invalid username or password." });
                    res.status(404);
                    
                } else {
                    let result = {
                        username: user.username,
                        _id: user._id
                    };
                    
                    res.json({ result });
                    res.status(200);
                }
            });
        },
        logoutUser(req, res) {
            req.logout();
            res.status(200);
        }
    };
};