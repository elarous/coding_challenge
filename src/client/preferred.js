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

const RemoveBtn = () => (
  <div>
    <Button content="Remove" icon="trash" labelPosition="left" />
  </div>
);

const PreferredShopCard = ({ header, img }) => (
  <GeneralCard header={header} img={img}>
    <RemoveBtn />
  </GeneralCard>
);

class PreferredShops extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <h1>Preferred shops</h1>;
  }
}

export { PreferredShops };
