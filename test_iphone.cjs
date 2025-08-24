const puppeteer = require('puppeteer');
const path = require('path');

async function testIPhoneViewport() {
  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    defaultViewport: null
  });

  try {
    const page = await browser.newPage();
    
    // Set iPhone 12 Pro viewport (390x844)
    await page.setViewport({
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    });

    // Set user agent to iPhone
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1');

    console.log('Testing Home Page...');
    await page.goto('https://chaupar-11916-5aa.web.app', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot of home page
    await page.screenshot({
      path: path.join(__dirname, 'screenshots', 'home-iphone.png'),
      fullPage: true
    });
    console.log('✓ Home page screenshot saved');

    // Test game creation - click on AI Challenge
    console.log('Testing AI Game Creation...');
    try {
      const aiCard = await page.$('.mode-card');
      if (aiCard) {
        await aiCard.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Take screenshot of AI game setup
        await page.screenshot({
          path: path.join(__dirname, 'screenshots', 'ai-game-setup-iphone.png'),
          fullPage: true
        });
        console.log('✓ AI game setup screenshot saved');
      }
    } catch (error) {
      console.log('Could not test AI card:', error.message);
    }

    // Test join game section
    console.log('Testing Join Game Section...');
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await page.screenshot({
      path: path.join(__dirname, 'screenshots', 'join-game-iphone.png'),
      fullPage: true
    });
    console.log('✓ Join game section screenshot saved');

    // Test actual game page (if we can create one)
    console.log('Testing Game Page...');
    try {
      // Try to create an AI game
      const aiButton = await page.$('.mode-btn');
      if (aiButton) {
        await aiButton.click();
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check if we're on the game page
        const gameHeader = await page.$('.game-header');
        if (gameHeader) {
          await page.screenshot({
            path: path.join(__dirname, 'screenshots', 'game-page-iphone.png'),
            fullPage: true
          });
          console.log('✓ Game page screenshot saved');
        }
      }
    } catch (error) {
      console.log('Could not test game page:', error.message);
    }

    console.log('\n🎯 iPhone Viewport Testing Complete!');
    console.log('📱 Screenshots saved in ./screenshots/ directory');
    console.log('🔍 Check the screenshots to verify mobile rendering quality');

  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await browser.close();
  }
}

// Create screenshots directory if it doesn't exist
const fs = require('fs');
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
  console.log('Created screenshots directory');
}

// Run the test
testIPhoneViewport().catch(console.error);
