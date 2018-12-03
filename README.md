# Coding Challenge

## Intro

This is a simple, trivial, incomplete solution to the challenge of creating a web app (front-end and back-end),and there is a room for improvement.

## Features

- Signing up using email and password
- Singing in using email and password
- Listing shops sorted by distance
- Liking a shop, so it's added to the Preferred shops list
- Disliking a shop, so it's not displayed for 2 hours
- Displaying the list of preferred shops
- Removing a shop from the preferred shops list

## Important But Not Implemented Features

These were not addressed intentionally, because i felt they are out the scope of this challenge and can be added later effortlessly.

- Validation
- Password Hashing
- Logging

## Try it locally

### setup

let's start by cloning the project repository

```bash
git clone https://github.com/elarouss/coding_challenge.git
```

move to the project folder using `cd coding_challenge`

then resolve the project dependencies using `npm` :

```bash
npm install
```

now that the project is ready, we can run it for development or production.

but before that we need to set some environment variables, if we need to run our application on production ( very unlikely :D ), we need to set `3` variables :

```bash
export PROD=whatever #the value needs to be truthy
export DB_PROD=url # database url for production database
export DB_TEST=url # database url for test database
```

if we didn't set the previous database `URLs` the application will default to `mongodb://localhost/ccdb`

and finally :

```bash
export SESSION_SECRET=mysecret # :) security hooray
```

there is no default for `SESSION_SECRET` so we need to set it.

### Run tests

To run test suites :

##### Database Tests

```bash
npm run testDB # the suite runs once
```

##### Server Tests

```bash
npm run testServer # it runs and watch for files change
```

##### Client Tests

```bash
npm run testClient # and infant test suite
```

### Run

#### Run For Development

```bash
npm run dev
```

the client will run on `localhost:3000` and the server on `localhost:8080`

#### Run For Production

```bash
npm run start
```

and enjoy!

#### and ?

So, After running the project, signing up, and logging in, there is no data.
let's fix that by populating some examples into the database, using a post endpoint :

```bash
curl -X POST http://localhost:8080/api/populate/shops
```
