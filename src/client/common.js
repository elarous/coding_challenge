import React, { Component } from 'react';
import { NavLink, Redirect } from 'react-router-dom';
import {
  Header, Segment, Card, Image
} from 'semantic-ui-react';

// a simple component that contains one link
// clicking on that link should logout the user
// and redirect him to the /login page
class Logout extends Component {
  constructor(props) {
    super(props);
    this.state = { authenticated: true };

    this.handleClick = this.handleClick.bind(this);
  }

  async handleClick() {
    console.log('loging out');
    const res = await fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      mode: 'cors'
    });
    const { loggedOut } = await res.json();
    console.log('Logged out ? ', loggedOut);
    this.setState({ authenticated: false });
  }

  render() {
    const { authenticated } = this.state;
    return (
      <a className="nav-link" onClick={this.handleClick}>
        Logout
        {!authenticated && <Redirect to="/login" />}
      </a>
    );
  }
}

const NavLinks = () => (
  <div>
    <nav>
      <NavLink className="nav-link" exact to="/">
        Nearby Shops
      </NavLink>
      <NavLink className="nav-link" exact to="/preferred">
        Preferred Shops
      </NavLink>
      <Logout />
    </nav>
  </div>
);

const CardsSegment = ({ loading, children }) => {
  const elements = children.length !== 0 ? (
    <div className="cards-container">{children}</div>
  ) : (
    <div className="no-cards">This List Is Empty </div>
  );

  return (
    <div className="cards-segment">
      <Segment loading={loading}>{elements}</Segment>
    </div>
  );
};

// this component is used by both NormalShopCard and PreferredShopCard
const GeneralCard = ({
  header, img, children, loading
}) => (
  <Card loading={loading} color="blue">
    <Image src={img} />
    <Card.Content>
      <Header color="blue">{header}</Header>
    </Card.Content>
    <Card.Content extra>{children}</Card.Content>
  </Card>
);

export { NavLinks, CardsSegment, GeneralCard };
