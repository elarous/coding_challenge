/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import '@babel/polyfill';
import { expect } from 'chai';
import Store from '../../src/server/db';

let store = null;
let testdb = null;
const dbUrl = 'mongodb://localhost/ccdb';

describe('Testing the persistence layer (db Store)', () => {
  before(() => {
    store = new Store(dbUrl);
    testdb = store.db;
    testdb.collection('users').remove({});
    testdb.collection('shops').remove({});
  });

  after(() => {
    testdb.close();
  });

  beforeEach(function beforeEachHook() {
    this.timeout(500);
    testdb.collection('users').remove({});
    testdb.collection('shops').remove({});
  });

  describe('Saving a User', () => {
    it('Should insert a user with the right infos', async () => {
      // Given
      const email = 'test@test.com';
      const password = '123456';

      // When
      const user = await store.saveUser(email, password);

      // Then
      expect(user.email).to.equal(email);
      expect(user.password).to.equal(password);
      expect(user.preferredShops).to.be.an('array').that.is.empty;
      expect(user.dislikedShops).to.be.an('array').that.is.empty;
    });
  });

  describe('Load a User from DB', () => {
    it('Should return null if no user exist with the given email', async () => {
      // Given
      const email = 'notfound@notfound.com';

      // When
      const user = await store.loadUser(email);

      // Then
      expect(user).to.be.null;
    });

    it('Should return a the correct user using email', async () => {
      // Given
      const email = 'existing@existing.com';
      const password = 'random_password';
      await store.saveUser(email, password);

      // When
      const user = await store.loadUser(email);

      // Then
      expect(user.email).to.equal(email);
      expect(user.password).to.equal(password);
    });

    it('Should return null when for a matching email and non-matching password', async () => {
      // Given
      const email = 'another@another.com';
      const password = 'random_password';
      const differentPassword = 'different_password';
      await store.saveUser(email, password);

      // When
      const user = await store.loadUser(email, differentPassword);

      // Then
      expect(user).to.be.null;
    });

    it('Should return user using email and password', async () => {
      // Given
      const email = 'exist@exist.com';
      const password = 'a_password';
      await store.saveUser(email, password);

      // When
      const user = await store.loadUser(email, password);

      // Then
      expect(user.email).to.equal(email);
      expect(user.password).to.equal(password);
    });
  });

  describe('Saving a Shop', () => {
    it('Should insert a shop with the right infos', async () => {
      // Given
      const name = 'Shop 1';
      const image = 'img1.jpg';
      const coords = { lat: 1.5, long: 2.3 };

      // When
      const shop = await store.saveShop(name, image, coords);

      // Then
      expect(shop.name).to.equal(name);
      expect(shop.image).to.equal(image);
      expect(shop.location.coordinates).to.include.members([coords.lat, coords.long]);
    });
  });

  describe('Retrieving a Shop', () => {
    it("Should return a shop using it's id", async () => {
      // Given
      const name = 'Shop 2';
      const image = 'img1.jpg';
      const coords = { lat: 1.5, long: 2.3 };
      const shop = await store.saveShop(name, image, coords);

      // When
      const retrievedShop = await store.getShopById(shop._id);

      // Then
      expect(retrievedShop.name).to.equal(name);
      expect(retrievedShop.image).to.equal(image);
      expect(retrievedShop.location.coordinates).to.include.members([coords.lat, coords.long]);
      expect(retrievedShop._id).to.deep.equal(shop._id);
    });
  });

  describe('Preferred Shops', () => {
    it("Should add a shop to a user's preferred shops", async () => {
      // Given
      const user = await store.saveUser('test1@test1.com', 'random_pass');
      const shop = await store.saveShop('Shop 3', 'img1.jpg', { lat: 1.1, long: 2.2 });

      // When
      const updatedUser = await store.addToPreferred(user._id, shop._id);

      // Then
      expect(updatedUser.preferredShops)
        .is.an('array')
        .that.includes(shop._id);
    });

    it('Should load preferred shops of the given user', async () => {
      // Given
      const user = await store.saveUser('test2@test2.com', 'random_pass');
      const shop1 = await store.saveShop('Shop 4', 'img1.jpg', { lat: 1.1, long: 2.2 });
      const shop2 = await store.saveShop('Shop 5', 'img2.jpg', { lat: 3.3, long: 4.4 });
      await store.addToPreferred(user._id, shop1._id);
      await store.addToPreferred(user._id, shop2._id);

      // When
      const shops = await store.loadPreferredShops(user._id);

      // Then
      expect(shops[0].name).to.equal('Shop 4');
      expect(shops[1].name).to.equal('Shop 5');
    });

    it('Should remove a shop from user\'s preferred list', async () => {
      // Given
      const user = await store.saveUser('tes3t@test3.com', 'random_pass');
      const shop = await store.saveShop('Shop 6', 'img1.jpg', { lat: 1.1, long: 2.2 });
      await store.addToPreferred(user._id, shop._id);

      // When
      const updatedUser = await store.removeFromPreferred(user._id, shop._id);

      // Then
      expect(updatedUser.preferredShops).is.an('array').that.is.empty;
    });
  });

  describe('Disliked Shops', () => {
    it('Should add a shop to user\'s disliked shops list', async () => {
      // Given
      const user = await store.saveUser('test4@test4.com', 'random_pass');
      const shop = await store.saveShop('Shop 7', 'img1.jpg', { lat: 1.1, long: 2.2 });

      // When
      const updatedUser = await store.addToDisliked(user._id, shop._id);

      // Then
      expect(updatedUser.dislikedShops).is.an('array').that.have.lengthOf(1);
      expect(updatedUser.dislikedShops[0].shop).is.equal(shop._id.toString());
    });

    it('Should add a timestamp when adding a shop to the user\'s disliked list', async () => {
      // Given
      const user = await store.saveUser('test5@test5.com', 'random_password');
      const shop = await store.saveShop('Shop 8', 'img1.jpg', { lat: 1.1, long: 2.2 });
      const currentTime = new Date();

      // When
      const updatedUser = await store.addToDisliked(user._id, shop._id);

      // Then
      expect(updatedUser.dislikedShops[0].timestamp).is.a('Date');
      expect(+updatedUser.dislikedShops[0].timestamp).to.be.at.least(+currentTime);
    });
  });

  describe('Listing Shops', () => {
    it('Should get nearest shops', async () => {
      // Given
      const moscowShop = await store.saveShop('Shop 9', 'img1.jpg', { long: 37.618423, lat: 55.751244 });
      const parisShop = await store.saveShop('Shop 10', 'img1.jpg', { lat: 48.864716, long: 2.349014 });
      const marrakesh = { long: -7.973328, lat: 31.669746 };

      // When
      const shops = await store.nearShops(marrakesh);

      // Then
      expect(shops[0].name).to.equal(parisShop.name);
      expect(shops[1].name).to.equal(moscowShop.name);
    });
  });
});
