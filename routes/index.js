const express = require("express");
const router = express.Router();
const https = require("https");

//@desc Home page
//@route GET/home
router.get("/", (req, res) => {
    res.render('index');
})

//@desc profile page
//@route GET/profile
router.get("/profile", (req, res) => {
    res.render('signin');
})

router.get("/agentSignup", (req, res) => {
    res.render("signUp1.ejs");
})

router.get("/signupAgent", (req, res) => {
    res.render("signUpAgent.ejs");
})

router.get("/login", (req, res) => {
    res.render("signin.ejs");
})

router.get("/forgetpassword", (req, res) => {
    res.render("forgetpassword.ejs")
})

router.get("/faq", (req, res)=> {
    res.render("FAQ.ejs")
})

router.get("/about", (req, res) => {
    res.render("about.ejs")
})

router.get("/agency", (req, res)=> {
    res.render("signUpRealEstateAgency.ejs")
})

router.get("/createacc", (req, res)=> {
    res.render("signUp.ejs")
})

//setting up newsletter using mailchimp api
router.post("/subscribe", (req, res)=> {
    const email = req.body.email;
    console.log (email);

    const data = {
        members : [{
            email_address: email,
            status: "subscribed",
            merge_fields : {

            }
        }]
    };
    const jsonData = JSON.stringify(data);
    const url = "https://us10.api.mailchimp.com/3.0/lists/57eaadac9c";

    const options = {
        method: "POST",
        auth: "divine:b027835891a1252c855506b239e60482-us10"
    }

    const request = https.request(url, options, response => {

        if(response.statusCode === 200){
            res.render("thanksforsubscribing.ejs")
        }else {
            res.render("404.ejs")
        }
        response.on("data", (data)=> {
            console.log(JSON.parse(data))
        })
    })
    request.write(jsonData);
    request.end();
});


module.exports = router;
