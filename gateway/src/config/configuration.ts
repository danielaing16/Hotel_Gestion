export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  environment: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'super_secret_jwt_key_hotel_2026_dev',
  },
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    hotels: process.env.HOTELS_SERVICE_URL || 'http://hotels-service:3002',
    rooms: process.env.ROOMS_SERVICE_URL || 'http://rooms-service:3003',
    availability: process.env.AVAILABILITY_SERVICE_URL || 'http://availability-service:3004',
    bookings: process.env.BOOKINGS_SERVICE_URL || 'http://booking-service:3005',
    payments: process.env.PAYMENTS_SERVICE_URL || 'http://payment-service:3006',
  },
  throttler: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
  },
});
