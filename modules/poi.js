var express = require('express');
var router= express.Router();
var DButilsAzure = require('../DButils');
var jwt = require('jsonwebtoken');
var dateTime = require('node-datetime');
var superSecret= "guythequeen";


// get poi
router.get('/getPoi/:id', function(req,res) {
    var id = req.params.id;
    console.log(id);
    DButilsAzure.execQuery("select * from poi where name like'%" + id + "%'").then(function(response){
        res.send(response)
    }).catch(function(err){
        res.send(err);
    })
});

// get all pois
router.get('/allPois', function(req,res) {
    DButilsAzure.execQuery("select * from poi").then(function(response){
        res.send(response)
    }).catch(function(err){
        res.send(err);
    })
    
});



// 3 random pois
router.get('/threeRandomPois', function(req,res) {
    DButilsAzure.execQuery("select * from poi where rank>=4").then(function(response){
        var ans=[]
        var rnd1= Math.ceil(Math.random()*response.length-1);
        var rnd2= Math.ceil(Math.random()*response.length-1);
        while (rnd1== rnd2)
        {
            var rnd2= Math.ceil(Math.random()*response.length-1);  
        }
        var rnd3= Math.ceil(Math.random()*response.length-1);
        while (rnd3== rnd2 || rnd3== rnd1)
        {
            var rnd3= Math.ceil(Math.random()*response.length-1); 
        }
        ans[0]= response[rnd1];
        ans[1]= response[rnd2];
        ans[2]= response[rnd3];
        //var str= JSON.stringify(ans);
        res.send(ans);
    }).catch(function(err){
        res.send(err);
    })
    
});

//uphdate views number
router.post('/updateViews', function(req,res) {
    var name= req.body.name;
   DButilsAzure.execQuery("select views from poi where name='" +name + "'").then(function(response){
    let views = response[0].views;
    views++;
    DButilsAzure.execQuery("update poi set views='"+views+ "' where name='" +name + "'").then(function(response){
        res.sendStatus(200);
    }).catch(function(err){
        res.send(err);
    })

}).catch(function(err){
    res.send(err);
})
    
    
});


//suggest 2 best popular poi by user's favorite categories
router.get('/twoTopPopularByCategories', function(req,res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var decoded = jwt.decode(token, {complete: true});
     req.decoded= decoded;
    var username= decoded.payload.username;
    var pois=[];
    DButilsAzure.execQuery("select distinct category from userCategories where username='" + username + "'")
    .then(function(response1){
        cat1= response1[0].category;
        cat2= response1[1].category;
        DButilsAzure.execQuery("select * from poi where category='" + cat1 + "' order by rank desc ")
        .then(function(response2){
            pois[0]=response2[0];
            DButilsAzure.execQuery("select * from poi where category='" + cat2 + "' order by rank desc ")
            .then(function(response3){
                pois[1]=response3[0];
                res.send(pois);
            }).catch(function(err){
                res.send(err);
            })
        }).catch(function(err){
            res.send(err);
        })

    }).catch(function(err){
        res.send(err);
    })
});


// rank poi
router.post('/rank', function(req,res) {
    var name= req.body.name;
    var rank = req.body.rank;
   // console.log(id);
   DButilsAzure.execQuery("select rank, rankCount from poi where name='" +name + "'").then(function(response){
    let newRank = response[0].rank;
    let rankCount = response[0].rankCount;
    newRank = ((newRank/100)*5)*rankCount;
    newRank=Number(rank) + Number(newRank);
    rankCount++;
    newRank=((newRank/rankCount)/5)*100;
    DButilsAzure.execQuery("update poi set rank='"+newRank+ "', rankCount='"+rankCount+ "' where name='" +name + "'").then(function(response){
        res.sendStatus(200);
    }).catch(function(err){
        res.send(err);
    })

}).catch(function(err){
    res.send(err);
})
});


//feedback
router.post('/feedback', function(req,res) {
    var name= req.body.name;
    var feedback = req.body.feedback;
   // console.log(id);
   DButilsAzure.execQuery("select date1, date2 from poi where name='" +name + "'").then(function(response){
    var date1 = response[0].date1;
    let date2 = response[0].date2;
    var strD;
    var strF;

var dt = dateTime.create();
var formatted = dt.format('Y-m-d H:M:S');
    //var now = new Date();
   // now = now.toString().substr(0, now.toString().indexOf(' GMT'));
    //now+=".000";
    if(date1< date2)
    {
        strD= "date1";
        strF= "feedback1";
    }
    else
    {
        strD= "date2";
        strF="feedback2";
    }
   var strh="update poi set "+ strD+"='"+formatted+ "', "+strF+"='"+feedback+ "' where name='" +name + "'";
    DButilsAzure.execQuery("update poi set "+ strD+"='"+formatted+ "', "+strF+"='"+feedback+ "' where name='" +name + "'").then(function(response){
        res.sendStatus(200);
    }).catch(function(err){
        res.send(err);
    })

}).catch(function(err){
    res.send(err);
})
});



//get favorites
/*router.get('/getFavorites', function(req,res) {///////////////////////toFix-BUG!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var decoded = jwt.decode(token, {complete: true});
     req.decoded= decoded;
    var username= decoded.payload.username;
    var ans = [];
    var temp =[];
    var change=false;
    DButilsAzure.execQuery("select poi from favorites where username='" +username + "'").then(function(response){ 
        for(var j=0; j<response.length;j++)
        {
            temp[j]=response[j];
        }
       var i;
     for( i=0; i<temp.length; i++)
     {
        DButilsAzure.execQuery("select * from poi where name='" +temp[i].poi + "'").then(function(response){
           if(i==temp.length)
           {
                i=0;
                change= true;
           }
              
            ans[i]=response[0];
            i++;
            if (i==temp.length && change)
                res.send(ans)

        }).catch(function(err){
            res.send(err);
        })
     }
        //res.send(response)
    }).catch(function(err){
        res.send(err);
    })
    });*/
    


    router.get('/getFavorites', function(req,res) {
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        var decoded = jwt.decode(token, {complete: true});
        req.decoded= decoded;
        var username= decoded.payload.username;
        DButilsAzure.execQuery("select * from poi join favorites on poi.name= favorites.poi where username='" +username + "'").then(function(response){
            res.send(response);
        }).catch(function(err){
            res.send(err);
        })
        
    });








router.post('/saveFavorites', function(req,res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var decoded = jwt.decode(token, {complete: true});
     req.decoded= decoded;
    var username= decoded.payload.username;
    var favorites= req.body.favorites;
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
   // console.log(id);
   DButilsAzure.execQuery("delete from favorites where username='" +username + "'").then(function(response){
    for (var i = 0; i < favorites.length; i++) 
    {   
        var str = "insert into favorites values('"+username+ "', '"+favorites[i]+ "', '"+formatted+"')";
        DButilsAzure.execQuery("insert into favorites values('"+username+ "', '"+favorites[i]+ "', '"+formatted+"')").then(function(response){
        }).catch(function(err){
            res.send(err);
        })
    }
    res.sendStatus(200);
}).catch(function(err){
    res.send(err);
})
});

//get last pois Saved in favorites
router.get('/getLastSaved', function(req,res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var decoded = jwt.decode(token, {complete: true});
     req.decoded= decoded;
    var username= decoded.payload.username;
    var ans = [];
    DButilsAzure.execQuery("select * from poi join favorites on poi.name = favorites.poi  where username='" +username + "' order by date desc").then(function(response){
     if(response.length>0)   
         ans[0]=response[0];
     if(response.length>1)   
         ans[1]=response[1];   
        res.send(ans);
    }).catch(function(err){
        res.send(err);
    })
    });



    router.get('/checkToken', function(req,res) {
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
    
        // decode token
        if (token) {
            // verifies secret and checks exp
            jwt.verify(token, superSecret, function (err, decoded) {
                if (err) {
                    return res.json({ success: false, message: 'Failed to authenticate token.' });
                } else {
                    // if everything is good, save to request for use in other routes
                    // get the decoded payload and header
                    var decoded = jwt.decode(token, {complete: true});
                    req.decoded= decoded;
                    return res.status(200).send({
                        success: true,
                        message: 'token provided.'
                    });
                }
            });
    
        } 
        else 
        {
            // if there is no token
            // return an error
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }
        });


 

module.exports= router;