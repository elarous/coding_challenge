import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import session from 'express-session';
import LocalStrategy from 'passport-local';
import Store from './db';

const app = express();
const store = new Store(process.env.DATABASE_URL);

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
  console.log('New request !');
  if (req.isAuthenticated()) {
    return next();
  }
  res.json({ error: 'You are not authenticated !' });
}

app.get('/test', (req, res) => {
  res.send('good');
});

app.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ loggedIn: true });
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
