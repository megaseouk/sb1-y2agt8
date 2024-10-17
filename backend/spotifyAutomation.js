import puppeteer from 'puppeteer';

export async function fillSpotifyForm(profile) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the Spotify lead generation form
    await page.goto('https://www.spotify.com/us/signup/');

    // Fill in the form fields
    await page.type('#email', profile.email);
    await page.type('#confirm', profile.email);
    await page.type('#password', 'TemporaryPassword123!'); // You may want to generate a random password
    await page.type('#displayname', profile.name);
    await page.type('#month', '01'); // Example: January
    await page.type('#day', '01'); // Example: 1st
    await page.type('#year', '1990'); // Example: 1990

    // Select gender (example: select 'Prefer not to say')
    await page.select('#gender', '3');

    // Accept terms and conditions
    await page.click('#terms-conditions-checkbox');

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForNavigation();

    // Check if registration was successful
    const currentUrl = page.url();
    const isSuccess = currentUrl.includes('signup/success') || currentUrl.includes('account/overview');

    await browser.close();

    return {
      success: isSuccess,
      message: isSuccess ? 'Spotify account created successfully' : 'Failed to create Spotify account'
    };
  } catch (error) {
    await browser.close();
    return {
      success: false,
      message: 'Error during form submission: ' + error.message
    };
  }
}