# fnf-backend
* This repository contains the code for the fnf project back-end. It is decomposed into directories containing models, routes, controllers, and services
* The route files contain CRUD logic, leveraging the functions exported from the Controller files for safety and simplicity
* Credit to: Ryan, Sam, and Johnny for initial architecture and then Joe and Charlie for helping make revisions as the project evolved

## Architecture
* The backend uses JavaScript with ExpressJS for the framework and MongoDB with Mongoose for the database
* We have 10 different models, each pertaining to different elements of the app all of which have routes with CRUD operations, leveraging controllers for readability and safety of coding practice
* These models cover everything from chat rooms to users to workouts in order to provide the best user experience and allow the app to update dynamically based on the user and their data in our database
* These functions are leveraged on the front end in `src/actions/server.js` with Axios. These helper functions are then used across the app to call and send data to and from the database
* Continual testing was done during development using Postman

## Usage
For VSCode:
* Clone the repository
* Ensure that the directory is in your project location
* Run `npm run start` to connect with your local
* At the time of release we are hosted on railway at: https://fnf-prod.up.railway.app

## Authors
* Charlie Childress
* Johnny Fang
* Joe Hurle
* Sam Rothschild
* Ryan Yong
