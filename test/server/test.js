/* eslint-disable no-undef */
import '@babel/polyfill';
import chai from 'chai';
import { expect } from 'chai';
import chaiHttp from 'chai-http';
import server from '../../src/server/index';
import getStore from '../../src/server/db';

chai.use(chaiHttp);
let store;
const agent = chai.request.agent(server);

/* common variables */
const email = 'myemail@myemail.com';
const password = '123456';

describe('User Authentication', () => {
  before(() => {
    store = getStore('test', null);
  });

  beforeEach(() => {
    store.db.collection('users').remove({});
    store.db.collection('shops').remove({});
  });

  describe('User can login using email and password', () => {
    it('Should return unauthorized error when trying login with wrong credentils', (done) => {
      chai
        .request(server)
        .post('/login')
        .send({ username: 'random@random.com', password: '12345' })
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.text).to.equal('Unauthorized');
          done();
        });
    });
    it('Should authenticate the user with right credentials', (done) => {
      store.saveUser(email, password);
      chai
        .request(server)
        .post('/login')
        .send({ username: email, password })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.deep.equal({ loggedIn: true });
          done();
        });
    });
  });

  describe('Visitor can sign up using email and password', () => {
    it('Should return an error when signing up with an email that already exists', (done) => {
      store.saveUser(email, password);
      chai
        .request(server)
        .post('/register')
        .send({ email, password })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.deep.equal({ error: 'Email Already Exists' });
          done();
        });
    });

    it('Should successfully register a user using email and password', (done) => {
      chai
        .request(server)
        .post('/register')
        .send({ email, password })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.deep.equal({ success: 'User Registered Successfully' });
          done();
        });
    });
  });
});

describe('Features That Needs Authentication', () => {
  before(async () => {
    store = getStore('test', null);
    store.db.collection('users').remove({});
    store.saveUser(email, password);

    await agent.post('/login').send({ username: email, password });
  });

  beforeEach(() => {
    store.db.collection('shops').remove({});
    const shops = [
      ['Shop 1 Casablanca', 'img1.jpg', { long: -7.589843, lat: 33.573109 }],
      ['Shop 2 Paris', 'img2.jpg', { long: 2.352222, lat: 48.856613 }],
      ['Shop 3 Berlin', 'img3.jpg', { long: 13.404954, lat: 52.520008 }],
      ['Shop 4 Tokyo', 'img4.jpg', { long: 139.691711, lat: 35.689487 }]
    ];

    shops.forEach((shop) => {
      store.saveShop(shop[0], shop[1], shop[2]);
    });
  });

  describe('Nearby Shops', () => {
    it('Should get nearby shops without providing coords', (done) => {
      agent
        .get('/shops/nearby')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body).is.an('array');
          expect(res.body[0]).to.have.property('name');
          expect(res.body[0]).to.have.property('image');
          expect(res.body[0]).to.have.property('_id');
          done();
        })
        .catch(err => done(err));
    });

    it('Should get nearby shops to a point using it\'s coordinates', (done) => {
      agent
        .get('/shops/nearby/121.473701/31.230391') // Shanghai, China coords
        .then((res) => {
          expect(res).to.have.status(200);
          // nearest shop is the one in Tokyo
          expect(res.body[0].name).to.equal('Shop 4 Tokyo');
          done();
        })
        .catch(err => done(err));
    });
  });
});
