const Product = require('../models/products');
//const Order = require('../models/order');


exports.getIndex = (req, res, next) => {
  Product
    .find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(error => console.log(error));
}


exports.getProducts = (req, res, next) => {
  Product
    .find()
    .then(products => {
      res.render('shop/products', {
        prods: products,
        pageTitle: 'All products',
        path: '/products'
      });
    })
    .catch(error => console.log(error));
}


exports.getProduct = (req, res, next) => {
  const { productId } = req.params;

  Product
    .findById(productId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(error => console.log(error));
}


exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;

      res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        products,
        //totalPrice: cart.totalPrice
      });
    })
    .catch(error => console.log(error));
}


exports.postCart = (req, res, next) => {
  const { productId } = req.body;

  Product
    .findById(productId)
    .then(product => req.user.addToCart(product))
    .then(() => {
      res.redirect('/cart');
    })
    .catch(error => console.log(error));
}


exports.postCartDeleteProduct = (req, res, next) => {
  const { productId } = req.body;

  req.user
    .removeFromCart(productId)
    .then(() => {
      res.redirect('/cart');
    })
    .catch(error => console.log(error));
}

exports.postOrder = (req, res, next) => {
  let fetchedCart;

  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;

      return cart.getProducts();
    })
    .then(products => {
      return req.user
        .createOrder()
        .then(order => {
          return order.addProducts(products.map(product => {
            product.orderItem = { quantity: product.cartItem.quantity }
            return product;
          }))
        })
        .catch(error => console.log(error));
    })
    .then(result => fetchedCart.setProducts(null))
    .then(result => {
      res.redirect('/orders');
    })
    .catch(error => console.log(error));
}

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({ include: ['products'] })
    .then(orders => {
      res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders',
        orders
      });
    })
    .catch(error => console.log(error));
}


exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout'
  });
}