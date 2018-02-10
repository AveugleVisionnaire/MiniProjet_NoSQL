//------------------------------- Data Cleaning---------------------------------------------//
use project_db
//Remove all records which don't have and coordinates
db.ipis.remove(
    {$or:[ { Longitude:""},{Latitude:""}]}
)

//Remove all records which don't have and coordinates
db.business.remove(
    {$or:[ { Longitude:""},{Latitude:""}]}
)
db.ipis.find({}).count()

db.business.remove(
    {$or:[ { Longitude:""},{Latitude:""}]}
    
)
    
    
    
// Remove duplicate value in ipis data
db.getCollection('ipis').aggregate(  
    { $match: { 
        Longitude: { $ne: ''},
        Latitude: { $ne: ''},
        PARCEL_ADDRESS: { $ne: ''}
    }},
    { $group: {
        _id: { Longitude: "$Longitude", Latitude: "$Latitude", PARCEL_ADDRESS: "$PARCEL_ADDRESS"},
        count: { $sum: 1},
        dups: { $push: "$_id"}
    }},
    { $match: {
        count: { $gt: 1}
    }}
)
       
var duplicates = [];
db.getCollection('ipis').aggregate(  
    { $match: { 
        Longitude: { $ne: ''},
        Latitude: { $ne: ''},
        PARCEL_ADDRESS: { $ne: ''}
    }},
    { $group: {
        _id: { Longitude: "$Longitude", Latitude: "$Latitude", PARCEL_ADDRESS: "$PARCEL_ADDRESS"},
        count: { $sum: 1},
        dups: { $push: "$_id"}
    }},
    { $match: {
        count: { $gt: 1}
    }}
)               
.forEach(function(doc) {
    doc.dups.shift();  //Remove the first id of the dups array    
    doc.dups.forEach( function(dupId){ 
        duplicates.push(dupId);
        }
    )    
})

db.getCollection('ipis').remove({_id:{$in:duplicates}})  
 




/*Mongodb import GeoJSON file as one document. So, we need to extract documents (features) wrapped in stations and museums collections */
//Stations 
var ar= db.stationsgeo.find({}).toArray() 
ar[0].features.forEach(function(elt){
    db.stations.save(elt)
});

db.stationsgeo.drop()
//Museums
var ar= db.museumsgeo.find({}).toArray() 
ar[0].features.forEach(function(elt){
    db.museums.save(elt)
});
db.museumsgeo.drop()

//Bike Stations
var ar= db.bikegeo.find({}).toArray() 
ar[0].stationBeanList.forEach(function(elt){
    db.bike.save(elt)
});
db.bikegeo.drop()
    
db.bike.remove(
    {$or:[ { "stations.BeanList.longitude":""},{"stations.BeanList.latitude":""}]}
)
    
    
    
//Create coordinates field from Latitude and Longitude fields.
db.ipis.aggregate( [
   {
     $addFields: {
       coordinates:["$Longitude","$Latitude"] }
     },
     {$out : "ipis" //Overwrite ipis, ie store result in ipis
	}
])
        
        
        
db.wifi.aggregate( [
   {
     $addFields: {
       coordinates:["$Longitude","$Latitude"] }
     },
     {$out : "wifi" //Overwrite existing if exists
	}
])
  

db.business.aggregate( [
   {
     $addFields: {
       coordinates:["$Longitude","$Latitude"] }
     },
     {$out : "business" //Overwrite existing if exists
	}
])
        

db.bike.aggregate( [
   {
     $addFields: {
       coordinates:["$longitude","$latitude"] }
     },
     {$out : "bike" //Overwrite existing if exists
	}
])
        



        
//We need to create a geospatial indexes in order to query coordinates documents after.
        
db.ipis.createIndex( { coordinates: "2d"})
db.wifi.createIndex( { coordinates: "2d" })
db.bike.createIndex({coordinates: "2d"})
db.business.createIndex( { coordinates: "2d" })
db.resto.createIndex({"address.coord": "2d"})
db.stations.createIndex({"geometry.coordinates": "2dsphere"}) //spherical indexation because document type= GeoJSON
db.museums.createIndex({"geometry.coordinates": "2dsphere"})
//Find the nearest point from a given coordinates
// maxDistance max distance is in radius. 1km= 0.0001567850289112 radius
//You can convert online via: https://www.translatorscafe.com/unit-converter/en/length/7-89/kilometer-Earth%E2%80%99s%20equatorial%20radius/

//Count number of elements near a given location in 2 km rayon- Test
db.ipis.find({ coordinates : { $near : [-74.011631,40.701695], $maxDistance: 1*0.0001567850289112} }).count()
db.wifi.find({ coordinates : { $near : [-74.011631,40.701695], $maxDistance: 10*0.0001567850289112} }).count()
db.bike.find({ coordinates : { $near : [-74.011631,40.701695], $maxDistance: 20*0.0001567850289112} }).count()
db.resto.find({ "address.coord" : { $near : [-74.011631,40.701695], $maxDistance: 10*0.0001567850289112} }).count()
db.business.find({ "coordinates" : { $near : [-74.011631,40.701695], $maxDistance: 10*0.0001567850289112} }).count()
//With GeoJSON distances are given in meters
db.stations.find({"geometry.coordinates":
       {$near :{$geometry: { type: "Point",  coordinates: [-74.011631,40.701695] },
            $maxDistance: 500}}})
db.museums.find({"geometry.coordinates":
       {$near :{$geometry: { type: "Point",  coordinates: [-74.011631,40.701695] },
            $maxDistance: 5000}}}).count()
            
            
            
            
            
 // Now lets computes metrics for each locations in ipis
 //We'll computes numbers of wifi hotspots around the location, number of restaurants, of entreprises, of museums and subways stations
 // To do this we'll use eval function even it deprecated since mongodb v 3.0 .
db.eval(function() { 
    db.ipis.find({}).forEach(function(e) {
        e.nb_wifi = db.wifi.find({ coordinates : { $near : e.coordinates, $maxDistance: 1*0.0001567850289112} }).count(); //1km
        e.nb_business = db.business.find({ coordinates : { $near : e.coordinates, $maxDistance: 10*0.0001567850289112} }).count(); //10km
        e.nb_bike = db.bike.find({ coordinates : { $near : e.coordinates, $maxDistance: 5*0.0001567850289112} }).count(); //1km
        e.nb_resto = db.resto.find({ "address.coord" : { $near :e.coordinates, $maxDistance: 10*0.0001567850289112} }).count(); //10 km
        e.nb_stations=db.stations.find({"geometry.coordinates":{$near :{$geometry: { type: "Point",  coordinates: e.coordinates },
            $maxDistance: 500}}} ).count() //0.5km
        e.nb_museums=db.museums.find({"geometry.coordinates":
       {$near :{$geometry: { type: "Point",  coordinates:e.coordinates},$maxDistance: 2000}}} ).count(); //2km
       db.ipis.save(e);
    });
});

//Linking Borough code to Borough name
// 1-Manhattan (New York County)
// 2-Bronx (Bronx County)
// 3-Brooklyn (Kings County)
// 4-Queens (Queens County)
// 5-Staten Island (Richmond County)
db.eval( function(){
        db.ipis.find({}).forEach(function(e) {
            
            switch (e.BOROUGH) {
            case 1:
                e.borough_name="Manhattan"
                break;
            case 2:
                e.borough_name="Bronx"
                break;
            case 3:
               e.borough_name="Brooklyn"
                break;
            case 4:
                e.borough_name="Queens"
                break;
            case 5:
                e.borough_name="Staten Island"
                break;
        }db.ipis.save(e);
        });
    
    
 });

//Finding the best location by sorting
//Sorting by nb_business first  
db.ipis.find({},{NTA:true, coordinates:true,"BOROUGH" : true,"nb_wifi" : true,
    "nb_resto" : true,
    "nb_stations" : true,
    "nb_bike" : true,
    "nb_museums" : true,
    "nb_business" : true}).sort( { "nb_business": -1,"nb_stations":-1,"nb_bike" : -1,"nb_resto" : -1} ).limit(10)


db.ipis.find({}).sort( { "nb_business": -1,"nb_stations":-1,"nb_bike" : -1,"nb_resto" : -1} ).limit(10)



    
//Sorting by nb_wifi first    
db.ipis.find({},{NTA:true, coordinates:true,"BOROUGH" : true,"nb_wifi" : true,
"nb_resto" : true,
"nb_stations" : true,
"nb_bike" : true,
"nb_museums" : true,
"nb_business" : true}).sort( { "nb_wifi" :-1,"nb_business": -1,"nb_stations":-1,"nb_resto" : -1} ).limit( 30)

// Sorting by  Metro stations first
db.ipis.find({},{NTA:true, coordinates:true,"BOROUGH" : true,"nb_wifi" : true,
"nb_resto" : true,
"nb_stations" : true,"nb_bike":true,
"nb_museums" : true,
"nb_business" : true}).sort( {"nb_stations" :-1,"nb_business": -1,"nb_bike":-1,"nb_resto" : -1} ).limit( 30)
// Sorting by  Bike Station
db.ipis.find({},{NTA:true, coordinates:true,"BOROUGH" : true,"nb_wifi" : true,
"nb_resto" : true,
"nb_stations" : true,"nb_bike":true,
"nb_museums" : true,
"nb_business" : true}).sort( {"nb_bike":-1,"nb_stations" :-1,"nb_business": -1,"nb_resto" : -1} ).limit( 30)

// We can also define the best locations as the locations which has at most 1 as value for 5 criterias.

db.ipis.find( { $and: [ { nb_business: { $gt: 0 } }, { nb_stations: { $gt: 0 } },{ nb_wifi: { $gt: 0 }},{ nb_resto: { $gt: 0 } },{ nb_bike: { $gt: 0 } }] }
,{NTA:true,"borough_name":true, "PARCEL_ADDRESS":true,"Longitude":true, "Latitude":true,"nb_wifi" : true,
"nb_resto" : true,"nb_stations" : true,"nb_bike":true, "nb_museums" : true,"nb_business" : true}).sort({"nb_business": -1,"nb_stations":-1,"nb_resto" : -1})

//The are sommes diplicate value we can remove then in the new collection dans order fields.
//Ordering output fields,

db.ipis.aggregate([
  {$match:{ $and: [ { nb_business: { $gt: 0 } }, { nb_stations: { $gt: 0 } },{ nb_wifi: { $gt: 0 }},{ nb_resto: { $gt: 0 } },{ nb_bike: { $gt: 0 } }] }},
   {$project: {_id : 0 ,"Arrondissemnt":"$borough_name","Quartier":"$NTA", "Adresse":"$PARCEL_ADDRESS","Longitude":"$Longitude", "Latitude":"$Latitude",
    "Entreprises":"$nb_business","Subway Stations":"$nb_stations","Restaurants":"$nb_resto","Museums":"$nb_museums","Nb Wifi" :"$nb_wifi","Bike Stations":"$nb_bike",
     }},
  {$sort:{"Entreprises": -1,"Subway Stations":-1,"Restaurants" : -1}}])
  
  

