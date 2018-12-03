/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */
import '@babel/polyfill';
import React from 'react';
import { expect } from 'chai';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import { LoginForm } from '../../src/client/login';
import { RegisterForm } from '../../src/client/register';
import { NearShops } from '../../src/client/App';
import { PreferredShops } from '../../src/client/preferred';

import { FormInput, FormButton } from '../../src/client/forms';
import { NavLinks, CardsSegment } from '../../src/client/common';

Enzyme.configure({ adapter: new Adapter() });

let wrapper;

describe('Testing <LoginForm />', () => {
  it('Should render 2 <FormInput /> components', () => {
    wrapper = shallow(<LoginForm />);
    expect(wrapper.find(FormInput)).to.have.lengthOf(2);
    expect(wrapper.find(FormButton)).to.have.lengthOf(1);
  });
});

describe('Testing <RegisterForm />', () => {
  it('Should render 3 <FormInput /> components', () => {
    wrapper = shallow(<RegisterForm />);
    expect(wrapper.find(FormInput)).to.have.lengthOf(3);
    expect(wrapper.find(FormButton)).to.have.lengthOf(1);
  });
});

describe('Testing <NearShops />', () => {
  before(() => {
    wrapper = shallow(<NearShops />);
  });

  it('Should render <NavLinks /> ', () => {
    expect(wrapper.find(NavLinks)).to.have.lengthOf(1);
  });

  it('Should render <CardsSegment />', () => {
    expect(wrapper.find(CardsSegment)).to.have.lengthOf(1);
  });
});

describe('Testing <PreferredShops />', () => {
  before(() => {
    wrapper = shallow(<PreferredShops />);
  });

  it('Should render <NavLinks /> ', () => {
    expect(wrapper.find(NavLinks)).to.have.lengthOf(1);
  });

  it('Should render <CardsSegment />', () => {
    expect(wrapper.find(CardsSegment)).to.have.lengthOf(1);
  });
});
