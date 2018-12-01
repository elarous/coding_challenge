/* eslint-disable no-unused-expressions */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import '@babel/polyfill';
import chai from 'chai';
import { expect } from 'chai';
import chaiHttp from 'chai-http';
import server from '../../src/server/index';
import getStore from '../../src/server/db';

chai.use(chaiHttp);
let store;
let agent;

/* common variables */
let currentUser;
let tokyoShop;
const email = 'myemail@myemail.com';
const password = '123456';

describe('User Authentication', () => {
  before(() => {
    store = getStore('test', null);
  });

  beforeEach(async () => {
    try {
      await store.db.collection('users').remove({});
      await store.db.collection('shops').remove({});
    } catch (e) {
      throw e;
    }
  });

  describe('User can login using email and password', () => {
    it('Should return unauthorized error when trying login with wrong credentils', async () => {
      try {
        const res = await chai
          .request(server)
          .post('/login')
          .send({ username: 'random@random.com', password: '12345' });

        expect(res).to.have.status(401);
        expect(res.text).to.equal('Unauthorized');
      } catch (e) {
        throw e;
      }
    });
    it('Should authenticate the user with right credentials', async () => {
      try {
        await store.saveUser(email, password);
        const res = await chai
          .request(server)
          .post('/login')
          .send({ username: email, password });

        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.deep.equal({ loggedIn: true });
      } catch (e) {
        throw e;
      }
    });
  });

  describe('Visitor can sign up using email and password', () => {
    it('Should return an error when signing up with an email that already exists', async () => {
      try {
        await store.saveUser(email, password);
        const res = await chai
          .request(server)
          .post('/register')
          .send({ email, password });

        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.deep.equal({ error: 'Email Already Exists' });
      } catch (e) {
        throw e;
      }
    });

    it('Should successfully register a user using email and password', async () => {
      try {
        const res = await chai
          .request(server)
          .post('/register')
          .send({ email, password });

        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.deep.equal({ success: 'User Registered Successfully' });
      } catch (e) {
        throw e;
      }
    });
  });
});

describe('Features That Needs Authentication', () => {
  before(async () => {
    try {
      store = getStore('test', null);
      await store.db.collection('users').remove({});
      currentUser = await store.saveUser(email, password);
      agent = chai.request.agent(server);
      await agent.post('/login').send({ username: email, password });
    } catch (e) {
      throw e;
    }
  });

  after(() => {
    agent.close();
  });

  beforeEach(async () => {
    try {
      await store.db.collection('shops').remove({});
      const shops = [
        ['Shop 1 Casablanca', 'img1.jpg', { long: -7.589843, lat: 33.573109 }],
        ['Shop 2 Paris', 'img2.jpg', { long: 2.352222, lat: 48.856613 }],
        ['Shop 3 Berlin', 'img3.jpg', { long: 13.404954, lat: 52.520008 }],
        ['Shop 4 Tokyo', 'img4.jpg', { long: 139.691711, lat: 35.689487 }]
      ];

      await Promise.all(shops.map(shop => store.saveShop(...shop)));
      tokyoShop = await store.db.collection('shops').findOne({ name: 'Shop 4 Tokyo' });
    } catch (e) {
      throw e;
    }
  });

  describe('Nearby Shops', () => {
    it('Should get nearby shops without providing coords', async () => {
      try {
        const res = await agent.get('/shops/nearby');

        expect(res).to.have.status(200);
        expect(res.body).is.an('array');
        expect(res.body[0]).to.have.property('name');
        expect(res.body[0]).to.have.property('image');
        expect(res.body[0]).to.have.property('_id');
      } catch (e) {
        throw e;
      }
    });

    it("Should get nearby shops to a point using it's coordinates", async () => {
      try {
        // Shanghai, China coords
        const res = await agent.get('/shops/nearby/121.473701/31.230391');

        expect(res).to.have.status(200);
        // nearest shop is the one in Tokyo
        expect(res.body[0].name).to.equal('Shop 4 Tokyo');
      } catch (e) {
        throw e;
      }
    });

    it('Should exclude disliked shops from the list of nearby shops', async () => {
      try {
        await store.addToDisliked(currentUser._id, tokyoShop._id);
        // Shanghai again
        const res = await agent.get('/shops/nearby/121.473701/31.230391');

        expect(res).to.have.status(200);
        expect(res.body[0].name).to.not.equal('Shop 4 Tokyo');
      } catch (e) {
        throw e;
      }
    });

    it('Should exclude preferred shops from the list of nearby shops', async () => {
      try {
        await store.addToPreferred(currentUser._id, tokyoShop._id);
        // Shanghai again :)
        const res = await agent.get('/shops/nearby/121.473701/31.230391');

        expect(res).to.have.status(200);
        expect(res.body[0].name).to.not.equal('Shop 4 Tokyo');
      } catch (e) {
        throw e;
      }
    });
  });

  describe('Shop Operations', () => {
    it("Should add a shop to the user's preferred list after a like", async () => {
      try {
        const res = await agent.post(`/shop/${tokyoShop._id}/like`);

        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.deep.equal({ liked: true });
      } catch (e) {
        throw e;
      }
    });

    it("Should add a shop to user's disliked list after a dislike", async () => {
      try {
        const res = await agent.post(`/shop/${tokyoShop._id}/dislike`);

        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.deep.equal({ disliked: true });
      } catch (e) {
        throw e;
      }
    });

    it("Should remove a shop from user's preferred list", async () => {
      try {
        const res = await agent.post(`/shops/preferred/remove/${tokyoShop._id}`);

        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.deep.equal({ removed: true });
      } catch (e) {
        throw e;
      }
    });
  });

  describe('Listing Preferred Shops', () => {
    it("Should list all user's preferred shops", async () => {
      try {
        await store.addToPreferred(currentUser._id, tokyoShop._id);
        const res = await agent.get('/shops/preferred/');

        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body)
          .to.be.an('array')
          .that.have.lengthOf(1);
        expect(res.body[0].name).to.equal(tokyoShop.name);
      } catch (e) {
        throw e;
      }
    });
  });
});
