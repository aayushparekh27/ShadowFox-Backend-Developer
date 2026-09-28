const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbDir = path.join(__dirname, '../../data');
const dbFile = path.join(dbDir, 'clientpulse_db.json');

class ClientPulseDatabase {
  constructor() {
    this.isTest = process.env.NODE_ENV === 'test';
    this.data = {
      users: [],
      clients: [],
      projects: [],
      milestones: [],
      deliverables: [],
      invoices: [],
      audit_logs: [],
      autoIncrement: {
        users: 1,
        clients: 1,
        projects: 1,
        milestones: 1,
        deliverables: 1,
        invoices: 1,
        audit_logs: 1
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
        console.error('Error reading database file, re-seeding:', err.message);
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

      this.data.users = [
        {
          id: 1,
          name: 'Agency Managing Director',
          email: 'admin@agency.com',
          password: bcrypt.hashSync('AdminPass123!', salt),
          role: 'AGENCY_ADMIN',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Lead Fullstack Freelancer',
          email: 'freelancer@agency.com',
          password: bcrypt.hashSync('FreelancerPass123!', salt),
          role: 'FREELANCER',
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Acme Corp Representative',
          email: 'client@acme.com',
          password: bcrypt.hashSync('ClientPass123!', salt),
          role: 'CLIENT',
          created_at: new Date().toISOString()
        }
      ];

      this.data.autoIncrement.users = 4;
    }

    if (this.data.clients.length === 0) {
      const now = new Date().toISOString();
      this.data.clients = [
        {
          id: 1,
          company_name: 'Acme Global Inc',
          contact_name: 'Acme Corp Representative',
          contact_email: 'client@acme.com',
          industry: 'FINTECH',
          created_at: now
        }
      ];
      this.data.autoIncrement.clients = 2;
    }

    if (this.data.projects.length === 0) {
      const now = new Date().toISOString();
      this.data.projects = [
        {
          id: 1,
          client_id: 1,
          title: 'NextGen Mobile Banking Portal',
          description: 'Custom React Native and Node.js microservices platform.',
          total_budget: 45000.00,
          status: 'ACTIVE',
          created_at: now
        }
      ];
      this.data.autoIncrement.projects = 2;
    }

    if (this.data.milestones.length === 0) {
      const now = new Date().toISOString();
      this.data.milestones = [
        {
          id: 1,
          project_id: 1,
          title: 'Phase 1: Architecture & Auth Endpoints',
          due_date: '2026-10-15',
          amount: 15000.00,
          status: 'IN_PROGRESS',
          created_at: now,
          updated_at: now
        },
        {
          id: 2,
          project_id: 1,
          title: 'Phase 2: Payment Gateway & Ledger Engine',
          due_date: '2026-11-30',
          amount: 30000.00,
          status: 'PLANNED',
          created_at: now,
          updated_at: now
        }
      ];
      this.data.autoIncrement.milestones = 3;
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
        clients: [],
        projects: [],
        milestones: [],
        deliverables: [],
        invoices: [],
        audit_logs: [],
        autoIncrement: {
          users: 1,
          clients: 1,
          projects: 1,
          milestones: 1,
          deliverables: 1,
          invoices: 1,
          audit_logs: 1
        }
      };
      this.seedInitialData();
    }
  }
}

const db = new ClientPulseDatabase();
module.exports = db;
