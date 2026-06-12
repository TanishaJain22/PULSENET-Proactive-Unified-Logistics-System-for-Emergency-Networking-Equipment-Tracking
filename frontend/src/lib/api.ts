// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Types - Updated for proper exports
export interface User {
  id: string;
  email: string;
  role: 'SYSTEM_ADMIN' | 'HOSPITAL_ADMIN' | 'USER';
  hospitalId?: string;
}

export interface Hospital {
  id: string;
  name: string;
  type: 'GOVERNMENT' | 'PRIVATE' | 'TRUST';
  ownership: 'PUBLIC' | 'PRIVATE' | 'PPP';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  infrastructure?: {
    totalBeds: number;
    icuBeds: number;
    ventilators: number;
    ambulances: number;
  };
  specialties?: string[];
}

export interface AuthResponse {
  userId: string;
  email: string;
  role: string;
  hospitalId?: string;
  token: string;
}

export interface UserRegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface UserRegistrationVerificationRequest {
  email: string;
  otp: string;
}

// Token Management
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

export const getAuthHeaders = () => ({
  'Authorization': `Bearer ${getAuthToken()}`,
  'Content-Type': 'application/json'
});

// Error Handling
export const handleApiError = (response: Response) => {
  if (response.status === 401) {
    // Redirect to login
    removeAuthToken();
    window.location.href = '/login';
  }
  return response;
};

// API Helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    console.log(`🚀 API Request: ${config.method || 'GET'} ${url}`);
    if (config.body) {
      console.log('📤 Request Body:', config.body);
    }
    
    const response = await fetch(url, config);
    
    console.log(`📥 API Response: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      let errorDetails = null;
      
      try {
        const errorData = await response.text(); // Get as text first
        console.error('❌ Error Response Body:', errorData);
        
        // Try to parse as JSON
        try {
          const parsedError = JSON.parse(errorData);
          errorDetails = parsedError;
          if (parsedError.message) {
            errorMessage = parsedError.message;
          } else if (parsedError.error) {
            errorMessage = parsedError.error;
          } else if (parsedError.details) {
            errorMessage = parsedError.details;
          }
        } catch (jsonError) {
          // If not JSON, use the text as error message
          if (errorData) {
            errorMessage = errorData;
          }
        }
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
      }
      
      console.error('❌ Final Error Message:', errorMessage);
      if (errorDetails) {
        console.error('❌ Error Details:', errorDetails);
      }
      
      handleApiError(response);
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    console.log('✅ Response Data:', responseData);
    return responseData;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = 'Network error: Unable to connect to server. Please check if the backend is running.';
      console.error('🌐 Network Error:', networkError);
      throw new Error(networkError);
    }
    console.error('💥 API Request Failed:', error);
    throw error;
  }
};

// Authentication API
export const authApi = {
  adminLogin: async (identity: string, password: string): Promise<AuthResponse> => {
    return apiRequest('/api/auth/login/admin', {
      method: 'POST',
      body: JSON.stringify({ identity, password })
    });
  },

  hospitalLogin: async (identity: string, password: string, otp: string): Promise<AuthResponse> => {
    return apiRequest('/api/auth/login/hospital', {
      method: 'POST',
      body: JSON.stringify({ identity, password, otp })
    });
  },

  userLogin: async (identity: string, password: string): Promise<AuthResponse> => {
    return apiRequest('/api/auth/login/user', {
      method: 'POST',
      body: JSON.stringify({ identity, password })
    });
  },

  userRegister: async (userData: UserRegistrationRequest): Promise<void> => {
    return apiRequest('/api/auth/register/user', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  verifyUserRegistration: async (verificationData: UserRegistrationVerificationRequest): Promise<AuthResponse> => {
    return apiRequest('/api/auth/register/user/verify', {
      method: 'POST',
      body: JSON.stringify(verificationData)
    });
  },

  requestOtp: async (email: string): Promise<void> => {
    return apiRequest('/api/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  healthCheck: async (): Promise<{ status: string }> => {
    return apiRequest('/api/auth/test');
  },

  validateToken: async (): Promise<{ valid: boolean; user?: User }> => {
    try {
      const token = getAuthToken();
      if (!token) {
        return { valid: false };
      }

      // For now, we'll do a simple health check to verify backend connectivity
      // In a production app, you'd have a dedicated token validation endpoint
      await authApi.healthCheck();
      
      // If we reach here, the backend is accessible and token exists
      // For demo purposes, we'll assume the token is valid
      // You should implement proper JWT validation on the backend
      return { 
        valid: true, 
        user: {
          id: 'demo-user',
          email: 'user@demo.com',
          role: 'USER'
        }
      };
    } catch (error) {
      console.error('Token validation failed:', error);
      return { valid: false };
    }
  },

  getCurrentProfile: async (): Promise<any> => {
    return apiRequest('/api/auth/profile', {
      headers: getAuthHeaders()
    });
  },
};

// Hospital API
export const hospitalApi = {
  register: async (hospitalData: any): Promise<Hospital> => {
    console.log('🏥 Registering hospital with data:', JSON.stringify(hospitalData, null, 2))
    return apiRequest('/api/hospitals/register', {
      method: 'POST',
      body: JSON.stringify(hospitalData)
    });
  },

  getAll: async (): Promise<Hospital[]> => {
    return apiRequest('/api/hospitals', {
      headers: getAuthHeaders()
    });
  },

  getById: async (id: string): Promise<Hospital> => {
    return apiRequest(`/api/hospitals/${id}`, {
      headers: getAuthHeaders()
    });
  },

  updateStatus: async (id: string, status: Hospital['status']): Promise<Hospital> => {
    return apiRequest(`/api/hospitals/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
  },

  uploadDocuments: async (hospitalId: string, files: { [key: string]: File }): Promise<any> => {
    const formData = new FormData();
    
    // Map file types to backend parameter names
    if (files.license) formData.append('license', files.license);
    if (files.clinical) formData.append('clinical', files.clinical);
    if (files.accreditation) formData.append('accreditation', files.accreditation);

    console.log('📄 Uploading documents for hospital:', hospitalId);
    console.log('📎 Files to upload:', Object.keys(files));

    const response = await fetch(`${API_BASE_URL}/api/hospitals/${hospitalId}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: formData
    });

    console.log(`📥 Upload Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `Upload Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.text();
        console.error('❌ Upload Error Response:', errorData);
        
        // Try to parse as JSON
        try {
          const parsedError = JSON.parse(errorData);
          if (parsedError.message) {
            errorMessage = parsedError.message;
          }
        } catch (jsonError) {
          // If not JSON, use the text as error message
          if (errorData) {
            errorMessage = errorData;
          }
        }
      } catch (parseError) {
        console.error('Failed to parse upload error response:', parseError);
      }
      
      handleApiError(response);
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    console.log('✅ Upload Success:', responseData);
    return responseData;
  },

  getApplicationStatus: async (id: string): Promise<any> => {
    return apiRequest(`/api/hospitals/${id}/status`);
  },

  reviewHospital: async (id: string, status: string, adminComments: string): Promise<any> => {
    return apiRequest(`/api/hospitals/${id}/review`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, adminComments })
    });
  }
};

// Ambulance API
export const ambulanceApi = {
  getByHospital: async (hospitalId: string): Promise<any[]> => {
    return apiRequest(`/api/ambulances/hospital/${hospitalId}`, {
      headers: getAuthHeaders()
    });
  },

  getRequestsByHospital: async (hospitalId: string): Promise<any[]> => {
    return apiRequest(`/api/ambulances/requests/hospital/${hospitalId}`, {
      headers: getAuthHeaders()
    });
  },

  approveRequest: async (requestId: string): Promise<any> => {
    return apiRequest(`/api/ambulances/requests/${requestId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  },

  updateLocation: async (ambulanceId: string, location: { latitude: number; longitude: number }): Promise<any> => {
    return apiRequest(`/api/ambulances/${ambulanceId}/location`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(location)
    });
  },

  getLocation: async (ambulanceId: string): Promise<any> => {
    return apiRequest(`/api/ambulances/${ambulanceId}/location`, {
      headers: getAuthHeaders()
    });
  }
};

// General API object for backward compatibility
export const api = {
  get: async (endpoint: string) => {
    const data = await apiRequest(endpoint, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return { data };
  },

  post: async (endpoint: string, body?: any) => {
    const data = await apiRequest(endpoint, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined
    });
    return { data };
  },

  put: async (endpoint: string, body?: any) => {
    const data = await apiRequest(endpoint, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined
    });
    return { data };
  },

  delete: async (endpoint: string) => {
    const data = await apiRequest(endpoint, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return { data };
  }
};