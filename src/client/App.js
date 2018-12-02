import React, { Component } from 'react';
import {
  BrowserRouter as Router, Switch, Route, Link, NavLink, Redirect
} from 'react-router-dom';
import {
  Button, Form, Grid, Header, Message, Segment, Card, Image
} from 'semantic-ui-react';
import { RegisterForm } from './register';
import { LoginForm } from './login';
import { GeneralCard } from './cards';
import './app.css';

const LikeDislikeBtns = () => (
  <div style={{ display: 'flex', justifyContent: 'space-around' }}>
    <Button content="Dislike" icon="thumbs down" labelPosition="left" />
    <Button content="Like" icon="thumbs up" labelPosition="left" />
  </div>
);

const RemoveBtn = () => (
  <div>
    <Button content="Remove" icon="trash" labelPosition="left" />
  </div>
);

const NormalShopCard = ({ header, img }) => (
  <GeneralCard header={header} img={img}>
    <LikeDislikeBtns />
  </GeneralCard>
);

const PreferredShopCard = ({ header, img }) => (
  <GeneralCard header={header} img={img}>
    <RemoveBtn />
  </GeneralCard>
);

// pages
const RegisterPage = () => (
  <div id="register-page" className="page">
    <RegisterForm />
  </div>
);

const LoginPage = () => (
  <div id="login-page" className="page">
    <LoginForm />
  </div>
);

const NavBtns = () => (
  <nav>
    <NavLink className="nav-link" to="/">
      Nearby Shops
    </NavLink>
    <NavLink className="nav-link" to="/preferred">
      Preferred Shops
    </NavLink>
  </nav>
);

class NearShops extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: true, shops: [], authenticated: true };
  }

  async componentDidMount() {
    const position = new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => resolve(pos), err => reject(err));
      } else {
        reject(Error('navigator geolocation not found'));
      }
    });

    let pos;
    try {
      pos = await position;
    } catch (err) {
      console.log(err);
    }

    const url = pos
      ? `/api/shops/nearby/${pos.coords.longitude}/${pos.coords.latitude}`
      : '/api/shops/nearby';

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        mode: 'cors'
      });

      if (res.status === 401) {
        this.setState({ authenticated: false, loading: false });
      } else {
        const json = await res.json();
        console.log(json);
        this.setState({ loading: false, shops: json });
      }
    } catch (e) {
      throw e;
    }
  }

  render() {
    const { authenticated, loading, shops } = this.state;
    return (
      <div>
        {!authenticated && <Redirect to="/login" />}
        <NavBtns />
        <div className="cards-segment">
          <Segment loading={loading}>
            <div className="cards-container">
              {shops.map(shop => (
                <NormalShopCard header={shop.name} img={`/api/image/${shop.image}`} />
              ))}
            </div>
          </Segment>
        </div>
      </div>
    );
  }
}

const NotFound = () => <h1> NOT FOUND :(</h1>;

const Main = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={NearShops} />
      <Route exact path="/register" component={RegisterPage} />
      <Route exact path="/login" component={LoginPage} />
      <Route component={NotFound} />
    </Switch>
  </Router>
);

const App = () => <Main />;

export default App;
