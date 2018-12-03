import React, { Component } from 'react';
import { BrowserRouter as Redirect } from 'react-router-dom';
import { Button } from 'semantic-ui-react';

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

// the main component for preferred shops page, it fetches data from the server
class PreferredShops extends Component {
  constructor(props) {
    super(props);
    this.state = { authenticated: true, loading: true, shops: [] };

    this.handleRemove = this.handleRemove.bind(this);
  }

  async componentDidMount() {
    try {
      const res = await fetch('/api/shops/preferred', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
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

  async handleRemove(shopId) {
    console.log('remove', shopId);
    try {
      const res = await fetch(`/api/shops/preferred/remove/${shopId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
      const { removed } = await res.json();
      if (removed) {
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
