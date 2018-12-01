/* eslint-disable no-undef */
import chai from 'chai';
import { expect } from 'chai';
import chaiHttp from 'chai-http';
import server from '../../src/server/index';
import getStore from '../../src/server/db';

chai.use(chaiHttp);
let store;

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
      const email = 'myemail@myemail.com';
      const password = '123456';
      store.saveUser(email, password);
      chai
        .request(server)
        .post('/login')
        .send({ username: email, password })
        .end((err, res) => {
          console.log(res.body);
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.deep.equal({ loggedIn: true });
          done();
        });
    });
  });
});
