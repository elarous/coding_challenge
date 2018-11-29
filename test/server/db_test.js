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
    });
  });
});
