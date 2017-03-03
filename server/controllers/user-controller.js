"use strict";

const User = require("../models/user");
const Venue = require("../models/venue");

module.exports = () => {
    return {     
        getUser(req, res) {
            let username = req.params.username;

            User.findOne({ username: username }, (err, user) => {
                if (err) {
                    res.statusMessage = "Unknown user";
                    res.sendStatus(400).end();
                    return;
                }

                let result = { user };

                res.json({ result });
            });
        },
        saveVenueToUser(req, res) {
            let body = req.body;
            let user;
            let venue;

            User.findOne({ username: body.username }, (err, foundUser) => {
                if (err) {
                    res.statusMessage = "Unknown user";
                    res.sendStatus(400).end();
                    return;
                }
                
                user = foundUser;

                Venue.findOne({ googleId: body.googleId }, (err, foundVenue) => {
                    if (err) {
                        res.statusMessage = "Unknown venue";
                        res.sendStatus(404);
                        return;
                    }

                    if(!foundVenue) {
                        console.log("not found venue");
                        let newVenueForImport = {
                            googleId: body.googleId,
                            venueName: body.venueName,
                            venueAddress: body.venueAddress,
                            comments:[]
                        }

                        Venue.create(newVenueForImport, (error, newVenue) => { 
                            if (error) {
                                res.statusMessage = "Enable to parse arguments.";
                                res.sendStatus(404).end();
                            } else {
                                console.log("venue created");
                                venue = newVenue;
                                User.update(user, {$push: {"favorites": venue }}, function(err, response) {
                                    if (err) {
                                        res.statusMessage = "Error";
                                        res.sendStatus(404).end();
                                    } else {
                                        console.log("fav imported");
                                        res.statusMessage = "Venue added successfully to user";
                                        res.sendStatus(200).end();
                                    }
                                });
                            }                      
                        });
                    } else {
                        console.log("found venue");
                        venue = foundVenue;
                        console.log(venue);
                        User.update(user, {$push: {"favorites": venue }}, function(err, response) {
                            if (err) {
                                res.statusMessage = "Error";
                                res.sendStatus(404).end();
                            } else {
                                console.log("fav imported");
                                res.statusMessage = "Venue added successfully to user";
                                res.sendStatus(200).end();
                            }
                        });
                    }
                });

            });

        }
    };
};