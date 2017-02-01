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
                    res.json({ message: `User with username "${body.username}" already exists.` });
                    return;
                }

                let salt = encryption.getSalt();
                let passHash = encryption.getPassHash(salt, body.password);
                body.salt = salt;
                body.passHash = passHash;
                User.create(body, (error, result) => {
                    if (error) {
                        res.json(error);
                        return;
                    }

                    res.json({
                        username: result.username,
                        _id: result._id,
                    });
                });
            })
        },
        loginUser(req, res, next) {
            User.findOne({ username: req.body.username }, (err, user) => {
                if (err) {
                    throw err;
                }

                if (!user) {
                    res.json("{\"error\": \"Invalid username or password.\"}");
                } else {
                    if (user.isValidPassword(req.body.password)) {
                        let token = 'JWT ' + jwt.encode(user, config.jwtSecret);
                        let result = {
                            token,
                            username: user.username,
                            _id: user._id
                        };
                        console.log("return JSON");
                        return res.json({ result });
                    }

                    return res.json("{\"error\": \"Invalid username or password.\"}");
                }
            });
        },
        logoutUser(req, res) {
            req.logout();
            res.sendStatus(200);
        },
        verifyLogin(req, res) {
            var token = getToken(req.headers);
            if (token) {
                let decoded = jwt.decode(token, config.jwtSecret);
                User.findOne({
                    username: decoded.username
                }, function (err, user) {
                    if (err) throw err;

                    if (!user) {
                        return res.json({ success: false, message: 'User not found.' });
                    } else {
                        res.json({
                            success: true, user: {
                                token,
                                username: user.username,
                                _id: user._id
                            }
                        });
                    }
                });
            } else {
                return res.json({ success: false, message: "No token provided" });
            }
        }
    };
};