const ProductService = require('./productService');
const ApiResponse = require('../../utils/apiResponse');

class ProductController {
  static createProduct(req, res, next) {
    try {
      const { name, price, stock } = req.body;

      if (!name || price === undefined || stock === undefined) {
        return ApiResponse.error(res, 'Product name, price, and stock count are required.', 400);
      }

      if (price < 0 || stock < 0) {
        return ApiResponse.error(res, 'Price and stock count cannot be negative numbers.', 400);
      }

      const product = ProductService.createProduct(req.body);
      return ApiResponse.success(res, 'Product created successfully.', product, 201);
    } catch (err) {
      next(err);
    }
  }

  static getProducts(req, res, next) {
    try {
      const { category, minPrice, maxPrice, search, inStock, page, limit } = req.query;
      const result = ProductService.getProducts({
        category,
        minPrice,
        maxPrice,
        search,
        inStock,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10
      });

      return ApiResponse.success(
        res,
        'Products retrieved successfully.',
        result.products,
        200,
        result.pagination
      );
    } catch (err) {
      next(err);
    }
  }

  static getProductById(req, res, next) {
    try {
      const product = ProductService.getProductById(req.params.id);
      return ApiResponse.success(res, 'Product details retrieved successfully.', product, 200);
    } catch (err) {
      next(err);
    }
  }

  static updateProduct(req, res, next) {
    try {
      const updatedProduct = ProductService.updateProduct(req.params.id, req.body);
      return ApiResponse.success(res, 'Product updated successfully.', updatedProduct, 200);
    } catch (err) {
      next(err);
    }
  }

  static deleteProduct(req, res, next) {
    try {
      ProductService.deleteProduct(req.params.id);
      return ApiResponse.success(res, 'Product deleted successfully.', null, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ProductController;
