import React, { Component } from 'react';
import {
  BrowserRouter as Router, Switch, Route, Link
} from 'react-router-dom';
import {
  Button, Form, Grid, Header, Message, Segment, Card, Image
} from 'semantic-ui-react';
import { RegisterForm } from './register';
import { LoginForm } from './login';
import './app.css';

/*

*/

// cards
const GeneralCard = ({ header, img, children }) => (
  <Card>
    <Card.Content header={header} />
    <Image src={img} />
    <Card.Content extra>{children}</Card.Content>
  </Card>
);

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

const NearShops = () => (
  <div>
    <h1>Home page</h1>
    <Link to="/register">register</Link>
    <Link to="/login">login</Link>
    <br />
    <NormalShopCard
      header="Shop 1 card"
      img="https://react.semantic-ui.com/images/avatar/large/matthew.png"
    />

    <PreferredShopCard
      header="Shop 1 card"
      img="https://react.semantic-ui.com/images/avatar/large/matthew.png"
    />
  </div>
);

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
