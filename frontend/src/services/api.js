// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8000/api/v1';

// const api = axios.create({
//   baseURL: API_BASE_URL,
// });

// // Add token to requests
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Handle token expiration
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export const authAPI = {
//   // For OAuth2PasswordRequestForm, send form data with 'username' field
//   login: (email, password) => {
//     const formData = new URLSearchParams();
//     formData.append('username', email);  // Map email to username for OAuth2
//     formData.append('password', password);
    
//     return api.post('/auth/login', formData, {
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//       }
//     });
//   },
  
//   register: (userData) => 
//     api.post('/auth/register', userData),
  
//   getProfile: () => 
//     api.get('/users/me'),
// };



// export const questionsAPI = {
//     getQuestions: (params = {}) => 
//       api.get('/questions', { params }),
    
//     getQuestion: (id) => {
//       if (!id || typeof id !== 'string') {
//         console.error('Invalid question ID:', id);
//         return Promise.reject(new Error('Invalid question ID'));
//       }
//       return api.get(`/questions/${id}`);
//     },
    
//     createQuestion: async (data) => {
//         console.log('Sending data to API:', data);
//         try {
//           const response = await api.post('/questions', data);
//           return response;
//         } catch (error) {
//           console.error('API Error details:', error.response?.data);
//           throw error;
//         }
//       },
    
//     updateQuestion: (id, data) => {
//       if (!id || typeof id !== 'string') {
//         console.error('Invalid question ID:', id);
//         return Promise.reject(new Error('Invalid question ID'));
//       }
//       return api.put(`/questions/${id}`, data);
//     },
    
//     deleteQuestion: (id) => {
//       if (!id || typeof id !== 'string') {
//         console.error('Invalid question ID:', id);
//         return Promise.reject(new Error('Invalid question ID'));
//       }
//       return api.delete(`/questions/${id}`);
//     },
    
//     importQuestions: (file) => {
//       const formData = new FormData();
//       formData.append('file', file);
//       return api.post('/questions/import', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });
//     }
//   };



//  // Exams API - FIXED VERSION


// export const examsAPI = {
//   getExams: (params = {}) => 
//     api.get('/exams/', { params }),  // Add trailing slash here
  
//   getExam: (id) => 
//     api.get(`/exams/${id}/`),  // Add trailing slash here
  
//   createExam: (data) => {
//     console.log('📤 API: Creating exam with data:', data);
//     return api.post('/exams/', data);  // Add trailing slash here
//   },
  
//   updateExam: (id, data) => 
//     api.put(`/exams/${id}/`, data),  // Add trailing slash here
  
//   deleteExam: (id) => 
//     api.delete(`/exams/${id}/`)  // Add trailing slash here
// };

// export const attemptsAPI = {
//   startAttempt: (data) => api.post('/attempts', data),  // Add trailing slash
//   getAttempt: (attemptId) => api.get(`/attempts/${attemptId}/`),  // Add trailing slash
//   autoSaveAnswers: (attemptId, answers) => api.post(`/attempts/${attemptId}/auto-save/`, { answers }),  // Add trailing slash
//   submitAttempt: (attemptId) => api.post(`/attempts/${attemptId}/submit/`),  // Add trailing slash
// };



// export default api;






import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Add timeout to prevent hanging requests
});

// Add comprehensive request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Ensure consistent trailing slashes for Django
  if (config.url && !config.url.endsWith('/') && !config.url.includes('?')) {
    config.url += '/';
  }
  
  console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '');
  return config;
});

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    return api.post('/auth/login/', formData, {  // Add trailing slash
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },
  
  register: (userData) => 
    api.post('/auth/register/', userData),  // Add trailing slash
  
  getProfile: () => 
    api.get('/users/me/'),  // Add trailing slash
};

export const questionsAPI = {
  getQuestions: (params = {}) => 
    api.get('/questions/', { params }),  // Add trailing slash
  
  getQuestion: (id) => {
    if (!id || typeof id !== 'string') {
      console.error('Invalid question ID:', id);
      return Promise.reject(new Error('Invalid question ID'));
    }
    return api.get(`/questions/${id}/`);  // Add trailing slash
  },
  
  createQuestion: async (data) => {
    console.log('Sending data to API:', data);
    try {
      const response = await api.post('/questions/', data);  // Add trailing slash
      return response;
    } catch (error) {
      console.error('API Error details:', error.response?.data);
      throw error;
    }
  },
  
  updateQuestion: (id, data) => {
    if (!id || typeof id !== 'string') {
      console.error('Invalid question ID:', id);
      return Promise.reject(new Error('Invalid question ID'));
    }
    return api.put(`/questions/${id}/`, data);  // Add trailing slash
  },
  
  deleteQuestion: (id) => {
    if (!id || typeof id !== 'string') {
      console.error('Invalid question ID:', id);
      return Promise.reject(new Error('Invalid question ID'));
    }
    return api.delete(`/questions/${id}/`);  // Add trailing slash
  },
  
  importQuestions: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/questions/import/', formData, {  // Add trailing slash
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const examsAPI = {
  getExams: (params = {}) => 
    api.get('/exams/', { params }),
  
  getExam: (id) => 
    api.get(`/exams/${id}/`),
  
  createExam: (data) => {
    console.log('📤 API: Creating exam with data:', data);
    return api.post('/exams/', data);
  },
  
  updateExam: (id, data) => 
    api.put(`/exams/${id}/`, data),
  
  deleteExam: (id) => 
    api.delete(`/exams/${id}/`)
};

export const attemptsAPI = {
  startAttempt: (data) => api.post('/attempts/', data),  // Fixed: Add trailing slash
  getAttempt: (attemptId) => api.get(`/attempts/${attemptId}/`),
  autoSaveAnswers: (attemptId, answers) => api.post(`/attempts/${attemptId}/auto-save/`, { answers }),
  submitAttempt: (attemptId) => api.post(`/attempts/${attemptId}/submit/`),
};

export default api;