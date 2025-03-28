import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_BASE_URL, fetchApi } from "./api";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Check if the URL starts with http:// or https:// - if it does, don't prepend API_BASE_URL
  const isAbsoluteUrl = url.startsWith('http://') || url.startsWith('https://');
  const fullUrl = isAbsoluteUrl ? url : `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const urlKey = queryKey[0] as string;
    
    // Check if the URL starts with http:// or https:// - if it does, don't prepend API_BASE_URL
    const isAbsoluteUrl = urlKey.startsWith('http://') || urlKey.startsWith('https://');
    const fullUrl = isAbsoluteUrl ? urlKey : `${API_BASE_URL}${urlKey.startsWith('/') ? urlKey : `/${urlKey}`}`;
    
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
