import React, { Component } from 'react';
import {
  Button, Form, Grid, Header, Message, Segment, Card, Image
} from 'semantic-ui-react';

import {
  FormButton,
  FormContainer,
  FormHeader,
  FormMessage,
  FormInput,
  FormFeedback
} from './forms';

class RegisterForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: 'here',
      password: '',
      repassword: '',
      showMsg: false,
      msgType: '',
      msgContent: ''
    };

    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleRepasswordChane = this.handleRepasswordChane.bind(this);
    this.tryRegister = this.tryRegister.bind(this);
  }

  handleEmailChange(e) {
    this.setState({ email: e.target.value });
  }

  handlePasswordChange(e) {
    this.setState({ password: e.target.value });
  }

  handleRepasswordChane(e) {
    this.setState({ repassword: e.target.value });
  }

  async tryRegister() {
    const { email } = this.state;
    const { password } = this.state;

    console.log(this.state);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({ email, password }),
        mode: 'cors'
      });
      const json = await res.json();
      const msgType = json.success ? 'success' : 'error';
      const msgContent = json.success ? json.success : json.error;
      this.setState({ showMsg: true, msgType, msgContent });
    } catch (e) {
      throw e;
    }
  }

  render() {
    const {
      email, password, repassword, msgType, msgContent, showMsg
    } = this.state;
    return (
      <FormContainer>
        <FormHeader text="Create A New Account" />
        <Form size="large">
          <Segment stacked>
            <FormInput
              icon="user"
              placeholder="Email address"
              type="text"
              onChange={this.handleEmailChange}
              value={email}
            />
            <FormInput
              icon="lock"
              placeholder="Password"
              type="password"
              onChange={this.handlePasswordChange}
              value={password}
            />
            <FormInput
              icon="lock"
              placeholder="Password Again"
              type="password"
              onChange={this.handleRepasswordChane}
              value={repassword}
            />
            <FormButton text="Sign Up" onClick={this.tryRegister} />
          </Segment>
        </Form>
        {showMsg && <FormFeedback isError={msgType == 'error'} content={msgContent} />}
        <FormMessage text="Already a member?" linkUrl="/login" linkText="Login" />
      </FormContainer>
    );
  }
}

export { RegisterForm };
