const log = console.log;
const express = require('express');
const router = express.Router();
router.use(express.json());
const {createToken, decodeToken} = require('../services/jwtService');
const bcrypt = require("bcryptjs");
const passport = require('passport');
const nodemailer = require("nodemailer");
const expiry = Number(process.env.EXPIRY);

//Agents model
const Agent = require("../models/Agent");

//Registration handle
router.post('/register', (req, res)=> {
    //check if user with this email address exists
    Agent.findOne({email: req.body.email}, (err, userExists)=> {
        if (err) return res.status(500).json({err});
        if (userExists) return res.status(400).json({"msg": "User with this email address already exists"});
        //create a new user
        Agent.create({...req.body}, (err, newAgent)=> {
            if (err) return res.status(500).json({err});
            //hash user password
            bcrypt.genSalt(10, (err, salt)=> {
                if (err) return res.status(500).json({err});
                bcrypt.hash(req.body.password, salt, (err, hashedPassword)=> {
                    if (err) return res.status(500).json({err});
                    //save password to user data in the db
                    newAgent.password = hashedPassword;
                    newAgent.save((err, savedUser)=> {
                        if (err) return res.status(500).json({err});
                        else {
                            req.flash("success_msg", "You are now registered and can login");
                            res.redirect('/login');
                        }
                    });
                });
            });

        });
    })
}); 

//login handle
router.post('/profile', (req, res)=> {
    //Check if user exists
    Agent.findOne({email: req.body.email}, (err, agentExists)=> {
        //log(agentExists);
        if (err) return res.status(500).json({err});
        if (!agentExists) { 
            req.flash("success_msg", "Incorrect email address");
            //return res.status(401).json({"msg": "Incorrect email address"});
        }
//check if password is correct
        let match = bcrypt.compareSync(req.body.password, agentExists.password);
        log(match);
        if (!match) { 
            req.flash("success_msg", "Incorrect password");
            //return res.status(401).json({"msg": "Incorrect password"});
        }
        //create token
        let token = createToken(agentExists);
        //if (!token) return res.status(500).redirect("/users/login");
        if (!token) return res.status(500).json({"msg": "Unable to authenticate"});
        else {
            res.cookie('jwt', token, {maxAge: 604800, httpOnly: true});
            return res.status(200).render('profiles.ejs');
        }
    });
});

//logout handle
router.get('/logout', (req, res)=> {
    res.cookie('jwt', '', {maxAge: 1});
    res.redirect('/');
});

//forgot password
router.post('/password-reset', (req, res)=> {
    //find email in the db
    Agent.findOne({email: req.body.email}, (err, user)=> {
        if (err) return res.status(500).json({err});
        if (!user) return res.status(401).json({"msg": "This email is not registered to a user"});
        //create a reset password
        else {
            var tempPassword = "";
            for (var i = 0; tempPassword.length < 11; i++) {
                if (i > 25) {
                    tempPassword += user.password[i];
                }
            }
            //configure nodemailer
            //configure transporter
            let transporter = nodemailer.createTransport({
                service: 'zoho',
                auth: {
                    user: 'oasisproperties88@zohomail.com',
                    pass: 'weAreOasis88' //you can wrap these auth properties in environment variables
                }
            }); 
            //set mail options
            let userNames = user.name.split(' ');
            let userFirstName = userNames[0];
            let mailOptions = {
                from: 'oasisproperties88@zohomail.com',
                to: user.email,
                subject: 'Oasis Properties Password Recover',
                html: `<p>Dear ${userFirstName},</p><p>You requested a password reset.</p><p>Check out your new temporary password below.</p><p style="font-weight: 600;">New password: <span>${tempPassword}</span></p><p>You can now login with your new temporary password.</p>`
            }
            //update new password
            Agent.findByIdAndUpdate(user._id, {password: tempPassword}, (err, updatedUser)=> {
                if (err) res.status(500).json({err});
                else if (!updatedUser) return res.status(404).json({"msg": "Password not updated"});
                else {
                    bcrypt.genSalt(10, (err, salt)=> {
                        if (err) return res.status(500).json({err});
                        //hash new password
                        bcrypt.hash(tempPassword, salt, (err, hashedPassword)=> {
                            if (err) return res.status(500).json({err});
                            else {
                                updatedUser.password = hashedPassword;
                                log(updatedUser.password);
                                //save new password
                                updatedUser.save((err, savedPassword)=> {
                                    if (err) return res.status(500).json({err});
                                    else {
                                        transporter.sendMail(mailOptions, (err, sentMsg)=> {
                                            if (err) return res.status(500).json({err});
                                            log(`Email sent: ${sentMsg.response}`);
                                            //return res.status(200).json({"msg": "Password Reset Link sent!"});
                                            req.flash("success_msg", "Your new password has been sent to your email address.");
                                            return res.status(200).redirect('/login');
                                        });
                                    }
                                });
                            }
                        });
                    });
                }
            });
        }   
    });    
});

module.exports =  router;
