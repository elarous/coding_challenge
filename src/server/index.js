/* eslint-disable no-underscore-dangle */
import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import session from 'express-session';
import LocalStrategy from 'passport-local';
import getStore from './db';

const app = express();

const storeType = process.env.PROD ? 'prod' : 'test';
const dbUrl = process.env.PROD ? process.env.PROD_DB : process.env.TEST_DB;
const store = getStore(storeType, dbUrl);

app.use(express.static('dist'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401);
  res.json({ error: 'You are not authenticated !' });
}

app.get('/test', ensureAuthenticated, (req, res) => {
  res.send('This is a test');
});

app.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ loggedIn: true });
});

app.post('/register', async (req, res) => {
  const { email } = req.body;
  const { password } = req.body;
  const user = await store.loadUser(email);
  if (user) {
    res.json({ error: 'Email Already Exists' });
  } else {
    store.saveUser(email, password);
    res.json({ success: 'User Registered Successfully' });
  }
});

async function getNearShops(userId, long, lat) {
  const nearShops = await store.nearShops({ long, lat });
  return store.filterOutDisliked(userId, nearShops);
}

app.get('/shops/nearby', async (req, res) => {
  // default to Rabat
  const coords = { long: -6.849813, lat: 33.971588 };
  const stores = await getNearShops(req.user._id, coords.long, coords.lat);
  res.json(stores);
});

app.get('/shops/nearby/:long/:lat', async (req, res) => {
  const userId = req.user._id;
  const long = +req.params.long;
  const lat = +req.params.lat;
  const shops = await getNearShops(userId, long, lat);
  res.json(shops);
});

app.use((req, res, next) => {
  res
    .status(404)
    .type('text')
    .send('Not Found');
});

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  store.User.findById(id).then(user => done(null, user));
});

passport.use(
  new LocalStrategy((email, password, done) => {
    store.loadUser(email, password).then((user) => {
      if (user) {
        return done(null, user);
      }
      return done(false);
    });
  })
);

app.listen(8080, () => console.log('Listening on port 8080!'));

export default app;
