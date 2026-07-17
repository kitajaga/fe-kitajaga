const https = require('https');

async function doFetch(url, options) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function run() {
  const loginRes = await doFetch('https://be-kitajaga-production.up.railway.app/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'zaki@mail.com', password: 'password123' })
  });

  const token = loginRes.data.data.token;
  console.log('Got token:', token ? 'yes' : 'no');
  
  // get bookings
  const bookingsRes = await doFetch('https://be-kitajaga-production.up.railway.app/api/bookings', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const bookingId = bookingsRes.data.data[0]?.id;
  console.log("Booking ID:", bookingId);
  
  if (bookingId) {
    const chargeRes = await doFetch('https://be-kitajaga-production.up.railway.app/api/payments/charge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ bookingId })
    });
    console.log("Charge response:", JSON.stringify(chargeRes.data, null, 2));
  }
}

run();
