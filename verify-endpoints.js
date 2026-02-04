const http = require('http');

const makeRequest = (method, path, data = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 8000,
            path: `/api/v1${path}`,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    // Check if response is JSON
                    if (res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
                        resolve({ status: res.statusCode, body: JSON.parse(body) });
                    } else {
                        resolve({ status: res.statusCode, body: body });
                    }
                } catch (e) {
                    resolve({ status: res.statusCode, body });
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
};

async function runTests() {
    console.log('Starting verification...');

    try {
        // 1. Test FAQs (Public)
        console.log('\nTesting GET /faqs...');
        const faqsRes = await makeRequest('GET', '/faqs');
        console.log('Status:', faqsRes.status);
        console.log('Data:', faqsRes.body);

        // 2. Test Testimonials (Public)
        console.log('\nTesting GET /testimonials...');
        const testimonialsRes = await makeRequest('GET', '/testimonials');
        console.log('Status:', testimonialsRes.status);
        console.log('Data:', testimonialsRes.body);

        // 3. Test Newsletter Subscribe
        const email = `test${Date.now()}@example.com`;
        console.log(`\nTesting POST /newsletter/subscribe with ${email}...`);
        const subRes = await makeRequest('POST', '/newsletter/subscribe', { email });
        console.log('Status:', subRes.status);
        console.log('Data:', subRes.body);

        // 4. Test Product Specifications (requires fetching a product, assume we can fetch one)
        console.log('\nTesting GET /products (to check structure availability)...');
        const productsRes = await makeRequest('GET', '/products?limit=1');
        if (productsRes.body.success && productsRes.body.data.length > 0) {
            console.log('Product Structure Sample:', JSON.stringify(productsRes.body.data[0].specifications || 'No specifications field', null, 2));
        } else {
            console.log('No products found to check structure.');
        }

    } catch (error) {
        console.error('Verification failed:', error);
    }
}

runTests();
