export const environment = {
  production: false,
  api: {
    // For Python Flask API
    // login: 'http://127.0.0.1:5000/api/login',
    // user: 'http://127.0.0.1:5000/api/users',
    // refreshToken: 'http://127.0.0.1:5000/api/refresh-token'
    // For Asp.net core web API
      login: '/api/login',
      user: '/api/user'
    //refreshToken: 'https://localhost:7270/api/refresh-token'
  }
};