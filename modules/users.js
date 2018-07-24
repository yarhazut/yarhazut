var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var DButilsAzure = require('../DButils');

//var id = 1
//var Users = []

const superSecret = "guythequeen"; // secret variable


//registration
router.post('/reg', function (req, res) {
    var categories= req.body.categories;
    /*Users[id] =
        {

            "username": req.body.username,
            "password": req.body.password,
            "isAdmin": req.body.isAdmin
        }

    id++*/
    DButilsAzure.execQuery("insert into users values ('" + req.body.username+"', '"+ req.body.password+"', '"+ req.body.fname+ "', '"
    + req.body.lname+"', '"+req.body.country+"', '"+req.body.city+"', '"+ req.body.email+"', '"+req.body.que1+"', '"
    +req.body.ans1+"', '"+req.body.que2+"', '"+req.body.ans2+"')" ).then(function(response){
     }).catch(function(err){
         res.send(err);
     })
     for (var i=0; i< categories.length; i++)
     {
        DButilsAzure.execQuery("insert into userCategories values ('" + req.body.username+"',  '"+categories[i]+"')" )
        .then(function(response){
        }).catch(function(err){
            res.send(err);
        })
    }
    res.sendStatus(200)


});

//login
router.post('/login', function (req, res) {

    if (!req.body.username || !req.body.password)
        res.send({ message: "bad values" })

    else {

            /*for (id in Users) {
                var user = Users[id]
    
                if (req.body.username == user.username)
                    if (req.body.password == user.password)
                        sendToken(user, res)
                    else {
                        res.send({ success: false, message: 'Authentication failed. Wrong Password' })
                        return
                    }
    
            }*/
            DButilsAzure.execQuery("select password from users where username= '" + req.body.username+"'" )
            .then(function(response){
            var pass= response[0].password;
            if (pass)
            {
                if (req.body.password== pass)
                    sendToken(req.body.username, res)
                else 
                {
                    res.send({ success: false, message: 'Authentication failed. Wrong Password' })
                    return
                }
            }
            else
            {
                res.send({ success: false, message: 'Authentication failed. No such user name' })
            }
            }).catch(function(err){
            res.send(err);
            })
            

    
            
        }

})

function sendToken(username, res) {
    var payload = {
        username: username,
        admin: false
    }

    var token = jwt.sign(payload, superSecret, {
        expiresIn: "1d" // expires in 24 hours
    });

    // return the information including token as JSON
    res.json({
        success: true,
        message: 'Enjoy your token!',
        token: token
    });

}

//retrived pass
router.post('/retrivepass', function (req, res) {
    var username = req.body.username;
    var que= req.body.que;
    var ans= req.body.ans;

    DButilsAzure.execQuery("select que1, ans1, que2, ans2, password from users where username='" +username + "'").then(function(response){
     if(que==response[0].que1 || que==response[0].que2 )
        {
            if(que==response[0].que1)
            {
                if(ans==response[0].ans1)
                {
                    var pass = response[0].password;
                    res.send(pass);
                }
                else
                {
                    res.send("wrong answer. Try again");
                }
            }
            else
            {
                if(ans==response[0].ans2)
                {
                    var pass = response[0].password;
                    res.send(pass);
                }
                else
                {
                    res.send("wrong answer. Try again");
                }
            }
        }
     else
     {
        res.send("not your registration questions. change questions");
     }
     

    }).catch(function(err){
        res.send(err);
    })
});





module.exports = router;