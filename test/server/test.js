/* eslint-disable no-undef */
import chai from 'chai';
import { expect } from 'chai';
import chaiHttp from 'chai-http';
import server from '../../src/server/index';
import Store from '../../src/server/db';

chai.use(chaiHttp);

let store;

describe('User Authentication', () => {
  before(() => {
    store = new Store(process.env.TEST_DB);
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
      const user = store.loadUser('sami@sami.com');
      console.log(user);
      expect(user).to.be.json;
    });
  });
});
