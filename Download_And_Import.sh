#!/bin/sh
'This script downloads datasets needed for the project from NYC Open data website.
PS: The datasets are save in the folder where you launch script.
The package "wget" is needed to achieve the job.
Ubuntu recent version have it installed default. 
You can install it by typing: sudo apt-get install wget
'
mkdir /home/$USER/Documents/project_data
#sudo chown -R $USER:$USER /home/$USER/Documents/project_data
#cd /home/$USER/Documents/project_data /home/$USER/Documents/project_data/
wget -O /home/$USER/Documents/project_data/ipis.csv https://data.cityofnewyork.us/api/views/n5mv-nfpy/rows.csv
wget -O /home/$USER/Documents/project_data/subway_stations.geojson https://data.cityofnewyork.us/resource/kk4q-3rt2.geojson
wget -O /home/$USER/Documents/project_data/wifi_hotspot.csv https://data.cityofnewyork.us/api/views/yjub-udmw/rows.csv 
wget -O /home/$USER/Documents/project_data/museums.geojson https://data.cityofnewyork.us/resource/fn6f-htvy.geojson
wget -O /home/$USER/Documents/project_data/business_units.csv https://data.cityofnewyork.us/api/views/w7w3-xahh/rows.csv
wget -O /home/$USER/Documents/project_data/restaurants.json https://raw.githubusercontent.com/mongodb/docs-assets/primer-dataset/primer-dataset.json
wget -O /home/$USER/Documents/project_data/bike_feed.json http://citibikenyc.com/stations/json 


#Importing data in MongoDB
#Start mongod service.
sudo service mongod start 
#mongo #access to mongodb's shell command line 
#use project #crate a database name project
#quit() #Quit mongodb's shell command line 

sudo mongoimport --db project_db --collection ipis --type csv --file "/home/$USER/Documents/project_data/ipis.csv" --headerline

sudo mongoimport --db project_db --collection business --type csv --file "/home/$USER/Documents/project_data/business_units.csv" --headerline

sudo mongoimport --db project_db --collection wifi --type csv --file "/home/$USER/Documents/project_data/wifi_hotspot.csv" --headerline

sudo mongoimport --db project_db --collection resto --type json --file "/home/$USER/Documents/project_data/restaurants.json"

sudo mongoimport --db project_db --collection stationsgeo --type json --file "/home/$USER/Documents/project_data/subway_stations.geojson"

sudo mongoimport --db project_db --collection museumsgeo --type json --file "/home/$USER/Documents/project_data/museums.geojson"

sudo mongoimport --db project_db --collection bikegeo --type json --file "/home/$USER/Documents/project_data/bike_feed.json"

