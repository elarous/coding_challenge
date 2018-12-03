import React, { Component } from 'react';
import {
  BrowserRouter as Router, Switch, Route, Link, NavLink, Redirect
} from 'react-router-dom';
import {
  Button, Form, Grid, Header, Message, Segment, Card, Image
} from 'semantic-ui-react';

const NavLinks = () => (
  <nav>
    <NavLink className="nav-link" to="/">
      Nearby Shops
    </NavLink>
    <NavLink className="nav-link" to="/preferred">
      Preferred Shops
    </NavLink>
  </nav>
);

const CardsSegment = ({ loading, children }) => (
  <div className="cards-segment">
    <Segment loading={loading}>
      <div className="cards-container">{children}</div>
    </Segment>
  </div>
);

const GeneralCard = ({
  header, img, children, loading
}) => (
  <Card loading={loading}>
    <Card.Content header={header} />
    <Image src={img} />
    <Card.Content extra>{children}</Card.Content>
  </Card>
);

export { NavLinks, CardsSegment, GeneralCard };
