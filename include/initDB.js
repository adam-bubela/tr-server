'use strict';

var fs= require("fs"),
    data = fs.readFileSync( __dirname + "/../asset/hotels.json", 'utf8'),
    loki = require('lokijs'),
    db = new loki('TravelRepublic'),
    hotels = JSON.parse(data),
    dbCollection = db.addCollection('Establishments');

    // Add some documents to the collection 

    for(var i in hotels.Establishments) {   

        dbCollection.insert(hotels.Establishments[i]);
    }   

console.log("Memory usage: "+Math.ceil(db.serialize().length/1024)+"KB");
console.log('Imported '+dbCollection.count()+' records');
    
    
   
module.exports = dbCollection;
