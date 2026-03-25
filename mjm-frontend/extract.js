import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('https://asesoriasintegralesmjm.com/', { waitUntil: 'networkidle' });

    // Handle any potential popups/modals
    await page.waitForTimeout(2000);

    const bgImages = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('*'))
            .map(el => window.getComputedStyle(el).backgroundImage)
            .filter(bg => bg !== 'none' && bg.includes('url'));
    });

    const imgs = await page.$$eval('img', imgs => imgs.map(img => img.src));
    
    // Get headers and paragraphs text to find exact strings
    const texts = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('h1, h2, h3, h4, p, span, li, button, a'))
            .map(el => el.innerText.trim())
            .filter(t => t.length > 5);
    });

    console.log("=== BACKGROUND IMAGES ===");
    console.log([...new Set(bgImages)].join('\n'));
    console.log("=== IMG SRCs ===");
    console.log([...new Set(imgs)].join('\n'));
    console.log("=== TEXTS ===");
    console.log([...new Set(texts)].join('\n'));

    await browser.close();
})();
