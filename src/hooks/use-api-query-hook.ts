import {
  useQuery,
  useMutation,
  UseQueryResult,
  UseQueryOptions,
  useInfiniteQuery,
  UseMutationResult,
  UseMutationOptions,
  UseInfiniteQueryResult,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { useCallback } from 'react';

import { useToast } from '@/contexts/ToastContext';

/**
 * The return type for the custom hook `useApi`.
 */
interface ReturnType<TData = unknown, TVariables = unknown> {
  /**
   * React Query mutation result object.
   */
  useApiMutation: (
    options?: UseMutationOptions<AxiosResponse<TData>, AxiosError, TVariables> & {
      _401Navigate?: boolean;
    }
  ) => UseMutationResult<AxiosResponse<TData>, AxiosError, TVariables>;

  /**
   * React Query query result object.
   */
  useApiQuery: (
    options: UseQueryOptions<AxiosResponse<TData>, AxiosError> & { _401Navigate?: boolean }
  ) => UseQueryResult<AxiosResponse<TData>, AxiosError>;

  /**
   * React Query infinite query result object.
   */
  useApiInfiniteQuery: (
    options: UseInfiniteQueryOptions<TData, AxiosError> & { _401Navigate?: boolean }
  ) => UseInfiniteQueryResult<TData, AxiosError>;
}

/**
 * Custom hook for handling API requests and errors with React Query.
 * @returns An object containing the `useApiMutation`, `useApiQuery`, and `useApiInfiniteQuery` functions.
 */
export function useApi<TData = unknown, TVariables = unknown>(): ReturnType<TData, TVariables> {
  const { showError, showWarning } = useToast();

  /**
   * Function to handle API errors.
   * @param error - The Axios error object.
   */
  const handleApiError = useCallback(
    async (error: AxiosError, shouldNavigate: boolean = true) => {
      const errorMessages: { [key: number]: { message: string; variant: 'error' | 'warning' } } = {
        400: { message: 'Bad Request: ', variant: 'error' },
        401: { message: 'Session Timeout: Please log in again.', variant: 'warning' },
        403: {
          message: 'Forbidden: You do not have permission to perform this action.',
          variant: 'error',
        },
        404: { message: 'Not Found: The requested resource could not be found.', variant: 'error' },
        500: { message: 'Internal Server Error: Please try again later.', variant: 'error' },
      };

      if (error.response) {
        const { status, data } = error.response;
        const defaultMessageInfo = errorMessages[status] || {
          message: error.message,
          variant: 'error',
        };
        const message =
          status === 401
            ? defaultMessageInfo.message
            : defaultMessageInfo.message +
              ((data as Record<string, unknown>)?.message || error.message);

        if (status !== 401 || (status === 401 && shouldNavigate)) {
          if (defaultMessageInfo.variant === 'error') {
            showError(message);
          } else {
            showWarning(message);
          }
        }
      } else if (error.request) {
        showError('Network Error: Please check your internet connection.');
      } else {
        showError(`Error: ${error.message}`);
      }

      throw error;
    },
    [showError, showWarning]
  );

  /**
   * React Query mutation hook for API requests with error handling.
   * @param options - Options for the mutation.
   * @returns A mutation object for handling API requests.
   */
  const useApiMutation = (
    options?: UseMutationOptions<AxiosResponse<TData>, AxiosError, TVariables> & {
      _401Navigate?: boolean;
    }
  ): UseMutationResult<AxiosResponse<TData>, AxiosError, TVariables> =>
    useMutation<AxiosResponse<TData>, AxiosError, TVariables>({
      ...options,
      mutationFn: async (variables?: TVariables) => {
        try {
          const apiCall = options?.mutationFn as (
            variables?: TVariables
          ) => Promise<AxiosResponse<TData>>;
          const response = await apiCall(variables);
          return response; // Return the entire Axios response
        } catch (error) {
          await handleApiError(error as AxiosError, options?._401Navigate);
          throw error;
        }
      },
    });

  /**
   * React Query query hook for GET requests with error handling.
   * @param options - Options for the query.
   * @returns A query object for handling GET requests.
   */
  const useApiQuery = (
    options: UseQueryOptions<AxiosResponse<TData>, AxiosError> & { _401Navigate?: boolean }
  ): UseQueryResult<AxiosResponse<TData>, AxiosError> =>
    useQuery({
      ...options,
      queryFn: async () => {
        try {
          const apiCall = options.queryFn as unknown as () => Promise<AxiosResponse<TData>>;
          const response = await apiCall();
          return response; // Return the entire Axios response
        } catch (error) {
          await handleApiError(error as AxiosError, options._401Navigate);
          throw error;
        }
      },
      staleTime: 1000 * 60 * 5, // 5 minutes stale time
      retry: options.retry || false,
      refetchOnWindowFocus: options.refetchOnWindowFocus || false,
    });

  /**
   * React Query infinite query hook for handling paginated requests with error handling.
   * @param options - Options for the infinite query.
   * @returns An infinite query object for handling paginated GET requests.
   */
  const useApiInfiniteQuery = (
    options: UseInfiniteQueryOptions<TData, AxiosError> & { _401Navigate?: boolean }
  ): UseInfiniteQueryResult<TData, AxiosError> =>
    useInfiniteQuery({
      ...options,
      queryFn: async ({ pageParam }) => {
        try {
          const apiCall = options.queryFn as unknown as ({
            pageParam,
          }: {
            pageParam: unknown;
          }) => Promise<AxiosResponse<TData>>;
          const response = await apiCall({ pageParam });
          return response.data; // Return data from the Axios response
        } catch (error) {
          await handleApiError(error as AxiosError, options._401Navigate);
          throw error;
        }
      },
      getNextPageParam: options.getNextPageParam,
      staleTime: 1000 * 60 * 5, // 5 minutes stale time
      retry: options.retry || false,
      refetchOnWindowFocus: options.refetchOnWindowFocus || false,
    });

  return { useApiMutation, useApiQuery, useApiInfiniteQuery };
}
