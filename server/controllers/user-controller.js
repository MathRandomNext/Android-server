"use strict";

const User = require("../models/user");

module.exports = () => {
    return {
        getSingleUserData(req, res) {
            let id = req.params.id;
            User.findById(id, (err, user) => {
                if (err) console.log(err);
                if (!user) return res.json({ success: false, message: "User not found." });
                return res.json({
                    success: true,
                    result: {
                        username: user.username,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        _id: user._id,
                        about: user.about,
                        signature: user.signature,
                        imageDataUrl: user.imageDataUrl,
                        rank: user.rank,
                        critiqueRating: user.critiqueRating,
                        writerRating: user.writerRating
                    }
                });
            });
        },
        getAllUsersData(req, res) {
            User.find({}, (err, users) => {
                if (err) {
                    console.log(err);
                }

                return res.json({
                    success: true,
                    users
                });
            });
        },
        updateUserData(req, res) {
            let body = req.body;
            let updateObject = {};

            if (body.about) updateObject.about = body.about;
            if (body.signature) updateObject.signature = body.signature;
            if (body.imageDataUrl) updateObject.imageDataUrl = body.imageDataUrl;

            User.findByIdAndUpdate(req.params.id, updateObject, (err, user) => {
                if (err) {
                    console.log(err);
                    return res.json({ success: false, message: "Error on the server. Check updateUserData() in user-controller" });
                }

                User.findById(req.params.id, (error, data) => {
                    if (error) {
                        console.log(error);
                        return res.json({ success: false, message: "Error on the server. Check updateUserData() in user-controller" });
                    }

                    res.json({
                        success: true,
                        result: {
                            username: data.username,
                            firstname: data.firstname,
                            lastname: data.lastname,
                            _id: data._id,
                            about: data.about,
                            signature: data.signature,
                            imageDataUrl: data.imageDataUrl,
                            rank: data.rank,
                            rating: data.rating
                        }
                    });
                });
            });
        },
        followUser(req, res) {
            let sender = req.body.currentUserUsername;
            let userToFollow = req.body.userToFollow;

            if (sender === userToFollow) {
                return res.json({ message: { type: "error", text: "You can not unfollow yourself" } });
            }

            User.findOne({ username: userToFollow })
                .then(userToFollowResult => {

                    User.findOne({ username: sender })
                        .then(foundUser => {

                            let alreadyFollowed = false;
                            for (let i = 0; i < foundUser.usersFollowing.length; i += 1) {
                                if (foundUser.usersFollowing[i].username === userToFollow) {
                                    alreadyFollowed = true;
                                    break;
                                }
                            }

                            if (alreadyFollowed) {
                                res.json({ message: { type: "error", text: "You already followed this user." } });
                            } else {
                                let update = {
                                    $push: { usersFollowing: { username: userToFollowResult.username, _id: userToFollowResult._id } }
                                };
                                let options = { safe: true, upsert: true };
                                User.findOneAndUpdate({ username: sender }, update, options,
                                    (err) => {
                                        if (err) {
                                            res.json({ message: { type: "error", text: err.toString() } });
                                        } else {
                                            res.json({
                                                message: { type: "success", text: `You are now following ${userToFollow}.` }
                                            });
                                        }
                                    });
                            }
                        });
                })
                .then(() => {
                    // add the sender to the followed user's array of follewedUsers
                    User.findOne({ username: sender })
                        .then(foundUser => {

                            let alreadyFollowed = false;
                            for (let i = 0; i < foundUser.usersFollowing.length; i += 1) {
                                if (foundUser.usersFollowed[i].username === userToFollow) {
                                    alreadyFollowed = true;
                                    break;
                                }
                            }

                            if (!alreadyFollowed) {
                                let update = {
                                    $push: { usersFollowed: { username: foundUser.username, _id: foundUser._id } }
                                };
                                let options = { safe: true, upsert: true };
                                User.findOneAndUpdate({ username: userToFollow }, update, options,
                                    (err) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                            }
                        });
                });
        },
        unfollowUser(req, res) {
            let sender = req.body.currentUserUsername;
            let userToUnFollow = req.body.userToUnfollow;

            if (sender === userToUnFollow) {
                return res.json({ message: { type: "error", text: "You can not unfollow yourself" } });
            }
            let promiseUserToUnFollow = new Promise((resolve, reject) => {
                User.findOne({ username: userToUnFollow })
                    .then(foundUser => {
                        for (let i = 0; i < foundUser.usersFollowed.length; i += 1) {
                            if (foundUser.usersFollowed[i].username === sender) {
                                foundUser.usersFollowed.splice(i, 1);
                                User.findByIdAndUpdate(foundUser._id, { usersFollowed: foundUser.usersFollowed }, (err) => {
                                    if (err) {
                                        return reject(err);
                                    } else {
                                        return resolve("success");
                                    }
                                });
                            }
                        }
                    });

            });
            let promiseSender = new Promise((resolve, reject) => {
                User.findOne({ username: sender })
                    .then(foundUser => {
                        for (let i = 0; i < foundUser.usersFollowing.length; i += 1) {
                            if (foundUser.usersFollowing[i].username === userToUnFollow) {
                                foundUser.usersFollowing.splice(i, 1);
                                User.findByIdAndUpdate(foundUser._id, { usersFollowing: foundUser.usersFollowing }, (err) => {
                                    if (err) {
                                        return reject(err);
                                    } else {
                                        return resolve("success");
                                    }
                                });
                            }
                        }
                    });
            });
            return Promise.all([promiseSender, promiseUserToUnFollow])
                .then(result => {
                    res.json({ message: { type: "success", text: "You can have unfollewed " + userToUnFollow } });
                })
                .catch(err => {
                    res.json({ message: { type: "error", text: err.toString() } });
                });
        }
    };
};