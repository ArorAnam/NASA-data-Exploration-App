import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock Mars Rover Form Component
const MarsRoverForm = ({ onSubmit }) => {
  const [rover, setRover] = React.useState('curiosity');
  const [date, setDate] = React.useState('2024-06-01');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({ rover, date });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Mars Rover Photos</h2>
      <div>
        <label htmlFor="rover">Rover:</label>
        <input
          id="rover"
          type="text"
          value={rover}
          onChange={(e) => setRover(e.target.value)}
          placeholder="Rover name (e.g., curiosity)"
        />
      </div>
      <div>
        <label htmlFor="date">Date:</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Photos'}
      </button>
    </form>
  );
};

describe('Mars Rover Form', () => {
  test('renders form elements correctly', () => {
    const mockSubmit = jest.fn();
    render(<MarsRoverForm onSubmit={mockSubmit} />);
    
    expect(screen.getByText(/Mars Rover Photos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rover/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fetch photos/i })).toBeInTheDocument();
  });

  test('has default values', () => {
    const mockSubmit = jest.fn();
    render(<MarsRoverForm onSubmit={mockSubmit} />);
    
    expect(screen.getByDisplayValue('curiosity')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-06-01')).toBeInTheDocument();
  });

  test('allows changing rover name', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn();
    render(<MarsRoverForm onSubmit={mockSubmit} />);
    
    const roverInput = screen.getByLabelText(/rover/i);
    await user.clear(roverInput);
    await user.type(roverInput, 'opportunity');
    
    expect(screen.getByDisplayValue('opportunity')).toBeInTheDocument();
  });

  test('allows changing date', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn();
    render(<MarsRoverForm onSubmit={mockSubmit} />);
    
    const dateInput = screen.getByLabelText(/date/i);
    await user.clear(dateInput);
    await user.type(dateInput, '2023-12-25');
    
    expect(screen.getByDisplayValue('2023-12-25')).toBeInTheDocument();
  });

  test('calls onSubmit with correct data when form is submitted', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn().mockResolvedValue();
    render(<MarsRoverForm onSubmit={mockSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /fetch photos/i });
    await user.click(submitButton);
    
    expect(mockSubmit).toHaveBeenCalledWith({
      rover: 'curiosity',
      date: '2024-06-01'
    });
  });

  test('shows loading state during submission', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<MarsRoverForm onSubmit={mockSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /fetch photos/i });
    await user.click(submitButton);
    
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    
    await waitFor(() => {
      expect(screen.getByText(/fetch photos/i)).toBeInTheDocument();
    });
  });
}); 