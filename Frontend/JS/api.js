/* ==========================================================================
   BOOKSWAP - api.js
   Centralized API Client for Backend Communication
   Base URL: http://localhost:5000/api
   ========================================================================== */

(function (window) {
  'use strict';

  var API_BASE = 'https://book-swap-mocha.vercel.app/api';

  var TOKEN_KEY = 'bookswap_token';
  var USER_KEY = 'bookswap_user';

  function getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
    } catch (e) {
      return null;
    }
  }

  function setToken(token, remember) {
    try {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      if (token) {
        (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
      }
    } catch (e) {}
  }

  function getCurrentUser() {
    try {
      var raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setCurrentUser(user, remember) {
    try {
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(USER_KEY);
      if (user) {
        (remember ? localStorage : sessionStorage).setItem(USER_KEY, JSON.stringify(user));
      }
    } catch (e) {}
  }

  function clearAuth() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    } catch (e) {}
  }

  async function request(endpoint, options) {
    options = options || {};
    var url = API_BASE + (endpoint.startsWith('/') ? endpoint : '/' + endpoint);
    
    var headers = Object.assign({}, options.headers || {});
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    var token = getToken();
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    var config = {
      method: options.method || 'GET',
      headers: headers
    };

    if (options.body && !(options.body instanceof FormData)) {
      config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    } else if (options.body) {
      config.body = options.body;
    }

    try {
      var res = await fetch(url, config);
      var data;
      var contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (!res.ok) {
        var msg = (data && data.message) || res.statusText || 'Request failed';
        var err = new Error(msg);
        err.status = res.status;
        err.data = data;
        throw err;
      }

      return data;
    } catch (error) {
      console.error('[API Error] ' + (options.method || 'GET') + ' ' + url, error);
      throw error;
    }
  }

  var api = {
    BASE_URL: API_BASE,
    getToken: getToken,
    setToken: setToken,
    getCurrentUser: getCurrentUser,
    setCurrentUser: setCurrentUser,
    clearAuth: clearAuth,
    request: request,

    // Auth
    auth: {
      login: function (Email, Password, remember) {
        return request('/auth/login', {
          method: 'POST',
          body: { Email: Email, Password: Password }
        }).then(function (res) {
          if (res.token) setToken(res.token, remember);
          if (res.user) setCurrentUser(res.user, remember);
          return res;
        });
      },
      register: function (userData, remember) {
        return request('/auth/register', {
          method: 'POST',
          body: userData
        }).then(function (res) {
          if (res.token) setToken(res.token, remember);
          if (res.user) setCurrentUser(res.user, remember);
          return res;
        });
      },
      logout: function () {
        clearAuth();
      }
    },

    // Users
    users: {
      getAll: function () { return request('/users'); },
      getById: function (id) { return request('/users/' + id); },
      update: function (id, data) { return request('/users/' + id, { method: 'PUT', body: data }); },
      delete: function (id) { return request('/users/' + id, { method: 'DELETE' }); }
    },

    // Listings (Books)
    listings: {
      getAll: function () { return request('/listings'); },
      getById: function (id) { return request('/listings/' + id); },
      getBySeller: function (sellerId) { return request('/listings/seller/' + sellerId); },
      create: function (data) { return request('/listings', { method: 'POST', body: data }); },
      update: function (id, data) { return request('/listings/' + id, { method: 'PUT', body: data }); },
      delete: function (id) { return request('/listings/' + id, { method: 'DELETE' }); }
    },

    // Search
    search: {
      books: function (query) { return request('/search?query=' + encodeURIComponent(query)); }
    },

    // Categories
    categories: {
      getAll: function () { return request('/categories'); },
      getById: function (id) { return request('/categories/' + id); }
    },

    // Cart
    cart: {
      getAll: function () { return request('/cart'); },
      getByUser: function (userId) { return request('/cart/user/' + userId); },
      add: function (userId, bookId) {
        return request('/cart', {
          method: 'POST',
          body: { UserID: userId, BookID: bookId }
        });
      },
      remove: function (cartId) { return request('/cart/' + cartId, { method: 'DELETE' }); },
      removeBook: function (userId, bookId) { return request('/cart/user/' + userId + '/book/' + bookId, { method: 'DELETE' }); }
    },

    // Chat
    chat: {
      getAll: function () { return request('/chat'); },
      getByUser: function (userId) { return request('/chat/user/' + userId); },
      getConversation: function (senderId, receiverId) {
        return request('/chat/conversation/' + senderId + '/' + receiverId);
      },
      send: function (senderId, receiverId, bookId, text) {
        return request('/chat', {
          method: 'POST',
          body: {
            SenderID: senderId,
            ReceiverID: receiverId,
            BookID: bookId || null,
            MessageText: text
          }
        });
      },
      markRead: function (id) { return request('/chat/' + id + '/read', { method: 'PUT' }); },
      delete: function (id) { return request('/chat/' + id, { method: 'DELETE' }); }
    },

    // Orders & Payments
    payment: {
      getOrders: function () { return request('/payment/orders'); },
      getOrdersByBuyer: function (buyerId) { return request('/payment/orders/buyer/' + buyerId); },
      createOrder: function (orderData) { return request('/payment/orders', { method: 'POST', body: orderData }); },
      createTransaction: function (txnData) { return request('/payment/transactions', { method: 'POST', body: txnData }); }
    },

    // Admin
    admin: {
      getUsers: function () { return request('/admin/users'); },
      deleteUser: function (id) { return request('/admin/users/' + id, { method: 'DELETE' }); },
      getListings: function () { return request('/admin/listings'); },
      deleteListing: function (id) { return request('/admin/listings/' + id, { method: 'DELETE' }); },
      getOrders: function () { return request('/admin/orders'); },
      getTransactions: function () { return request('/admin/transactions'); }
    }
  };

  window.BookSwapAPI = api;

})(window);
