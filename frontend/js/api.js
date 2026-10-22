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
    const res = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    const token = res?.accessToken || res?.access_token;
    if (res && token) {
      this.saveSession(token, res.user);
    }
    return res;
  }

  async login(email, password) {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const token = res?.accessToken || res?.access_token;
    if (res && token) {
      this.saveSession(token, res.user);
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

  // Hotels Endpoints (vía Gateway: /api/hotels/*)
  async getHotels(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.city) params.append('city', filters.city);
    if (filters.stars) params.append('stars', filters.stars);
    if (filters.minStars) params.append('minStars', filters.minStars);
    if (filters.petFriendly !== undefined && filters.petFriendly !== '') {
      params.append('petFriendly', filters.petFriendly);
    }
    if (filters.amenity) params.append('amenity', filters.amenity);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await this.request(`/api/hotels${queryString}`, {
      method: 'GET',
    });
  }

  async getHotelById(id) {
    return await this.request(`/api/hotels/${id}`, {
      method: 'GET',
    });
  }

  async getMyHotels() {
    return await this.request('/api/hotels/admin/my-hotels', {
      method: 'GET',
    });
  }

  async createHotel(hotelData) {
    return await this.request('/api/hotels', {
      method: 'POST',
      body: JSON.stringify(hotelData),
    });
  }

  async updateHotel(id, hotelData) {
    return await this.request(`/api/hotels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(hotelData),
    });
  }

  async deleteHotel(id, force = false) {
    return await this.request(`/api/hotels/${id}?force=${force}`, {
      method: 'DELETE',
    });
  }

  async seedHotels() {
    return await this.request('/api/hotels/seed', {
      method: 'POST',
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
    if (token && token !== 'undefined' && token !== 'null') {
      localStorage.setItem('hotel_jwt_token', token);
    }
    if (user) {
      localStorage.setItem('hotel_user_data', JSON.stringify(user));
    }
  }

  clearSession() {
    localStorage.removeItem('hotel_jwt_token');
    localStorage.removeItem('hotel_user_data');
  }

  getToken() {
    const token = localStorage.getItem('hotel_jwt_token');
    return (token && token !== 'undefined' && token !== 'null') ? token : null;
  }

  getCurrentUser() {
    const data = localStorage.getItem('hotel_user_data');
    return data ? JSON.parse(data) : null;
  }

}

window.apiClient = new HotelApiClient();
