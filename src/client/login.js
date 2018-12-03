import React, { Component } from 'react';
import {
  Button, Form, Grid, Header, Message, Segment, Card, Image
} from 'semantic-ui-react';
import { Redirect } from 'react-router';

import {
  FormButton,
  FormContainer,
  FormHeader,
  FormMessage,
  FormInput,
  FormFeedback
} from './forms';

class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      showMsg: false,
      msgType: '',
      msgContent: ''
    };

    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.tryLogin = this.tryLogin.bind(this);
  }

  handleEmailChange(e) {
    this.setState({ email: e.target.value });
  }

  handlePasswordChange(e) {
    this.setState({ password: e.target.value });
  }

  async tryLogin() {
    const { email } = this.state;
    const { password } = this.state;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({ username: email, password }),
        mode: 'cors'
      });
      const msgType = res.status === 401 ? 'error' : 'success';
      const msgContent = res.status === 401 ? 'Email or Password Incorrect !' : 'Welcome Back !';
      this.setState({ showMsg: true, msgType, msgContent });
    } catch (e) {
      throw e;
    }
  }

  render() {
    const {
      email, password, showMsg, msgType, msgContent
    } = this.state;
    const success = showMsg && msgType === 'success';
    return (
      <FormContainer>
        <FormHeader text="Login To Your Account" />
        {!success && (
          <Form size="large">
            <Segment stacked>
              <FormInput
                icon="user"
                placeholder="Email address"
                type="text"
                value={email}
                onChange={this.handleEmailChange}
              />
              <FormInput
                icon="lock"
                placeholder="Password"
                type="password"
                value={password}
                onChange={this.handlePasswordChange}
              />
              <FormButton text="Login" onClick={this.tryLogin} />
            </Segment>
          </Form>
        )}
        {success && <Redirect to="/" />}
        {showMsg && <FormFeedback isError={msgType === 'error'} content={msgContent} />}
        <FormMessage text="New Here? " linkUrl="/register" linkText="Sign up" />
      </FormContainer>
    );
  }
}

export { LoginForm };
