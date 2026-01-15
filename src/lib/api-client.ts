// // src/lib/api-client.ts
// import { ApiResponse } from "./types";

// type Json = Record<string, unknown>;

// class ApiClient {
//   private baseUrl: string;

//   constructor(baseUrl: string = "/api") {
//     this.baseUrl = baseUrl;
//   }

//   private async request<T>(
//     endpoint: string,
//     options: RequestInit = {}
//   ): Promise<ApiResponse<T>> {
//     try {
//       const response = await fetch(`${this.baseUrl}${endpoint}`, {
//         ...options,
//         credentials: "include", // REQUIRED for auth
//         headers: {
//           "Content-Type": "application/json",
//           ...(options.headers || {}),
//         },
//       });

//       const payload = await response.json().catch(() => null);

//       if (!response.ok) {
//         return {
//           success: false,
//           error:
//             payload?.message ||
//             payload?.error ||
//             `Request failed (${response.status})`,
//         };
//       }

//       return {
//         success: true,
//         data: payload?.data ?? payload,
//         message: payload?.message,
//       };
//     } catch (error) {
//       return {
//         success: false,
//         error:
//           error instanceof Error
//             ? error.message
//             : "Network error. Please try again.",
//       };
//     }
//   }

//   // ---------- HTTP METHODS ----------

//   get<T>(endpoint: string): Promise<ApiResponse<T>> {
//     return this.request<T>(endpoint, { method: "GET" });
//   }

//   post<T>(endpoint: string, body?: Json): Promise<ApiResponse<T>> {
//     return this.request<T>(endpoint, {
//       method: "POST",
//       body: body ? JSON.stringify(body) : undefined,
//     });
//   }

//   patch<T>(endpoint: string, body?: Json): Promise<ApiResponse<T>> {
//     return this.request<T>(endpoint, {
//       method: "PATCH",
//       body: body ? JSON.stringify(body) : undefined,
//     });
//   }

//   delete<T>(endpoint: string, body?: Json): Promise<ApiResponse<T>> {
//     return this.request<T>(endpoint, {
//       method: "DELETE",
//       body: body ? JSON.stringify(body) : undefined,
//     });
//   }
// }

// export const api = new ApiClient();

// src/lib/api-client.ts

// FIXED: Use 'unknown' instead of 'any' for the default generic type
export interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T; 
  status: number;
}

type Json = Record<string, unknown>;

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
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        credentials: "include", 
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      });

      // Handle empty responses or non-JSON gracefully
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          error:
            payload?.error ||
            payload?.message ||
            `Request failed (${response.status})`,
        };
      }

      return {
        success: true,
        status: response.status,
        // Cast payload to T. 
        // We assume the server returns the shape T matches.
        data: payload as T, 
      };

    } catch (error) {
      return {
        success: false,
        status: 0,
        error:
          error instanceof Error
            ? error.message
            : "Network error. Please try again.",
      };
    }
  }

  // ---------- HTTP METHODS ----------

  get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  post<T>(endpoint: string, body?: Json): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: Json): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, body?: Json): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

export const api = new ApiClient();