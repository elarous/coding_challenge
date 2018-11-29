/* eslint-disable no-undef */
const { expect } = require('chai');
const Store = require('../../src/server/db');

let store = null;

describe('Testing the persistence layer (db Store)', () => {
  before(() => {
    store = new Store();
  });

  describe('Saving a User', () => {
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
