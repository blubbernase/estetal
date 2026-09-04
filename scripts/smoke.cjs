const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const mime = { '.html': 'text/html', '.json': 'application/json', '.css': 'text/css', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.pdf': 'application/pdf' };
const server = http.createServer((req, res) => {
  const relative = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\/estetal\//, '/');
  let file = path.resolve(root, '.' + relative);
  if (!file.startsWith(root + path.sep) && file !== root) { res.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { res.writeHead(404).end(); return; }
  res.setHeader('Content-Type', (mime[path.extname(file)] || 'text/plain') + '; charset=utf-8');
  fs.createReadStream(file).pipe(res);
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  try {
    fs.mkdirSync(path.join(root, '.release-check'), { recursive: true });
    for (const [name, viewport, prefix] of [['desktop', {width:1440,height:1000}, '/estetal/'], ['mobile', {width:390,height:844}, '/']]) {
      const page = await browser.newPage({ viewport });
      const errors = [], broken = [], external = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', r => { if(r.status() >= 400) broken.push(`${r.status()} ${r.url()}`); });
      page.on('request', r => { if(!r.url().startsWith(origin)) external.push(r.url()); });
      await page.goto(origin + prefix);
      await page.waitForSelector('#teamsGrid .team-card');
      assert.equal(await page.locator('#teamsGrid .team-card').count(), 10);
      assert(await page.locator('#teamsGrid').innerText().then(t => t.includes('Norman Scheepker')));
      assert(await page.locator('#siteStatus').isHidden());
      assert.equal(await page.locator('#downloadsList a').count(), 1);
      assert.equal((await page.request.get(origin + prefix + 'images/aufnahmeantrag.pdf')).status(), 200);
      assert(await page.locator('#eventsList').innerText().then(t => t.includes('Neue Termine')));
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: horizontal overflow`);
      assert.equal(await page.locator('.hamburger').isVisible(), name === 'mobile');
      if (name === 'mobile') {
        await page.locator('#hamburger').click();
        assert.equal(await page.locator('#hamburger').getAttribute('aria-expanded'), 'true');
        await page.locator('#mobileMenu a[href="#mannschaften"]').click();
        assert.equal(await page.locator('#hamburger').getAttribute('aria-expanded'), 'false');
      }
      await page.locator('a.team-card[href="#mannschaft/ue32-senioren"]').click();
      await page.waitForSelector('#subpageOverlay.open');
      assert.equal(await page.locator('#subpageContent a[href^="tel:"]').count(), 2);
      await page.goBack();
      await page.waitForSelector('#subpageOverlay.open', {state:'hidden'});
      for (const hash of ['#mannschaft/u14', '#artikel/saison-2025-26', '#aktuelles', '#mitmachen', '#impressum', '#datenschutz']) {
        await page.goto(origin + prefix + hash);
        await page.waitForSelector('.subpage-overlay.open, .news-detail-overlay.open');
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('.subpage-overlay.open, .news-detail-overlay.open').count(), 0);
      }
      await page.goto(origin + prefix);
      await page.waitForSelector('#teamsGrid .team-card');
      for (let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=600) await page.evaluate(y=>window.scrollTo(0,y),y);
      await page.evaluate(()=>{document.querySelectorAll('.fade-up').forEach(e=>e.classList.add('visible'));window.scrollTo(0,0)});
      await page.evaluate(()=>document.fonts.ready);
      await page.screenshot({path:path.join(root,'.release-check',`${name}.png`),fullPage:true,animations:'disabled'});
      assert.deepEqual(errors, []);
      assert.deepEqual(broken, []);
      assert.deepEqual(external, []);
      await page.goto(origin + prefix + 'admin/');
      assert.equal(await page.locator('a.btn').getAttribute('href'), 'https://app.pagescms.org/');
      await page.close();
      console.log(`${name}: content, links, history, deep links, keyboard, PDF, assets and no third-party requests passed`);
    }
    const page = await browser.newPage();
    await page.route('**/content/news.json', r => r.fulfill({status:500, body:'failure'}));
    await page.goto(origin);
    await page.waitForSelector('#teamsGrid .team-card');
    assert(await page.locator('#siteStatus').isVisible());
    await page.unroute('**/content/news.json');
    await page.route('**/content/meta.json', r => r.fulfill({status:500, body:'failure'}));
    await page.reload();
    await page.waitForSelector('#siteStatus button');
    await page.close();
    console.log('Failure checks passed: optional data failure preserves teams; metadata failure displays retry/contact.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode=1; }).finally(()=>server.close());
