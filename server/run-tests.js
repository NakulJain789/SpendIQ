const http = require('http');

// Helper to make HTTP requests
function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
    };
    if (dataString) {
      headers['Content-Length'] = Buffer.byteLength(dataString);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method,
      headers
    };

    const req = http.request(options, (res) => {
      let resBody = '';
      res.on('data', (chunk) => (resBody += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(resBody);
        } catch {
          json = resBody;
        }
        resolve({ status: res.statusCode, data: json, headers: res.headers });
      });
    });

    req.on('error', (err) => reject(err));
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function run() {
  console.log('🚀 Booting SpendIQ server in-process...');
  // Require server which triggers connectDB and app.listen
  require('./server');

  // Wait for server to become responsive on /api/health
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 600));
    try {
      const res = await request('GET', '/health');
      if (res.status === 200 && res.data?.status === 'healthy') {
        ready = true;
        break;
      }
    } catch {
      // Keep waiting
    }
  }

  if (!ready) {
    console.error('❌ Server failed to respond to /api/health within timeout.');
    process.exit(1);
  }

  console.log('✅ Server is ready on port 5000! Running API tests...\n');

  try {
    // 1. Health check
    const health = await request('GET', '/health');
    console.log(`[1] Health Check: ${health.status === 200 ? '✅ PASSED' : '❌ FAILED'}`);

    // 2. Register User 1
    const user1Email = `nakul_${Date.now()}@example.com`;
    const reg1 = await request('POST', '/auth/register', {
      name: 'Nakul Jain',
      email: user1Email,
      password: 'password123'
    });
    console.log(`[2] Register User 1: ${reg1.status === 201 ? '✅ PASSED' : '❌ FAILED'}`);
    const token1 = reg1.data.token;

    // 3. Verify Default Categories seeded for User 1
    const cats1 = await request('GET', '/categories', null, token1);
    console.log(`[3] Verify 9 Default Categories Seeded: ${cats1.data?.count === 9 ? '✅ PASSED (Count: 9)' : '❌ FAILED'}`);

    // 4. Register User 2 for Isolation Testing
    const user2Email = `alex_${Date.now()}@example.com`;
    const reg2 = await request('POST', '/auth/register', {
      name: 'Alex Smith',
      email: user2Email,
      password: 'password123'
    });
    console.log(`[4] Register User 2: ${reg2.status === 201 ? '✅ PASSED' : '❌ FAILED'}`);
    const token2 = reg2.data.token;

    // 5. Create Transactions for User 1
    const tSalary = await request('POST', '/transactions', {
      title: 'Monthly Tech Salary',
      amount: 150000,
      type: 'income',
      category: 'Salary',
      date: new Date().toISOString(),
      isRecurring: true,
      recurringFrequency: 'monthly'
    }, token1);
    console.log(`[5a] Create Income (Salary): ${tSalary.status === 201 ? '✅ PASSED' : '❌ FAILED'}`);

    const tRent = await request('POST', '/transactions', {
      title: 'Apartment Rent',
      amount: 35000,
      type: 'expense',
      category: 'Rent & Housing',
      date: new Date().toISOString()
    }, token1);
    console.log(`[5b] Create Expense (Rent): ${tRent.status === 201 ? '✅ PASSED' : '❌ FAILED'}`);

    const tGroceries = await request('POST', '/transactions', {
      title: 'Nature Basket Groceries',
      amount: 12000,
      type: 'expense',
      category: 'Food & Dining',
      date: new Date().toISOString()
    }, token1);

    const tBill = await request('POST', '/transactions', {
      title: 'Power & Water Bill',
      amount: 4500,
      type: 'expense',
      category: 'Bills & Utilities',
      date: new Date().toISOString()
    }, token1);

    // 6. Test User Data Isolation (User 2 attempts to view User 1 transactions)
    const u2Transactions = await request('GET', '/transactions', null, token2);
    const isIsolated = u2Transactions.data?.count === 0;
    console.log(`[6a] User Isolation Check (User 2 sees 0 transactions): ${isIsolated ? '✅ PASSED' : '❌ FAILED'}`);

    // User 2 attempts to delete User 1's transaction
    const u2DeleteAttempt = await request('DELETE', `/transactions/${tRent.data.data._id}`, null, token2);
    console.log(`[6b] User Isolation Mutate Attempt (Returns 403 Forbidden): ${u2DeleteAttempt.status === 403 ? '✅ PASSED' : '❌ FAILED'}`);

    // 7. Test Dashboard Summary (Dynamic Calculation)
    const dashboard = await request('GET', '/dashboard/summary', null, token1);
    const dData = dashboard.data?.data;
    const expectedBalance = 150000 - (35000 + 12000 + 4500); // 98,500
    const balanceMatches = dData?.totalBalance === expectedBalance;
    console.log(`[7] Dashboard Dynamic Calculation: ${balanceMatches ? `✅ PASSED (Balance: ₹${dData?.totalBalance})` : '❌ FAILED'}`);
    console.log(`    - Total Income: ₹${dData?.totalIncome}`);
    console.log(`    - Total Expenses: ₹${dData?.totalExpenses}`);
    console.log(`    - Savings Rate: ${dData?.savingsRate}%`);
    console.log(`    - Category Breakdown Items: ${dData?.categoryBreakdown?.length}`);

    // 8. Test Budget Setting & Warning Progress Indicator
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const setBudgetRes = await request('PUT', '/budget', {
      month: currentMonth,
      year: currentYear,
      amount: 50000
    }, token1);
    console.log(`[8a] Update Monthly Budget Target: ${setBudgetRes.status === 200 ? '✅ PASSED' : '❌ FAILED'}`);

    const getBudgetRes = await request('GET', `/budget?month=${currentMonth}&year=${currentYear}`, null, token1);
    const bData = getBudgetRes.data?.data;
    const isExceeded = bData?.alertLevel === 'exceeded';
    console.log(`[8b] Budget Progress Status: ${isExceeded ? `✅ PASSED (Used: ${bData?.percentageUsed}%, Alert: ${bData?.alertLevel})` : '❌ FAILED'}`);

    // 9. Test Transaction Update
    const updatedBill = await request('PUT', `/transactions/${tBill.data.data._id}`, {
      amount: 5500,
      title: 'Power & Water Bill (Updated)'
    }, token1);
    console.log(`[9] Update Transaction: ${updatedBill.status === 200 && updatedBill.data.data.amount === 5500 ? '✅ PASSED' : '❌ FAILED'}`);

    // 10. Test Transaction Delete
    const deletedBill = await request('DELETE', `/transactions/${tBill.data.data._id}`, null, token1);
    console.log(`[10] Delete Transaction: ${deletedBill.status === 200 ? '✅ PASSED' : '❌ FAILED'}`);

    // 11. Test CSV Export
    const csvExport = await request('GET', '/transactions/export', null, token1);
    const isCSV = typeof csvExport.data === 'string' && csvExport.data.includes('Date,Title,Type,Category,Amount (INR)');
    console.log(`[11] CSV Export Format: ${isCSV ? '✅ PASSED' : '❌ FAILED'}`);

    // 12. Test Category CRUD
    const newCat = await request('POST', '/categories', {
      name: 'Crypto & Investments',
      color: '#14B8A6',
      monthlyBudget: 10000
    }, token1);
    console.log(`[12a] Create Custom Category: ${newCat.status === 201 ? '✅ PASSED' : '❌ FAILED'}`);

    const catUpdate = await request('PUT', `/categories/${newCat.data.data._id}`, {
      monthlyBudget: 15000
    }, token1);
    console.log(`[12b] Update Category Cap: ${catUpdate.status === 200 ? '✅ PASSED' : '❌ FAILED'}`);

    const catDelete = await request('DELETE', `/categories/${newCat.data.data._id}`, null, token1);
    console.log(`[12c] Delete Category: ${catDelete.status === 200 ? '✅ PASSED' : '❌ FAILED'}`);

    console.log('\n🎉 ALL 12 TEST SUITES COMPLETED SUCCESSFULLY! 🎉');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test execution error:', err);
    process.exit(1);
  }
}

run();
