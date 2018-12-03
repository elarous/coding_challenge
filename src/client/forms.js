import React from 'react';
import {
  Button, Form, Grid, Header, Message
} from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const FormHeader = ({ text }) => (
  <Header as="h2" color="blue" textAlign="center">
    {text}
  </Header>
);

const FormInput = ({
  icon, placeholder, type, value, onChange
}) => (
  <Form.Input
    fluid
    value={value}
    icon={icon}
    iconPosition="left"
    placeholder={placeholder}
    onChange={onChange}
    type={type}
  />
);

const FormButton = ({ text, onClick }) => (
  <Button color="blue" fluid size="large" onClick={onClick}>
    {text}
  </Button>
);

// this is the message shown below a Form (ex: to invite a user to login instead)
// FormFeedBack is the component for error and sucess messages
const FormMessage = ({ text, linkUrl, linkText }) => (
  <Message>
    {text}
    {' '}
    <Link to={linkUrl}>{linkText}</Link>
  </Message>
);

const FormContainer = ({ children }) => (
  <div className="form-container">
    <Grid verticalAlign="middle">
      <Grid.Column>{children}</Grid.Column>
    </Grid>
  </div>
);

const FormFeedback = ({ isError, content }) => {
  const msg = isError ? 'Somthing Went Wrong!' : 'Operation Succeeded!';
  return (
    <Message negative={isError} positive={!isError}>
      <Message.Header>{msg}</Message.Header>
      <p>{content}</p>
    </Message>
  );
};

export {
  FormContainer, FormHeader, FormButton, FormInput, FormMessage, FormFeedback
};
