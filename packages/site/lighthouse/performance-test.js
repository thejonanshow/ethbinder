
const { launch } = require('chrome-launcher');
const lighthouse = require('lighthouse');
const { writeFileSync } = require('fs');

(async () => {
  const chrome = await launch({ chromeFlags: ['--headless'] });
  const options = { port: chrome.port, output: 'json' };
  const runnerResult = await lighthouse('http://localhost:8000', options);

  const reportHtml = runnerResult.report;
  const reportJson = JSON.stringify(runnerResult.lhr, null, 2);

  // Write HTML and JSON reports
  writeFileSync('lighthouse-report.html', reportHtml);
  writeFileSync('lighthouse-report.json', reportJson);

  console.log('Performance score:', runnerResult.lhr.categories.performance.score * 100);
  console.log('Accessibility score:', runnerResult.lhr.categories.accessibility.score * 100);
  console.log('Best Practices score:', runnerResult.lhr.categories['best-practices'].score * 100);
  console.log('SEO score:', runnerResult.lhr.categories.seo.score * 100);
  console.log('PWA score:', runnerResult.lhr.categories.pwa.score * 100);

  await chrome.kill();
})();
