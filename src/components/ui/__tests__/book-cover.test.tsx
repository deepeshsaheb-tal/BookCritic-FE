import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookCover } from '../book-cover';
import { OptimizedImage } from '../optimized-image';

// Mock the OptimizedImage component
jest.mock('../optimized-image', () => ({
  OptimizedImage: jest.fn(({ src, alt, width, height, sizes, objectFit, className }) => (
    <img 
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      style={{ objectFit }}
      className={className}
      data-testid="optimized-image"
    />
  ))
}));

describe('BookCover', () => {
  const mockImageUrl = 'https://example.com/book-cover.jpg';
  const mockTitle = 'Test Book Title';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('When rendered with default props Then displays with medium size', () => {
    render(<BookCover imageUrl={mockImageUrl} title={mockTitle} />);
    
    const image = screen.getByTestId('optimized-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockImageUrl);
    expect(image).toHaveAttribute('alt', `${mockTitle} book cover`);
    expect(image).toHaveAttribute('width', '150');
    expect(image).toHaveAttribute('height', '225');
  });
  
  test('When small size specified Then renders with small dimensions', () => {
    render(<BookCover imageUrl={mockImageUrl} title={mockTitle} size="small" />);
    
    const image = screen.getByTestId('optimized-image');
    expect(image).toHaveAttribute('width', '100');
    expect(image).toHaveAttribute('height', '150');
  });
  
  test('When large size specified Then renders with large dimensions', () => {
    render(<BookCover imageUrl={mockImageUrl} title={mockTitle} size="large" />);
    
    const image = screen.getByTestId('optimized-image');
    expect(image).toHaveAttribute('width', '200');
    expect(image).toHaveAttribute('height', '300');
  });
  
  test('When onClick provided Then has pointer cursor and triggers callback', () => {
    const handleClick = jest.fn();
    render(<BookCover imageUrl={mockImageUrl} title={mockTitle} onClick={handleClick} />);
    
    const container = screen.getByTestId('optimized-image').parentElement;
    expect(container).toHaveStyle('cursor: pointer');
    
    fireEvent.click(container as HTMLElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  test('When className provided Then applies additional class', () => {
    render(<BookCover imageUrl={mockImageUrl} title={mockTitle} className="custom-class" />);
    
    const container = screen.getByTestId('optimized-image').parentElement;
    expect(container).toHaveClass('custom-class');
    expect(container).toHaveClass('relative');
    expect(container).toHaveClass('rounded');
  });
  
  test('When rendered Then passes correct sizes prop to OptimizedImage', () => {
    render(<BookCover imageUrl={mockImageUrl} title={mockTitle} size="medium" />);
    
    expect(OptimizedImage).toHaveBeenCalledWith(
      expect.objectContaining({
        sizes: '(max-width: 640px) 120px, 150px'
      }),
      expect.anything()
    );
  });
});
