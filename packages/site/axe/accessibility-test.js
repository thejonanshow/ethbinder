
const { Builder, By } = require('selenium-webdriver');
const AxeBuilder = require('@axe-core/webdriverjs');
const { writeFileSync } = require('fs');
const assert = require('assert');

(async function accessibilityTest() {
  let driver = await new Builder().forBrowser('chrome').build();

  try {
    await driver.get('http://localhost:8000');
    const results = await new AxeBuilder(driver).analyze();

    // Write the accessibility report to a file
    const reportJson = JSON.stringify(results, null, 2);
    writeFileSync('axe-accessibility-report.json', reportJson);

    // Check for any violations and assert there are none
    assert.strictEqual(results.violations.length, 0, `Accessibility issues found: ${results.violations.length}`);
    console.log('No accessibility violations');
  } finally {
    await driver.quit();
  }
})();
