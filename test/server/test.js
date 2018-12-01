/* eslint-disable no-undef */
import chai from 'chai';
import { expect } from 'chai';
import chaiHttp from 'chai-http';
import server from '../../src/server/index';

chai.use(chaiHttp);

describe('User Authentication', () => {
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
  });
});
