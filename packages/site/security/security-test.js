
const { zaproxy } = require('zaproxy');
const { writeFileSync } = require('fs');

const zapOptions = {
  apiKey: 'your-zap-api-key',
  proxy: 'http://localhost:8080'
};

(async function securityTest() {
  const targetUrl = 'http://localhost:8000';

  try {
    // Start the OWASP ZAP active scan
    const scanId = await zaproxy.ascan.scan(zapOptions, { url: targetUrl });
    console.log('Scan started with ID:', scanId);
    
    // Poll until the scan is complete
    let scanProgress = await zaproxy.ascan.status(zapOptions, { scanId });
    while (scanProgress < 100) {
      console.log(`Scan progress: ${scanProgress}%`);
      scanProgress = await zaproxy.ascan.status(zapOptions, { scanId });
    }

    // Fetch and log the scan results
    const alerts = await zaproxy.core.alerts(zapOptions);
    const reportJson = JSON.stringify(alerts, null, 2);
    writeFileSync('zap-security-report.json', reportJson);
    
    console.log('Security scan completed. Alerts:', alerts.length);
  } catch (error) {
    console.error('Security scan failed:', error);
  }
})();
