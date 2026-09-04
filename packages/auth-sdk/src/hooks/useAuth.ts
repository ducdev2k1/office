import { useAuthStore } from '../authStore';
import type { IAuthStore } from '../types';

export const useAuth = (): IAuthStore => useAuthStore();

export const useUser = (): IAuthStore['user'] => useAuthStore((state: IAuthStore) => state.user);

export const useIsAuthenticated = (): boolean => useAuthStore((state: IAuthStore) => state.isAuthenticated);

export const useIsLoading = (): boolean => useAuthStore((state: IAuthStore) => state.isLoading);

export const useAuthError = (): string | null => useAuthStore((state: IAuthStore) => state.error);