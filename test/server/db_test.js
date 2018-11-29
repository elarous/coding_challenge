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
    it('Should insert a user with the right infos', async () => {
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
});
