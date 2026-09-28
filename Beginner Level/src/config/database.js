const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, '../../data');
const dbFile = path.join(dbDir, 'database.json');

class FileDatabase {
  constructor() {
    this.isTest = process.env.NODE_ENV === 'test';
    this.data = {
      tickets: [],
      autoIncrement: { tickets: 1 }
    };

    if (!this.isTest) {
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      this.load();
    }
  }

  load() {
    if (fs.existsSync(dbFile)) {
      try {
        const raw = fs.readFileSync(dbFile, 'utf8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading database file, initializing fresh database:', err.message);
        this.save();
      }
    } else {
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
        tickets: [],
        autoIncrement: { tickets: 1 }
      };
    }
  }
}

const db = new FileDatabase();
module.exports = db;
