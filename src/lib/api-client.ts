// Define the standard response shape matching your Next.js API Wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  status: number;
}

type RequestBody = Record<string, unknown> | FormData;


class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        // Only set Content-Type to JSON if body is NOT FormData
        ...(options.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...(options.headers || {}),
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        credentials: "include", // Ensure cookies (auth tokens) are sent
        headers,
      });

      // Handle empty responses safely
      const payload = await response.json().catch(() => ({}));

      // 1. NETWORK / SERVER ERROR (Status 4xx, 5xx)
      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message:
            payload?.message ||
            payload?.error ||
            `Request failed (${response.status})`,
        };
      }

      // 2. SUCCESS (Status 2xx)
      return {
        success: true,
        status: response.status,
        message: payload?.message || "Success",
        // Extract 'data' from the payload if it exists, otherwise return the whole payload
        data: (payload?.data !== undefined ? payload.data : payload) as T,
      };

    } catch (error) {
      // 3. CLIENT / NETWORK FAILURE
      return {
        success: false,
        status: 0,
        message:
          error instanceof Error
            ? error.message
            : "Network error. Please check your connection.",
      };
    }
  }

  // ---------- HTTP METHODS ----------

  get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  post<T>(endpoint: string, body?: RequestBody): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: RequestBody): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, body?: RequestBody): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

export const api = new ApiClient();