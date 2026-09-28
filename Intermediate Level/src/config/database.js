const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbDir = path.join(__dirname, '../../data');
const dbFile = path.join(dbDir, 'ecommerce_db.json');

class ECommerceDatabase {
  constructor() {
    this.isTest = process.env.NODE_ENV === 'test';
    this.data = {
      users: [],
      products: [],
      carts: [],
      orders: [],
      autoIncrement: {
        users: 1,
        products: 1,
        carts: 1,
        orders: 1
      }
    };

    if (!this.isTest) {
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      this.load();
    } else {
      this.seedInitialData();
    }
  }

  load() {
    if (fs.existsSync(dbFile)) {
      try {
        const raw = fs.readFileSync(dbFile, 'utf8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error loading database file, re-initializing:', err.message);
        this.seedInitialData();
        this.save();
      }
    } else {
      this.seedInitialData();
      this.save();
    }
  }

  save() {
    if (this.isTest) return;
    try {
      fs.writeFileSync(dbFile, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving database:', err.message);
    }
  }

  seedInitialData() {
    if (this.data.users.length === 0) {
      const salt = bcrypt.genSaltSync(10);
      const adminPasswordHash = bcrypt.hashSync('AdminPass123!', salt);
      const customerPasswordHash = bcrypt.hashSync('CustomerPass123!', salt);

      this.data.users = [
        {
          id: 1,
          name: 'System Admin',
          email: 'admin@ecommerce.com',
          password: adminPasswordHash,
          role: 'ADMIN',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Demo Customer',
          email: 'customer@ecommerce.com',
          password: customerPasswordHash,
          role: 'CUSTOMER',
          created_at: new Date().toISOString()
        }
      ];

      this.data.autoIncrement.users = 3;
    }

    if (this.data.products.length === 0) {
      const now = new Date().toISOString();
      this.data.products = [
        {
          id: 1,
          name: 'Wireless Noise-Canceling Headphones',
          sku: 'TECH-AUD-001',
          category: 'ELECTRONICS',
          price: 199.99,
          stock: 50,
          description: 'High-fidelity audio with active noise cancellation.',
          created_at: now,
          updated_at: now
        },
        {
          id: 2,
          name: 'Mechanical Gaming Keyboard',
          sku: 'TECH-ACC-002',
          category: 'ELECTRONICS',
          price: 89.50,
          stock: 25,
          description: 'RGB backlit mechanical keyboard with tactile switches.',
          created_at: now,
          updated_at: now
        },
        {
          id: 3,
          name: 'Ergonomic Desk Chair',
          sku: 'FURN-OFF-003',
          category: 'FURNITURE',
          price: 249.00,
          stock: 10,
          description: 'Adjustable lumbar support and breathable mesh.',
          created_at: now,
          updated_at: now
        }
      ];

      this.data.autoIncrement.products = 4;
    }
  }

  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  getNextId(name) {
    if (!this.data.autoIncrement) {
      this.data.autoIncrement = {};
    }
    if (!this.data.autoIncrement[name]) {
      this.data.autoIncrement[name] = 1;
    }
    const id = this.data.autoIncrement[name]++;
    this.save();
    return id;
  }

  resetForTest() {
    if (this.isTest) {
      this.data = {
        users: [],
        products: [],
        carts: [],
        orders: [],
        autoIncrement: {
          users: 1,
          products: 1,
          carts: 1,
          orders: 1
        }
      };
      this.seedInitialData();
    }
  }
}

const db = new ECommerceDatabase();
module.exports = db;
