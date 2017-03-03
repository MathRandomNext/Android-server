"use strict";

const User = require("../models/user");
const Venue = require("../models/venue");
const Comment = require("../models/comment");

const config = require("../config");

module.exports = () => {
    return {
        postComment(req, res) {
        let body = req.body;

            Venue.findOne({ googleId: body.googleId }, (err, venue) => {
                if (err) {
                    console.log("venue not found error");
                    res.statusMessage = "Unknown venue";
                    res.sendStatus(404);
                    return;
                }

                let venueCreatedSuccessfully = true;

                if(!venue) {
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
                            venueCreatedSuccessfully = false;
                        } else {
                            venue = newVenue;
                        }                      
                    });
                }

                if(!venueCreatedSuccessfully){
                    return;
                }

                let commentForImport = {
                    author: body.author,
                    text: body.text,
                    postDate: body.postDate
                }
                
                Comment.create(commentForImport, (error, newComment) => {
                    if (error) {
                        res.statusMessage = "Enable to parse arguments.";
                        res.sendStatus(404).end();
                    } else {
                        Venue.update(venue, {$push: {"comments": newComment }}, function(err, reponse) {
                            if (err) {
                                res.sendStatus(404).end();
                            } else {
                                res.sendStatus(200).end();
                            }
                        });
                    }                      
                });
            })
        },
        getVenue(req, res, next) {
            let body = req.body;

            Venue.findOne({ googleId: body.googleId }, (err, venue) => {
                if (err) {
                    res.statusMessage = "Unknown venue";
                    res.sendStatus(400).end();
                    return;
                }

                let result = { venue };

                res.json({ result });
            });
        }
    };
};