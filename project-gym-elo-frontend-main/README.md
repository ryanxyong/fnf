# FLEX N FRIENDS

Flex N Friends is the one stop shop for communal and personal gym record-keeping. We want this app to supercede the competition by providing an intuitive UI with strong communal aspects as the centerpiece of our design. The 4 main pillars of this product are users, workouts, communication, and teams. Users can network and meet new gym-goers through the friend system, which allows them to communicate via messages and coordinate team or gym-wide events!

## Architecture

Our implementation spreads across two repositories: one for the front-end and the other for the back-end. On the back-end we further split up our microservices into their subdirectories. This leads to 2 repositories: with front-end handling the UI and the UX, while back-end deals with the data and passes it to the front end enabling the front end to dynamically update based on user data. We will be using JavaScript, specifically ExpressJS, for back-end programming. For our back-end we leverage MongoDB, and for image cloud storage we use Cloudinary. For front-end, we will use React Native along with Bootstrap to style a webapp with wide distribution potential.

## Setup

For VSCode:
* Clone the repository
* Ensure that the directory is in your project location
* Run `npm install` to download packages. Then run `npm run start` to start code
* Enjoy!

## Deployment

At the time of release, Technigala 03/05/2024, the app is deployed on Apple's TestFlight service, a beta service for the AppStore which we could later deploy it on. This enables us to onboard users in limited numbers and display the full functionality of the app. The building and shipping is done via expo which sends our code along to TestFlight.

## Authors

Charlie Childress
Johnny Fang
Joe Hurle
Sam Rothschild
Ryan Yong

## Acknowledgments

Thank you to Professor Tregubov and Professor Svoboda for the support and guidance throughout our Flex N Friends journey!
