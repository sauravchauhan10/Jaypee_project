const https = require('https');

const query = 'ibu';
const url = `https://api.fda.gov/drug/ndc.json?search=generic_name:${query}*+brand_name:${query}*&limit=5`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json.results.map(r => ({
        brand_name: r.brand_name,
        generic_name: r.generic_name,
        dosage_form: r.dosage_form,
        route: r.route
      })), null, 2));
    } catch(e) {
      console.error(e.message);
    }
  });
}).on('error', err => console.error(err.message));
