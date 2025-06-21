import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Simple test component that mimics the Home page
const TestComponent = () => {
  return (
    <div>
      <h1>NASA Explorer</h1>
      <p>Test component for React Testing Library</p>
    </div>
  );
};

// Interactive test component
const InteractiveComponent = () => {
  const [count, setCount] = React.useState(0);
  const [inputValue, setInputValue] = React.useState('');

  return (
    <div>
      <h2>Interactive Test</h2>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter text"
      />
      <p>Input value: {inputValue}</p>
    </div>
  );
};

describe('React Testing Setup', () => {
  test('renders a simple component', () => {
    render(<TestComponent />);
    const titleElement = screen.getByText(/NASA Explorer/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders paragraph text', () => {
    render(<TestComponent />);
    const paragraphElement = screen.getByText(/Test component for React Testing Library/i);
    expect(paragraphElement).toBeInTheDocument();
  });
});

describe('Interactive Component Tests', () => {
  test('button click increases count', async () => {
    const user = userEvent.setup();
    render(<InteractiveComponent />);
    
    const button = screen.getByRole('button', { name: /count: 0/i });
    expect(button).toBeInTheDocument();
    
    await user.click(button);
    expect(screen.getByRole('button', { name: /count: 1/i })).toBeInTheDocument();
  });

  test('input field updates value', async () => {
    const user = userEvent.setup();
    render(<InteractiveComponent />);
    
    const input = screen.getByPlaceholderText(/enter text/i);
    await user.type(input, 'Hello NASA');
    
    expect(screen.getByText(/input value: Hello NASA/i)).toBeInTheDocument();
  });

  test('input field can be cleared', async () => {
    const user = userEvent.setup();
    render(<InteractiveComponent />);
    
    const input = screen.getByPlaceholderText(/enter text/i);
    await user.type(input, 'Test');
    await user.clear(input);
    
    expect(screen.getByText(/input value:$/i)).toBeInTheDocument();
  });
});
