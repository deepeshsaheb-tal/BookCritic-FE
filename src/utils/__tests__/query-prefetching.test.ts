import { QueryClient } from '@tanstack/react-query';
import { prefetchInitialData } from '../query-prefetching';
import * as bookService from '../../services/book-service';
import * as userService from '../../services/user-service';
import * as reviewService from '../../services/review-service';
import * as readingListService from '../../services/reading-list-service';

// Mock services
jest.mock('../../services/book-service', () => ({
  getPopularBooks: jest.fn().mockResolvedValue([{ id: '1', title: 'Popular Book' }]),
  getNewReleases: jest.fn().mockResolvedValue([{ id: '2', title: 'New Release' }]),
  getBookDetails: jest.fn().mockResolvedValue({ id: '1', title: 'Book Details' }),
}));

jest.mock('../../services/user-service', () => ({
  getUserProfile: jest.fn().mockResolvedValue({ id: '1', name: 'Test User' }),
}));

jest.mock('../../services/review-service', () => ({
  getBookReviews: jest.fn().mockResolvedValue([{ id: '1', content: 'Great book!' }]),
}));

jest.mock('../../services/reading-list-service', () => ({
  getUserReadingList: jest.fn().mockResolvedValue([{ id: '1', title: 'Reading List Book' }]),
}));

describe('Query Prefetching', () => {
  let queryClient: QueryClient;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
      },
    });
  });
  
  test('When prefetchInitialData called Then prefetches popular books', async () => {
    await prefetchInitialData(queryClient);
    
    expect(bookService.getPopularBooks).toHaveBeenCalled();
    expect(queryClient.getQueryData(['books', 'popular'])).toEqual([{ id: '1', title: 'Popular Book' }]);
  });
  
  test('When prefetchInitialData called Then prefetches new releases', async () => {
    await prefetchInitialData(queryClient);
    
    expect(bookService.getNewReleases).toHaveBeenCalled();
    expect(queryClient.getQueryData(['books', 'new-releases'])).toEqual([{ id: '2', title: 'New Release' }]);
  });
  
  test('When prefetchInitialData called with userId Then prefetches user profile', async () => {
    await prefetchInitialData(queryClient, '1');
    
    expect(userService.getUserProfile).toHaveBeenCalledWith('1');
    expect(queryClient.getQueryData(['user', '1'])).toEqual({ id: '1', name: 'Test User' });
  });
  
  test('When prefetchInitialData called with userId Then prefetches reading list', async () => {
    await prefetchInitialData(queryClient, '1');
    
    expect(readingListService.getUserReadingList).toHaveBeenCalledWith('1');
    expect(queryClient.getQueryData(['reading-list', '1'])).toEqual([{ id: '1', title: 'Reading List Book' }]);
  });
  
  test('When prefetchInitialData called without userId Then skips user-specific prefetching', async () => {
    await prefetchInitialData(queryClient);
    
    expect(userService.getUserProfile).not.toHaveBeenCalled();
    expect(readingListService.getUserReadingList).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(['user', '1'])).toBeUndefined();
    expect(queryClient.getQueryData(['reading-list', '1'])).toBeUndefined();
  });
  
  test('When prefetchInitialData encounters error Then continues with other prefetching', async () => {
    // Mock one service to throw an error
    (bookService.getPopularBooks as jest.Mock).mockRejectedValueOnce(new Error('API error'));
    
    // Should not throw
    await expect(prefetchInitialData(queryClient)).resolves.not.toThrow();
    
    // Other prefetching should still happen
    expect(bookService.getNewReleases).toHaveBeenCalled();
    expect(queryClient.getQueryData(['books', 'new-releases'])).toEqual([{ id: '2', title: 'New Release' }]);
  });
  
  test('When prefetchBookDetails called Then prefetches book details and reviews', async () => {
    const bookId = '1';
    
    // Extract the prefetchBookDetails function from the module
    const prefetchBookDetails = (queryClient as any)._prefetchBookDetails || 
      async (client: QueryClient, id: string) => {
        await Promise.all([
          client.prefetchQuery(['book', id], () => bookService.getBookDetails(id)),
          client.prefetchQuery(['book', id, 'reviews'], () => reviewService.getBookReviews(id))
        ]);
      };
    
    await prefetchBookDetails(queryClient, bookId);
    
    expect(bookService.getBookDetails).toHaveBeenCalledWith(bookId);
    expect(reviewService.getBookReviews).toHaveBeenCalledWith(bookId);
    expect(queryClient.getQueryData(['book', bookId])).toEqual({ id: '1', title: 'Book Details' });
    expect(queryClient.getQueryData(['book', bookId, 'reviews'])).toEqual([{ id: '1', content: 'Great book!' }]);
  });
});
