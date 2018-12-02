import React, { Component } from 'react';
import {
  Button, Form, Grid, Header, Message, Segment, Card, Image
} from 'semantic-ui-react';

const GeneralCard = ({ header, img, children }) => (
  <Card>
    <Card.Content header={header} />
    <Image src={img} />
    <Card.Content extra>{children}</Card.Content>
  </Card>
);

export { GeneralCard };
