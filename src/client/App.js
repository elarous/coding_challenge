import React, { Component } from 'react';
import {
  BrowserRouter as Router, Switch, Route, Link, NavLink, Redirect
} from 'react-router-dom';
import {
  Button, Form, Grid, Header, Message, Segment, Card, Image
} from 'semantic-ui-react';
import { RegisterForm } from './register';
import { LoginForm } from './login';
import { GeneralCard, CardsSegment, NavLinks } from './common';
import { PreferredShops } from './preferred';

const LikeDislikeBtns = ({ shopId, onLike, onDislike }) => (
  <div style={{ display: 'flex', justifyContent: 'space-around' }}>
    <Button
      onClick={() => onDislike(shopId)}
      content="Dislike"
      icon="thumbs down"
      labelPosition="left"
    />
    <Button onClick={() => onLike(shopId)} content="Like" icon="thumbs up" labelPosition="left" />
  </div>
);

const NormalShopCard = ({
  shopId, header, img, onLike, onDislike
}) => (
  <GeneralCard header={header} img={img}>
    <LikeDislikeBtns shopId={shopId} onLike={onLike} onDislike={onDislike} />
  </GeneralCard>
);

class NearShops extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: true, shops: [], authenticated: true };

    this.handleLike = this.handleLike.bind(this);
    this.handleDislike = this.handleDislike.bind(this);
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

  async handleLike(shopId) {
    console.log(`like ${shopId}`);
    try {
      const res = await fetch(`/api/shop/${shopId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
      const { liked } = await res.json();
      if (liked) {
        this.setState({ shops: this.state.shops.filter(shop => shop._id !== shopId) });
      }
    } catch (e) {
      throw e;
    }
  }

  async handleDislike(shopId) {
    console.log(`dislike ${shopId}`);
    try {
      const res = await fetch(`/api/shop/${shopId}/dislike`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
      const { disliked } = await res.json();
      if (disliked) {
        this.setState({ shops: this.state.shops.filter(shop => shop._id !== shopId) });
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
        <NavLinks />
        <CardsSegment loading={loading}>
          {shops.map(shop => (
            <NormalShopCard
              key={shop._id}
              shopId={shop._id}
              header={shop.name}
              img={`/api/image/${shop.image}`}
              onLike={this.handleLike}
              onDislike={this.handleDislike}
            />
          ))}
        </CardsSegment>
      </div>
    );
  }
}

const NotFound = () => <h1> NOT FOUND :(</h1>;

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

const Main = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={NearShops} />
      <Route exact path="/register" component={RegisterPage} />
      <Route exact path="/login" component={LoginPage} />
      <Route exact path="/preferred" component={PreferredShops} />
      <Route component={NotFound} />
    </Switch>
  </Router>
);

const App = () => <Main />;

export default App;
export { NearShops };
