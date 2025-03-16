import { QueryClient } from '@tanstack/react-query';

async function throwIfResNotOk(res: Response) {
  if (res.ok) return res;
  
  let errorMessage = `HTTP error ${res.status}`;
  try {
    const errorData = await res.json();
    errorMessage = errorData.message || errorData.error || errorMessage;
  } catch (e) {
    // If we can't parse the JSON, just use the status text
  }
  throw new Error(errorMessage);
}

export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  await throwIfResNotOk(response);

  // If the response is empty, return null
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn = ({ on401 }: { on401: UnauthorizedBehavior }) => {
  return async ({ queryKey }: { queryKey: (string | number)[] }) => {
    const url = queryKey.join('/');
    try {
      return await apiRequest(url);
    } catch (error) {
      if (error instanceof Error && error.message.includes('401') && on401 === 'returnNull') {
        return null;
      }
      throw error;
    }
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});