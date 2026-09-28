const db = require('../../config/database');

class ProductService {
  static createProduct(productData) {
    const { name, sku, category, price, stock, description } = productData;
    const products = db.getCollection('products');

    // Check unique SKU
    if (sku && products.some(p => p.sku === sku)) {
      const error = new Error(`Product with SKU '${sku}' already exists.`);
      error.statusCode = 409;
      throw error;
    }

    const now = new Date().toISOString();
    const newProduct = {
      id: db.getNextId('products'),
      name,
      sku: sku || `SKU-${Date.now()}`,
      category: category ? category.toUpperCase() : 'GENERAL',
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      description: description || '',
      created_at: now,
      updated_at: now
    };

    products.push(newProduct);
    db.save();
    return newProduct;
  }

  static getProducts({ category, minPrice, maxPrice, search, inStock, page = 1, limit = 10 }) {
    let products = db.getCollection('products');

    if (category) {
      products = products.filter(p => p.category === category.toUpperCase());
    }

    if (minPrice) {
      products = products.filter(p => p.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      products = products.filter(p => p.price <= parseFloat(maxPrice));
    }

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }

    if (inStock === 'true' || inStock === true) {
      products = products.filter(p => p.stock > 0);
    }

    const total = products.length;
    products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const offset = (page - 1) * limit;
    const paginated = products.slice(offset, offset + parseInt(limit, 10));

    return {
      products: paginated,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  }

  static getProductById(id) {
    const products = db.getCollection('products');
    const product = products.find(p => p.id === parseInt(id, 10));
    if (!product) {
      const error = new Error(`Product with ID ${id} not found.`);
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  static updateProduct(id, updateData) {
    const product = this.getProductById(id);
    const products = db.getCollection('products');

    if (updateData.sku && updateData.sku !== product.sku) {
      if (products.some(p => p.sku === updateData.sku && p.id !== product.id)) {
        const error = new Error(`SKU '${updateData.sku}' is already assigned to another product.`);
        error.statusCode = 409;
        throw error;
      }
    }

    if (updateData.name !== undefined) product.name = updateData.name;
    if (updateData.sku !== undefined) product.sku = updateData.sku;
    if (updateData.category !== undefined) product.category = updateData.category.toUpperCase();
    if (updateData.price !== undefined) product.price = parseFloat(updateData.price);
    if (updateData.stock !== undefined) product.stock = parseInt(updateData.stock, 10);
    if (updateData.description !== undefined) product.description = updateData.description;

    product.updated_at = new Date().toISOString();
    db.save();
    return product;
  }

  static deleteProduct(id) {
    this.getProductById(id);
    const products = db.getCollection('products');
    const index = products.findIndex(p => p.id === parseInt(id, 10));
    products.splice(index, 1);
    db.save();
    return true;
  }
}

module.exports = ProductService;
