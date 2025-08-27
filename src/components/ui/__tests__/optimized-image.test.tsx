import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OptimizedImage } from '../optimized-image';

describe('OptimizedImage', () => {
  const mockSrc = 'https://example.com/test-image.jpg';
  const mockAlt = 'Test image';
  
  test('When rendered Then displays image with correct attributes', () => {
    render(
      <OptimizedImage 
        src={mockSrc} 
        alt={mockAlt} 
        width={200} 
        height={300} 
      />
    );
    
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockSrc);
    expect(image).toHaveAttribute('alt', mockAlt);
    expect(image).toHaveAttribute('width', '200');
    expect(image).toHaveAttribute('height', '300');
    expect(image).toHaveAttribute('loading', 'lazy');
  });
  
  test('When loading Then displays placeholder', async () => {
    render(
      <OptimizedImage 
        src={mockSrc} 
        alt={mockAlt} 
        width={200} 
        height={300} 
        showPlaceholder={true}
      />
    );
    
    // Initially the placeholder should be visible
    const placeholder = screen.getByTestId('image-placeholder');
    expect(placeholder).toBeInTheDocument();
    
    // Simulate image load
    const image = screen.getByRole('img');
    fireEvent.load(image);
    
    // After loading, placeholder should be hidden
    await waitFor(() => {
      expect(screen.queryByTestId('image-placeholder')).not.toBeInTheDocument();
    });
  });
  
  test('When error occurs Then displays fallback', async () => {
    render(
      <OptimizedImage 
        src="invalid-url" 
        alt={mockAlt} 
        width={200} 
        height={300} 
        fallbackSrc="fallback.jpg"
      />
    );
    
    const image = screen.getByRole('img');
    
    // Simulate error
    fireEvent.error(image);
    
    // Should use fallback image
    await waitFor(() => {
      expect(image).toHaveAttribute('src', 'fallback.jpg');
    });
  });
  
  test('When sizes prop provided Then sets sizes attribute', () => {
    const sizes = '(max-width: 768px) 100vw, 50vw';
    render(
      <OptimizedImage 
        src={mockSrc} 
        alt={mockAlt} 
        width={200} 
        height={300} 
        sizes={sizes}
      />
    );
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('sizes', sizes);
  });
  
  test('When srcset provided Then sets srcset attribute', () => {
    const srcset = 'image-320w.jpg 320w, image-480w.jpg 480w';
    render(
      <OptimizedImage 
        src={mockSrc} 
        alt={mockAlt} 
        width={200} 
        height={300} 
        srcSet={srcset}
      />
    );
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('srcset', srcset);
  });
  
  test('When objectFit provided Then applies correct style', () => {
    render(
      <OptimizedImage 
        src={mockSrc} 
        alt={mockAlt} 
        width={200} 
        height={300} 
        objectFit="cover"
      />
    );
    
    const image = screen.getByRole('img');
    expect(image).toHaveStyle({ objectFit: 'cover' });
  });
});
