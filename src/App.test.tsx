import React from 'react';
import { render} from '@testing-library/react';
import App from './App';

test('renders conway\'s game of life', () => {
  render(<App />);
});
