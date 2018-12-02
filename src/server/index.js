/* eslint-disable no-underscore-dangle */
import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import session from 'express-session';
import LocalStrategy from 'passport-local';
import getStore from './db';

const app = express();

// type of database (test or production)
const storeType = process.env.PROD ? 'prod' : 'test';
const store = getStore(storeType);

app.use(express.static('dist'));
app.use(express.static('files'));
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

// middleware to check if a user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401);
  res.json({ error: 'You are not authenticated !' });
}

app.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ loggedIn: true });
});

app.post('/logout', (req, res) => {
  req.logout();
  res.json({ loggedOut: true });
});

app.post('/register', async (req, res) => {
  try {
    const { email } = req.body;
    const { password } = req.body;
    const user = await store.loadUser(email);
    if (user) {
      res.json({ error: 'Email Already Exists' });
    } else {
      await store.saveUser(email, password);
      res.json({ success: 'User Registered Successfully' });
    }
  } catch (e) {
    throw e;
  }
});

// get near shops for user with id userId, and who's located
// in location with coordindates long and lat
async function getNearShops(userId, long, lat) {
  try {
    // get all shops sorted by distance
    const nearShops = await store.nearShops({ long, lat });
    // exclude the ones which the user already disliked
    const dislikedExcluded = await store.filterOutDisliked(userId, nearShops);
    // exclude the ones already marked as preferred by user (liked)
    return store.filterOutPreferred(userId, dislikedExcluded);
  } catch (e) {
    throw e;
  }
}

app.get('/shops/nearby', ensureAuthenticated, async (req, res) => {
  try {
    // default to Rabat, in case the user didn't want to share his location
    const coords = { long: -6.849813, lat: 33.971588 };
    const stores = await getNearShops(req.user._id, coords.long, coords.lat);
    res.json(stores);
  } catch (e) {
    throw e;
  }
});

app.get('/shops/nearby/:long/:lat', ensureAuthenticated, async (req, res) => {
  try {
    // validating these parameters with regex is mandatory
    const userId = req.user._id;
    const long = +req.params.long;
    const lat = +req.params.lat;
    const shops = await getNearShops(userId, long, lat);
    res.json(shops);
  } catch (e) {
    throw e;
  }
});

app.post('/shop/:shopId/like', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const { shopId } = req.params;
    const user = await store.addToPreferred(userId, shopId);

    if (user) {
      res.json({ liked: true });
    } else {
      res.json({ liked: false });
    }
  } catch (e) {
    res.json({ liked: false });
    throw e;
  }
});

app.post('/shop/:shopId/dislike', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const { shopId } = req.params;
    const user = await store.addToDisliked(userId, shopId);

    if (user) {
      res.json({ disliked: true });
    } else {
      res.json({ disliked: false });
    }
  } catch (e) {
    res.json({ disliked: false });
    throw e;
  }
});

app.post('/shops/preferred/remove/:shopId', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const { shopId } = req.params;
    const user = await store.removeFromPreferred(userId, shopId);

    if (user) {
      res.json({ removed: true });
    } else {
      res.json({ removed: false });
    }
  } catch (e) {
    res.json({ removed: false });
    throw e;
  }
});

app.get('/shops/preferred/', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const shops = await store.loadPreferredShops(userId);

    res.json(shops);
  } catch (e) {
    throw e;
  }
});

app.get('/image/:img', async (req, res) => {
  res.sendFile(`${process.cwd()}/files/${req.params.img}`);
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
