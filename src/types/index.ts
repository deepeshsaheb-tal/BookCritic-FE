// User types
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  createdAt?: string;
  reviewCount?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Book types
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  publishedDate?: string;
  coverImageUrl?: string;
  averageRating: number;
  totalReviews: number;
  genres?: string[];
}

export interface BookResponse {
  books: Book[];
  total: number;
}

// Review types
export interface Review {
  id: string;
  content: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    displayName: string;
  };
  book: {
    id: string;
    title: string;
  };
}

export interface ReviewResponse {
  reviews: Review[];
  total: number;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  displayName: string;
  confirmPassword?: string;
}

export interface CreateReviewFormData {
  bookId: string;
  content: string;
  rating: number;
}

export interface UpdateReviewFormData {
  content: string;
  rating: number;
}

// Favorite types
export interface UserFavorite {
  userId: string;
  bookId: string;
  createdAt: string;
  book?: Book;
}
