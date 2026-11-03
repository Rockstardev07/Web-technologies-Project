const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsed, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, body: data, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('   STARTING AUTOMATED MEMBER 4 API TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    const testEmail = `testuser_${Date.now()}@example.com`;
    const testPassword = 'Password123';
    let userId = null;
    let authHeaders = {};

    // 1. Health check
    const health = await request('GET', '/');
    assert(health.status === 200, 'Server is running', health.body.message);

    // 2. User Registration (M3)
    console.log('\n--- 1. Testing User Registration & Login ---');
    const regRes = await request('POST', '/api/users', {
      username: 'Test User',
      emailId: testEmail,
      age: 21,
      password: testPassword
    });
    assert(regRes.status === 201, 'User registered successfully', JSON.stringify(regRes.body));
    userId = regRes.body.user._id;

    // 3. User Login (M3)
    const loginRes = await request('POST', '/api/login', {
      emailId: testEmail,
      password: testPassword
    });
    assert(loginRes.status === 200, 'User logged in successfully', JSON.stringify(loginRes.body));
    authHeaders = {
      'Authorization': `Bearer ${userId}`,
      'x-user-email': testEmail
    };

    // 4. Products retrieval (M3)
    const prodRes = await request('GET', '/api/products', null, authHeaders);
    assert(prodRes.status === 200 && Array.isArray(prodRes.body) && prodRes.body.length > 0, 'Products retrieved for authenticated user');
    const firstProduct = prodRes.body[0];
    const initialQty = firstProduct.availableQuantity;
    console.log(`Using product "${firstProduct.name}" (ID: ${firstProduct.productId}, Stock: ${initialQty}, Price: $${firstProduct.price})`);

    // 5. Member 4: Product Reviews POST
    console.log('\n--- 2. Testing Member 4: Product Reviews & Ratings ---');
    const reviewRes = await request('POST', `/api/products/${firstProduct.productId}/reviews`, {
      rating: 5,
      comment: 'Super fast delivery and fantastic quality!'
    }, authHeaders);
    assert(reviewRes.status === 201, 'POST /api/products/:id/reviews - Review created', JSON.stringify(reviewRes.body));
    assert(reviewRes.body.averageRating > 0, 'Average rating recalculated');

    // 6. Member 4: Product Reviews GET
    const getReviewsRes = await request('GET', `/api/products/${firstProduct.productId}/reviews`, null, authHeaders);
    assert(getReviewsRes.status === 200 && getReviewsRes.body.totalReviews > 0, 'GET /api/products/:id/reviews - Reviews retrieved', JSON.stringify(getReviewsRes.body));

    // 7. Member 4: Order Placement POST (Validation: Exceeding Stock)
    console.log('\n--- 3. Testing Member 4: Order Management ---');
    const overStockRes = await request('POST', '/api/orders', {
      items: [
        { productId: firstProduct.productId, quantity: initialQty + 100 }
      ]
    }, authHeaders);
    assert(overStockRes.status === 400, 'POST /api/orders rejects orders exceeding available stock');

    // 8. Member 4: Order Placement POST (Success)
    const orderQty = 2;
    const orderRes = await request('POST', '/api/orders', {
      items: [
        { productId: firstProduct.productId, quantity: orderQty }
      ],
      shippingAddress: {
        fullName: 'Test User',
        address: '123 Campus Avenue',
        city: 'Chennai',
        postalCode: '603110'
      }
    }, authHeaders);
    assert(orderRes.status === 201, 'POST /api/orders places order successfully', JSON.stringify(orderRes.body));
    assert(orderRes.body.order && orderRes.body.order.orderId, 'Order contains generated orderId');

    const expectedTotal = Number((firstProduct.price * orderQty).toFixed(2));
    assert(orderRes.body.order.totalAmount === expectedTotal, `Backend accurately calculated total amount ($${orderRes.body.order.totalAmount} === $${expectedTotal})`);

    // Check inventory decrement
    const checkProdRes = await request('GET', `/api/products/${firstProduct.productId}`, null, authHeaders);
    assert(checkProdRes.body.availableQuantity === initialQty - orderQty, `Stock properly decremented: ${initialQty} -> ${checkProdRes.body.availableQuantity}`);

    // 9. Member 4: Order History GET
    const ordersRes = await request('GET', '/api/orders', null, authHeaders);
    assert(ordersRes.status === 200 && ordersRes.body.orders.length > 0, 'GET /api/orders retrieves user order history', `Found ${ordersRes.body.orders.length} orders`);

    // 10. Member 4: User Profile PUT (Complete Update)
    console.log('\n--- 4. Testing Member 4: User Profile Management ---');
    const putRes = await request('PUT', `/api/users?emailId=${encodeURIComponent(testEmail)}`, {
      username: 'Updated Test User',
      age: 22
    }, authHeaders);
    assert(putRes.status === 200 && putRes.body.user.username === 'Updated Test User' && putRes.body.user.age === 22, 'PUT /api/users updates full profile');

    // 11. Member 4: User Profile PATCH (Partial Update)
    const patchRes = await request('PATCH', `/api/users?emailId=${encodeURIComponent(testEmail)}`, {
      age: 23
    }, authHeaders);
    assert(patchRes.status === 200 && patchRes.body.user.age === 23 && patchRes.body.user.username === 'Updated Test User', 'PATCH /api/users updates partial field and preserves existing');

    // 12. Member 4: Profile Authorization (Attempting to modify another user)
    const unauthorizedPut = await request('PUT', `/api/users?emailId=someone_else@example.com`, {
      username: 'Hacker',
      age: 30
    }, authHeaders);
    assert(unauthorizedPut.status === 403, 'PUT /api/users prevents unauthorized updates to other accounts');

    // 13. Member 4: User Profile DELETE
    const deleteRes = await request('DELETE', `/api/users?emailId=${encodeURIComponent(testEmail)}`, null, authHeaders);
    assert(deleteRes.status === 200, 'DELETE /api/users deletes user account successfully');

    // Verify user is deleted by trying to login
    const loginAfterDelete = await request('POST', '/api/login', {
      emailId: testEmail,
      password: testPassword
    });
    assert(loginAfterDelete.status === 404, 'Deleted user cannot log in (User Not Registered)');

    console.log('\n====================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('Test execution failed:', err);
  }
}

runTests();
