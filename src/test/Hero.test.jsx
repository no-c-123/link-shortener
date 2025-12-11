import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Hero from '../components/Hero';

// Mock supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } }))
    }
  }
}));

describe('Hero Component', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  it('renders the hero section with title', () => {
    render(<Hero />);
    expect(screen.getByText('SnapLink')).toBeInTheDocument();
  });

  it('displays input field for URL', () => {
    render(<Hero />);
    const input = screen.getByPlaceholderText(/paste your link here/i);
    expect(input).toBeInTheDocument();
  });

  it('shows custom code input when clicked', () => {
    render(<Hero />);
    const customButton = screen.getByText(/add custom code/i);
    fireEvent.click(customButton);
    
    const customInput = screen.getByPlaceholderText(/custom code/i);
    expect(customInput).toBeInTheDocument();
  });

  it('displays shorten button', () => {
    render(<Hero />);
    const button = screen.getByRole('button', { name: /shorten/i });
    expect(button).toBeInTheDocument();
  });

  it('sanitizes custom code input', async () => {
    render(<Hero />);
    const customButton = screen.getByText(/add custom code/i);
    fireEvent.click(customButton);
    
    const customInput = screen.getByPlaceholderText(/custom code/i);
    fireEvent.change(customInput, { target: { value: 'test@#$123' } });
    
    await waitFor(() => {
      expect(customInput.value).toBe('test123');
    });
  });

  it('shows error when empty URL is submitted', async () => {
    render(<Hero />);
    const button = screen.getByRole('button', { name: /shorten/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a url/i)).toBeInTheDocument();
    });
  });
});
