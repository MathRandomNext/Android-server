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
                console.log(user)
            });

            Venue.findOne({ googleId: body.googleId }, (err, foundVenue) => {
                if (err) {
                    res.statusMessage = "Unknown venue";
                    res.sendStatus(404);
                    return;
                }

                if(!foundVenue) {
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
                            venue = newVenue;
                        }                      
                    });
                } else {
                    venue = foundVenue;
                }
            });
            
            if(!user){
                console.log("Something wrong with user!");
                res.statusMessage = "Something wrong!";
                res.sendStatus(404);
                return;
            }

            if(!venue){
                console.log("Something wrong with venue!");
                res.statusMessage = "Something wrong!";
                res.sendStatus(404);
                return;
            }

            User.update(venue, {$push: {"favorites": venue }}, function(err, reponse) {
                if (err) {
                    res.statusMessage = "Error";
                    res.sendStatus(404).end();
                } else {
                    res.statusMessage = "Venue added successfully to user";
                    res.sendStatus(200).end();
                }
            });
        }
    };
};