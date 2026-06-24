const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport for a desktop size
  await page.setViewport({ width: 1280, height: 800 });

  // Navigate to login and set auth cookie or local storage if needed.
  // We can just navigate to /login, wait, and use a test account, 
  // OR since /rides/create requires auth, maybe we can just set the token in local storage?
  // Let's just login first.
  await page.goto('http://localhost:3000/login');
  
  // Wait for login form
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'john@hust.edu.vn');
  await page.type('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Wait for navigation to /home
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  // Go to create ride
  await page.goto('http://localhost:3000/rides/create');

  // Wait for page to load
  await page.waitForSelector('input[placeholder="VD: KTX Bách Khoa"]');

  // Type in "bệnh viện 108"
  await page.type('input[placeholder="VD: KTX Bách Khoa"]', 'bệnh viện 108');

  // Wait for dropdown to appear (ul with li)
  await page.waitForSelector('ul.absolute li');

  // Click the first dropdown item
  await page.click('ul.absolute li');

  // Wait for map marker to update (debounce, api call)
  await new Promise(r => setTimeout(r, 2000));

  // Take screenshot
  const screenshotPath = 'C:\\Users\\AORUS\\.gemini\\antigravity\\brain\\4c819d28-aa49-4186-9126-162fd1de4d6d\\locationpicker_fixed.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log(`Screenshot saved to ${screenshotPath}`);

  await browser.close();
})();
