/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import '@babel/polyfill';
import { expect } from 'chai';
import getStore from '../../src/server/db';

let store = null;
let testdb = null;

/* users */
const samiPassword = '12345';
const samiEmail = 'sami@sami.com';
let sami = null;

const jamesEmail = 'james@james.com';
const jamesPassword = 'abcde';

/* location */
const marrakesh = { long: -7.973328, lat: 31.669746 };

/* shops */
const moscowName = 'Moscow Shop';
const moscowImage = 'moscow_img.jpg';
const moscowCoords = { long: 37.618423, lat: 55.751244 };

const parisName = 'Paris Shop';
const parisImage = 'paris_img.jpg';
const parisCoords = { lat: 48.864716, long: 2.349014 };

let moscowShop = null;
let parisShop = null;

describe('Testing the persistence layer (db Store)', () => {
  before(async () => {
    store = getStore('test', null);
    testdb = store.db;
    testdb.collection('users').remove({});
    testdb.collection('shops').remove({});
  });

  after(() => {
    testdb.collection('users').remove({});
    testdb.collection('shops').remove({});
    testdb.close();
  });

  beforeEach(async function beforeEachHook() {
    this.timeout(500);
    await testdb.collection('users').remove({});
    await testdb.collection('shops').remove({});

    sami = await store.saveUser(samiEmail, samiPassword);
    moscowShop = await store.saveShop(moscowName, moscowImage, moscowCoords);
  });

  describe('Saving a User', () => {
    it('Should insert a user with the right infos', async () => {
      // Given
      /* james credentials */

      // When
      const james = await store.saveUser(jamesEmail, jamesPassword);

      // Then
      expect(james.email).to.equal(jamesEmail);
      expect(james.password).to.equal(jamesPassword);
      expect(james.preferredShops).to.be.an('array').that.is.empty;
      expect(james.dislikedShops).to.be.an('array').that.is.empty;
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
      /* sami is in DB */

      // When
      const user = await store.loadUser(samiEmail);

      // Then
      expect(user.email).to.equal(samiEmail);
      expect(user.password).to.equal(samiPassword);
    });

    it('Should return null when for a matching email and non-matching password', async () => {
      // Given
      /* sami is in DB */
      const notSamiPassword = 'different_password';

      // When
      const user = await store.loadUser(samiEmail, notSamiPassword);

      // Then
      expect(user).to.be.null;
    });

    it('Should return user using email and password', async () => {
      // Given
      /* sami is in DB */

      // When
      const user = await store.loadUser(samiEmail, samiPassword);

      // Then
      expect(user.email).to.equal(samiEmail);
      expect(user.password).to.equal(samiPassword);
    });
  });

  describe('Saving a Shop', () => {
    it('Should insert a shop with the right infos', async () => {
      // Given
      /* paris shop infos */

      // When
      const shop = await store.saveShop(parisName, parisImage, parisCoords);

      // Then
      expect(shop.name).to.equal(parisName);
      expect(shop.image).to.equal(parisImage);
      expect(shop.location.coordinates).to.include.members([parisCoords.lat, parisCoords.long]);
    });
  });

  describe('Retrieving a Shop', () => {
    it("Should return a shop using it's id", async () => {
      // Given
      /* moscow shop already in db */

      // When
      const retrievedShop = await store.getShopById(moscowShop._id);

      // Then
      expect(retrievedShop.name).to.equal(moscowName);
      expect(retrievedShop.image).to.equal(moscowImage);
      expect(retrievedShop.location.coordinates).to.include.members([
        moscowCoords.lat,
        moscowCoords.long
      ]);
      expect(retrievedShop._id).to.deep.equal(moscowShop._id);
    });
  });

  describe('Preferred Shops', () => {
    it("Should add a shop to a user's preferred shops", async () => {
      // Given
      /* user sami already in db */
      /* shop moscow alrady in db */

      // When
      const updatedUser = await store.addToPreferred(sami._id, moscowShop._id);

      // Then
      expect(updatedUser.preferredShops)
        .is.an('array')
        .that.includes(moscowShop._id);
    });

    it('Should load preferred shops of the given user', async () => {
      // Given
      /* user sami already in db */
      /* moscow shop already in db */
      parisShop = await store.saveShop(parisName, parisImage, parisCoords);
      await store.addToPreferred(sami._id, moscowShop._id);
      await store.addToPreferred(sami._id, parisShop._id);

      // When
      const shops = await store.loadPreferredShops(sami._id);

      // Then
      expect(shops[0].name).to.equal(moscowName);
      expect(shops[1].name).to.equal(parisName);
    });

    it("Should remove a shop from user's preferred list", async () => {
      // Given
      /* user sami already in db */
      /* moscow shop alrady in db */
      await store.addToPreferred(sami._id, moscowShop._id);

      // When
      const updatedUser = await store.removeFromPreferred(sami._id, moscowShop._id);

      // Then
      expect(updatedUser.preferredShops).is.an('array').that.is.empty;
    });
  });

  describe('Disliked Shops', () => {
    it("Should add a shop to user's disliked shops list", async () => {
      // Given
      /* user sami already in db */
      /* shop moscow already in db */

      // When
      const updatedUser = await store.addToDisliked(sami._id, moscowShop._id);

      // Then
      expect(updatedUser.dislikedShops)
        .is.an('array')
        .that.have.lengthOf(1);
      expect(updatedUser.dislikedShops[0].shop).is.equal(moscowShop._id.toString());
    });

    it("Should add a timestamp when adding a shop to the user's disliked list", async () => {
      // Given
      /* user sami already in db */
      /* shop moscow already in db */
      const currentTime = new Date();

      // When
      const updatedUser = await store.addToDisliked(sami._id, moscowShop._id);

      // Then
      expect(updatedUser.dislikedShops[0].timestamp).is.a('Date');
      expect(+updatedUser.dislikedShops[0].timestamp).to.be.at.least(+currentTime);
    });
  });

  describe('Listing Shops', () => {
    it('Should get nearest shops', async () => {
      // Given
      /* moscow shop alrady in db */
      parisShop = await store.saveShop(parisName, parisImage, parisCoords);

      // When
      const shops = await store.nearShops(marrakesh);

      // Then
      expect(shops[0].name).to.equal(parisShop.name);
      expect(shops[1].name).to.equal(moscowShop.name);
    });

    it('Should filter out disliked shops of the nearest shops', async () => {
      // Given
      /* user sami already in db */
      /* moscow shop already in db */
      await store.addToDisliked(sami._id, moscowShop._id);
      const nearShops = await store.nearShops(marrakesh);

      // When
      const newShops = await store.filterOutDisliked(sami._id, nearShops);

      // Then
      expect(newShops)
        .to.be.an('array')
        .that.have.lengthOf(0);
    });

    it('Should exclude disliked shops only if they were disliked in less than 2 hours', async () => {
      // Given
      /* user sami already in db */
      /* moscow shop already in db */
      const fiveHoursAgo = +Date.now() - 5 * 60 * 60 * 1000;
      const now = Date.now();
      parisShop = await store.saveShop(parisName, parisImage, parisCoords);
      await store.addToDisliked(sami._id, moscowShop._id, fiveHoursAgo);
      await store.addToDisliked(sami._id, parisShop._id, now);
      const nearShops = await store.nearShops(marrakesh);

      // When
      const newShops = await store.filterOutDisliked(sami._id, nearShops);

      // Then
      expect(newShops)
        .to.be.an('array')
        .that.have.lengthOf(1);
      expect(newShops[0].name).to.equal(moscowName);
    });
  });
});
