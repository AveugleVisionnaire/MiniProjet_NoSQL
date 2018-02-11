# MiniProjet_NoSQL
The goal of this project is to find the best location where to live in New York City by using MongoDB and New York City Open Data source.

**We define the best location as location with is near from all utilities: public transports, companies, Wi-Fi Hotspot,museums etc.**


1. The file **"Download_And_Import"** contains the shell script for dowloading data and importing them the in MongoDB.
2. The file **"Queries" contains** all Javascript queries requiered to find the best location to live in New York.
2. Finally, the file Description.pdf gives more details about the project.

# Programming Environment
- Ubuntu 17.04
- MongoDB  3.6.2 : [Installation link for Ubuntu](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
- Robot Mongo 3T 1.1 [Installation link](https://download.robomongo.org/1.1.1/linux/robo3t-1.1.1-linux-x86_64-c93c6b0.tar.gz)

  In robot mongo installation step you can deal with this kind of error:\
  "This application failed to start because it could not find or load the Qt platform plugin "xcb" robot mongo" 
  
  You can sort it out by following this procedures:\
    **mkdir ~/robo-backup
    mv robo3t-1.1.1-linux-x86_64-c93c6b0/lib/libstdc++\* ~/robo-backup/
    robo3t-1.1.1-linux-x86_64-c93c6b0/bin/robo3t**
