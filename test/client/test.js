/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */
import '@babel/polyfill';
import React from 'react';
import { expect } from 'chai';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import { LoginForm } from '../../src/client/login';
import { RegisterForm } from '../../src/client/register';

import { FormInput, FormButton } from '../../src/client/forms';

Enzyme.configure({ adapter: new Adapter() });

describe('Testing <LoginForm />', () => {
  it('Should render 2 <FormInput /> components', () => {
    const wrapper = shallow(<LoginForm />);
    expect(wrapper.find(FormInput)).to.have.lengthOf(2);
    expect(wrapper.find(FormButton)).to.have.lengthOf(1);
  });
});

describe('Testing <RegisterForm />', () => {
  it('Should render 3 <FormInput /> components', () => {
    const wrapper = shallow(<RegisterForm />);
    expect(wrapper.find(FormInput)).to.have.lengthOf(3);
    expect(wrapper.find(FormButton)).to.have.lengthOf(1);
  });
});
