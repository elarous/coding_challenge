import React, { Component } from 'react';
import {
  BrowserRouter as Router, Switch, Route, Redirect
} from 'react-router-dom';
import { Button } from 'semantic-ui-react';
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

// a card for nearby shops
const NormalShopCard = ({
  shopId, header, img, onLike, onDislike
}) => (
  <GeneralCard header={header} img={img}>
    <LikeDislikeBtns shopId={shopId} onLike={onLike} onDislike={onDislike} />
  </GeneralCard>
);

// the main component of nearby shops page
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
      // if we couldn't get the user's location, we will call the alternative endpoint
      // no harm done
      console.log(err);
    }

    const url = pos
      ? `/api/shops/nearby/${pos.coords.longitude}/${pos.coords.latitude}`
      : '/api/shops/nearby';

    try {
      // fetching shops
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      });

      // in case the user is not authenticated
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
      // send the like request to the server
      const res = await fetch(`/api/shop/${shopId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
      // wait for the response
      const { liked } = await res.json();
      if (liked) {
        // the operation has succeeded
        // remove the target shop from the list of shops
        this.setState({ shops: this.state.shops.filter(shop => shop._id !== shopId) });
      }
    } catch (e) {
      throw e;
    }
  }

  async handleDislike(shopId) {
    // same as handleLike
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
        {/* in case an a request returned an authorization error */}
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

// when typing a url that doesn't exist
// it needs some styling
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

const App = () => (
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

export default App;
export { NearShops }; // export for testing
