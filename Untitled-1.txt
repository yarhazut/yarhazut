router.get('/getFavorites', function(req,res) {///////////////////////toFix-BUG!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var decoded = jwt.decode(token, {complete: true});
     req.decoded= decoded;
    var username= decoded.payload.username;
    var ans = [];
    var temp =[];
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
              i=0;
            ans[i]=response[0];
            i++;
        }).catch(function(err){
            res.send(err);
        })
     }
        res.send(ans)
    }).catch(function(err){
        res.send(err);
    })
    });
    
