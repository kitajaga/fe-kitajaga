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
  // Login
  const loginRes = await doFetch('https://be-kitajaga-production.up.railway.app/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'zaki@mail.com', password: 'password123' })
  });

  const token = loginRes.data.data.token;
  console.log('Got token:', token ? 'yes' : 'no');

  // Test create patient
  const payload = {
    name: "Budi Santoso Test",
    dateOfBirth: "1958-03-12", // YYYY-MM-DD
    gender: "male",
    address: "Jl. Menteng Raya No.10",
    latitude: -6.195,
    longitude: 106.832,
    mobilityStatus: "assisted",
    allergies: ["Diabetes"],
    currentMedications: ["Metformin"],
    patientNote: "Test",
    emergencyContact: {
      name: "Rina",
      phone: "081298765432"
    }
  };

  const createRes = await doFetch('https://be-kitajaga-production.up.railway.app/api/patients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  console.log('Create Response 1 (YYYY-MM-DD):', JSON.stringify(createRes.data, null, 2));

  // Try empty array
  payload.allergies = [];
  payload.currentMedications = [];
  const createRes2 = await doFetch('https://be-kitajaga-production.up.railway.app/api/patients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  console.log('Create Response 2 (Empty Arrays):', JSON.stringify(createRes2.data, null, 2));

  // Try ISO date
  payload.dateOfBirth = new Date("1958-03-12").toISOString();
  const createRes3 = await doFetch('https://be-kitajaga-production.up.railway.app/api/patients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  console.log('Create Response 3 (ISO Date):', JSON.stringify(createRes3.data, null, 2));
}

run();
