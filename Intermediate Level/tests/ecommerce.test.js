const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');

describe('E-Commerce & Inventory API (Intermediate Level)', () => {
  let customerToken = '';
  let adminToken = '';

  beforeEach(() => {
    db.resetForTest();
  });

  describe('Auth Module (/api/auth)', () => {
    it('should register a new customer', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Sarah Connor',
          email: 'sarah@skynet.com',
          password: 'Password123!'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.role).toBe('CUSTOMER');
    });

    it('should login seeded customer and obtain JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'customer@ecommerce.com',
          password: 'CustomerPass123!'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      customerToken = res.body.data.token;
    });

    it('should login seeded admin and obtain JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@ecommerce.com',
          password: 'AdminPass123!'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.user.role).toBe('ADMIN');
      adminToken = res.body.data.token;
    });
  });

  describe('Products & Inventory Control (/api/products)', () => {
    beforeEach(async () => {
      const adminLogin = await request(app).post('/api/auth/login').send({
        email: 'admin@ecommerce.com',
        password: 'AdminPass123!'
      });
      adminToken = adminLogin.body.data.token;

      const customerLogin = await request(app).post('/api/auth/login').send({
        email: 'customer@ecommerce.com',
        password: 'CustomerPass123!'
      });
      customerToken = customerLogin.body.data.token;
    });

    it('should allow public access to product listings', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should reject product creation from non-admin customer (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'Unauthorized TV',
          price: 500,
          stock: 10
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow admin to create a new product', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Smart Watch Pro',
          sku: 'WATCH-PRO-01',
          category: 'ELECTRONICS',
          price: 299.99,
          stock: 30,
          description: 'Advanced fitness and heart rate monitor.'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.name).toBe('Smart Watch Pro');
      expect(res.body.data.stock).toBe(30);
    });
  });

  describe('Cart & Checkout Flow (/api/cart & /api/orders)', () => {
    beforeEach(async () => {
      const customerLogin = await request(app).post('/api/auth/login').send({
        email: 'customer@ecommerce.com',
        password: 'CustomerPass123!'
      });
      customerToken = customerLogin.body.data.token;
    });

    it('should add product to customer cart', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: 1,
          quantity: 2
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].quantity).toBe(2);
    });

    it('should reject adding item if quantity exceeds available stock', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: 1,
          quantity: 99999 // Exceeds stock (50)
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should place order successfully and deduct stock count', async () => {
      // 1. Get initial product stock
      const prodBefore = await request(app).get('/api/products/1');
      const initialStock = prodBefore.body.data.stock;

      // 2. Add 5 units to cart
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: 1, quantity: 5 });

      // 3. Checkout
      const checkoutRes = await request(app)
        .post('/api/orders/checkout')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ shippingAddress: '100 Broadway, NY' });

      expect(checkoutRes.statusCode).toEqual(201);
      expect(checkoutRes.body.data.status).toBe('PENDING');
      expect(checkoutRes.body.data.items.length).toBe(1);

      // 4. Verify stock deducted
      const prodAfter = await request(app).get('/api/products/1');
      expect(prodAfter.body.data.stock).toBe(initialStock - 5);

      // 5. Verify cart is cleared
      const cartRes = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(cartRes.body.data.items.length).toBe(0);
    });
  });
});
