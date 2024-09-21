
import React from 'react';
import renderer from 'react-test-renderer';
import { Footer } from '../Footer';
import { MetaMask } from '../MetaMask';

it('renders Footer correctly', () => {
  const tree = renderer.create(<Footer />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('renders MetaMask component correctly', () => {
  const tree = renderer.create(<MetaMask />).toJSON();
  expect(tree).toMatchSnapshot();
});
