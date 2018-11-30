/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import '@babel/polyfill';
import { expect } from 'chai';
import Store from '../../src/server/db';

let store = null;

describe('Testing the persistence layer (db Store)', () => {
  before(() => {
    store = new Store();
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
    it('Should return false if no user exist with the given email', async () => {
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
      expect(shop.coords).to.include(coords);
    });
  });

  describe('Retrieving a Shop', () => {
    it("Should return a shop using it's id", async () => {
      // Given
      const name = 'Shop 1';
      const image = 'img1.jpg';
      const coords = { lat: 1.5, long: 2.3 };
      const shop = await store.saveShop(name, image, coords);

      // When
      const retrievedShop = await store.getShopById(shop._id);

      // Then
      expect(retrievedShop.name).to.equal(name);
      expect(retrievedShop.image).to.equal(image);
      expect(retrievedShop.coords).to.include(coords);
      expect(retrievedShop._id).to.deep.equal(shop._id);
    });
  });

  describe('Preferred Shops', () => {
    it("Should add a shop to a user's preferred shops", async () => {
      // Given
      const user = await store.saveUser('test@test.com', 'random_pass');
      const shop = await store.saveShop('Shop 1', 'img1.jpg', { lat: 1.1, long: 2.2 });

      // When
      const updatedUser = await store.addToPreferred(user._id, shop._id);

      // Then
      expect(updatedUser.preferredShops)
        .is.an('array')
        .that.includes(shop._id);
    });

    it('Should load preferred shops of the given user', async () => {
      // Given
      const user = await store.saveUser('test@test.com', 'random_pass');
      const shop1 = await store.saveShop('Shop 1', 'img1.jpg', { lat: 1.1, long: 2.2 });
      const shop2 = await store.saveShop('Shop 2', 'img2.jpg', { lat: 3.3, long: 4.4 });
      await store.addToPreferred(user._id, shop1._id);
      await store.addToPreferred(user._id, shop2._id);

      // When
      const shops = await store.loadPreferredShops(user._id);

      // Then
      expect(shops[0].name).to.equal('Shop 1');
      expect(shops[1].name).to.equal('Shop 2');
    });

    it("Should remove a shop from user's preferred list", async () => {
      // Given
      const user = await store.saveUser('test@test.com', 'random_pass');
      const shop = await store.saveShop('Shop 1', 'img1.jpg', { lat: 1.1, long: 2.2 });
      await store.addToPreferred(user._id, shop._id);

      // When
      const updatedUser = await store.removeFromPreferred(user._id, shop._id);

      // Then
      expect(updatedUser.preferredShops).is.an('array').that.is.empty;
    });
  });
});
