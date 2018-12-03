import React, { Component } from 'react';
import {
  BrowserRouter as Router, Switch, Route, Link, NavLink, Redirect
} from 'react-router-dom';
import {
  Button, Form, Grid, Header, Message, Segment, Card, Image
} from 'semantic-ui-react';

import { GeneralCard, NavLinks, CardsSegment } from './common';

const RemoveBtn = ({ onRemove }) => (
  <div>
    <Button onClick={onRemove} content="Remove" icon="trash" labelPosition="left" />
  </div>
);

const PreferredShopCard = ({
  header, img, shopId, onRemove
}) => (
  <GeneralCard header={header} img={img}>
    <RemoveBtn onRemove={() => onRemove(shopId)} />
  </GeneralCard>
);

class PreferredShops extends Component {
  constructor(props) {
    super(props);
    this.state = { authenticated: true, loading: false, shops: [] };
  }

  handleRemove(shopId) {
    console.log('remove', shopId);
  }

  async componentDidMount() {
    try {
      const res = await fetch('/api/shops/preferred', {
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
        <NavLinks />
        <CardsSegment loading={loading}>
          {shops.map(shop => (
            <PreferredShopCard
              key={shop._id}
              shopId={shop._id}
              header={shop.name}
              img={`/api/image/${shop.image}`}
              onRemove={this.handleRemove}
            />
          ))}
        </CardsSegment>
      </div>
    );
  }
}

export { PreferredShops };
