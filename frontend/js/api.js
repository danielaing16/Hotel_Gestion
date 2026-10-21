// API Gateway Client para el Frontend de Reservas Hoteleras
const GATEWAY_BASE_URL = 'http://localhost:3000';

class HotelApiClient {
  constructor() {
    this.baseUrl = GATEWAY_BASE_URL;
    this.listeners = [];
  }

  onLog(callback) {
    this.listeners.push(callback);
  }

  notifyLog(method, endpoint, status, durationMs, payload = null, error = null) {
    this.listeners.forEach(cb => cb({
      timestamp: new Date().toLocaleTimeString(),
      method,
      endpoint,
      status,
      durationMs,
      payload,
      error
    }));
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const start = Date.now();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const durationMs = Date.now() - start;
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data?.message || `Error HTTP ${response.status}`;
        this.notifyLog(options.method || 'GET', endpoint, response.status, durationMs, null, errorMsg);
        throw new Error(errorMsg);
      }

      this.notifyLog(options.method || 'GET', endpoint, response.status, durationMs, data);
      return data;
    } catch (err) {
      const durationMs = Date.now() - start;
      if (!options.silent) {
        this.notifyLog(options.method || 'GET', endpoint, 0, durationMs, null, err.message);
      }
      throw err;
    }
  }

  // Auth Endpoints (vía Gateway: /api/auth/*)
  async register(userData) {
    return await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email, password) {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res && res.accessToken) {
      this.saveSession(res.accessToken, res.user);
    }
    return res;
  }

  async getProfile() {
    return await this.request('/api/auth/profile', {
      method: 'GET',
    });
  }

  async testAdminOnly() {
    return await this.request('/api/auth/admin-only', {
      method: 'GET',
    });
  }

  // Health Checks
  async checkGatewayHealth() {
    return await this.request('/health', { method: 'GET', silent: true });
  }

  async checkServicesHealth() {
    return await this.request('/health/services', { method: 'GET', silent: true });
  }

  // Session Storage Management
  saveSession(token, user) {
    localStorage.setItem('hotel_jwt_token', token);
    localStorage.setItem('hotel_user_data', JSON.stringify(user));
  }

  clearSession() {
    localStorage.removeItem('hotel_jwt_token');
    localStorage.removeItem('hotel_user_data');
  }

  getToken() {
    return localStorage.getItem('hotel_jwt_token');
  }

  getCurrentUser() {
    const data = localStorage.getItem('hotel_user_data');
    return data ? JSON.parse(data) : null;
  }
}

window.apiClient = new HotelApiClient();
