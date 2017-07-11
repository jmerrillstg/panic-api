# Panic API

This application provides the back-end to the Panic Button

## Installation

This application needs NodeJS 6.x and MySQL 5.6 (or MariaDB 10.x)

To install the project clone the repo and then run the following command in the terminal while in the clone directory.
```
npm install
```
Create a new mysql database and import **/panic.sql** into it. 

After installation you will need to copy **/appConfig-template.js** to **/appConfig.js** (which is already ignored from git) and follow the instructions in the file.

## Development

Once installed you can run the project by running the following command from the project's root directory

```
npm start
```

This starts the application on port 3001 under nodemon which will restart the server whenever any changes are detected.

## Deployment
This application needs to run as root on the Raspberry Pi.  Start it with the following command

```
sudo /usr/bin/node /home/pi/www/panic-api/server.js
```

This can be added to systemd so it will run on boot.