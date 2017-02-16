
var dbCollection = require('./include/initDB');
var express = require('express');
var app = express();
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get('/ranges', function (req, res) {
    
 
    var costMax =0;
    var stars = [];
    var UserRatingCountMax = 0;
    var found = dbCollection.find();
    var UserRatingTitle = [];
    for(var i in found){
       //if(found[i].Stars>starsMax) starsMax=found[i].Stars;
       if(found[i].Stars && stars.lastIndexOf(found[i].Stars)<0) stars.push(found[i].Stars);
       if(found[i].MinCost>costMax) costMax=found[i].MinCost;
       if(found[i].UserRatingCount>UserRatingCountMax) UserRatingCountMax=found[i].UserRatingCount;
       if(found[i].UserRatingTitle && UserRatingTitle.lastIndexOf(found[i].UserRatingTitle)<0) UserRatingTitle.push(found[i].UserRatingTitle);
    }  
     
    
    var priceRanges = [],
        userRatingCountMax = [],
        steps = 5, 
        pricestep = Math.ceil(costMax/steps),
        ratingStep = Math.ceil(UserRatingCountMax/steps);

    for(var x=0; x<steps; x++){
       priceRanges.push([pricestep*x, x*pricestep+pricestep-1]);
       userRatingCountMax.push(ratingStep*x);
    }
    
    var result = {
        total: found.length,
        costMax:costMax,
        stars:stars.sort(),
        priceRanges:priceRanges,
        userRatingCountMax:userRatingCountMax,
        userRatingTitle : UserRatingTitle
      
    }

    res.end(JSON.stringify(result));
      
});


app.get('/search', function (req, res) {
    var query = {
        $and:[]
    };
    
    if(!req.query.Name) {
        res.end(JSON.stringify({
            data:[],
            total:0     
        }));
    };
    
    query.$and.push({Name : { '$regex': [req.query.Name, 'i'] }});
    
    if(req.query.UserRating) 
        query.$and.push({UserRating : { '$gte' : req.query.UserRating }}); 
    
    if(req.query.TrpRating) 
        query.$and.push({UserRatingCount : { '$gte' : req.query.TrpRating }}); 
    
    var MinCost = JSON.parse(req.query.MinCost||null);
    if(MinCost && Array.isArray(MinCost)){
        var mc = {$or:[]};
        for(var i in MinCost)   
            mc.$or.push({MinCost   : { '$between' : MinCost[i] }}); 

        query.$and.push(mc);   
    }
    var Stars = JSON.parse(req.query.Stars||null);
    if(Stars) 
        query.$and.push({Stars   : { '$in' : Stars }}); 
    
    

    /** SORTING */
    var simplesort = [];
    if(!req.query.orderBy){
        simplesort = ['Name',0];
    }else{
        simplesort = JSON.parse(req.query.orderBy);
    }
   
    var found = dbCollection.chain().find(query).simplesort(simplesort[0],simplesort[1]).data();
    var r = {
        data:found,
        total:found.length
        
    };
    res.end(JSON.stringify(r));
})

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Server http://%s:%s", host, port)

})