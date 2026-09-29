// Usage: npm i playwright && node record-demo.js   (FAST=1 for a quick dry run with screenshots)
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const FAST = process.env.FAST === '1';
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const GAME = 'file://' + path.join(__dirname, 'index.html');
const OUT_MP4 = path.join(__dirname, 'demo.mp4');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'keep-lights-'));

const runs = [
  {
    co: 'stufone', title: 'Stufone', sub: 'Pay first, get paid later', pace: 1,
    picks: m => (m === 1 ? { price: 12000, batch: 1000 } : { batch: 0 }),
    events: { retailer: 0 }, low: null, crisis: null
  },
  {
    co: 'dabbadrop', title: 'DabbaDrop', sub: 'Get paid first, pay later', pace: .5,
    picks: m => (m === 1 ? { plan: 'semester', mkt: 30000 } : { mkt: 30000 }),
    events: { kitchen: 0, van: 0 }, low: null, crisis: null
  }
];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ...(FAST ? {} : { recordVideo: { dir: TMP, size: { width: 1280, height: 720 } } })
  });
  const page = await ctx.newPage();
  const wait = s => page.waitForTimeout(FAST ? 450 : s * 1000);
  let shotNo = 0;
  const shot = async name => {
    if (FAST) await page.screenshot({ path: path.join(TMP, `${String(++shotNo).padStart(2, '0')}-${name}.png`) });
  };
  const click = async sel => {
    const el = page.locator(sel).first();
    await el.scrollIntoViewIfNeeded();
    if (!FAST) { await el.hover(); await page.waitForTimeout(400); }
    await el.click();
  };
  const scrollTo = async (sel, s) => {
    await page.evaluate(q => document.querySelector(q).scrollIntoView({ behavior: 'smooth', block: 'center' }), sel);
    await wait(s);
  };
  const caption = async (title, sub, s) => {
    await page.evaluate(([t, u]) => {
      const d = document.createElement('div');
      d.id = 'cap';
      d.style.cssText = 'position:fixed;inset:0;z-index:99;background:#14163A;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Carlito,system-ui,sans-serif;text-align:center;padding:40px';
      d.innerHTML = `<div style="font-size:22px;letter-spacing:.2em;text-transform:uppercase;color:#F2913D;font-weight:700">${u}</div><div style="font-size:60px;font-weight:700;margin-top:10px">${t}</div>`;
      document.body.appendChild(d);
    }, [title, sub]);
    await wait(s);
    await page.evaluate(() => document.getElementById('cap').remove());
  };
  const state = () => page.evaluate(() => ({ scr: ui.screen, m: S.month, id: S.queue[0] && S.queue[0].id }));

  async function play(r) {
    const w = s => wait(s * r.pace);
    await caption(r.title, r.sub, 2.5);
    await click(`[data-act=pick][data-val=${r.co}]`); await w(4); await shot(r.co + '-intro');
    await click('[data-act=begin]');
    for (let guard = 0; guard < 60; guard++) {
      await wait(.3);
      const st = await state();
      await shot(`${r.co}-m${st.m}-${st.scr}`);
      if (st.scr === 'report') break;
      if (st.scr === 'event') { await w(3.5); await click(`[data-act=answer][data-val="${r.events[st.id]}"]`); }
      else if (st.scr === 'lowcash') { await w(3); await click(r.low ? `[data-act=fund][data-val=${r.low}]` : '[data-act=nofund]'); }
      else if (st.scr === 'decide') {
        await w(1.5);
        for (const [k, v] of Object.entries(r.picks(st.m))) { await click(`[data-act=choose][data-key=${k}][data-val='${JSON.stringify(v)}']`); await w(.8); }
        await scrollTo('[data-act=run]', 2 * r.pace);
        await click('[data-act=run]');
      }
      else if (st.scr === 'result') { await w(4); await click('[data-act=continue]'); }
      else if (st.scr === 'crisis') { await w(3); await click(r.crisis ? `[data-act=fund][data-val=${r.crisis}]` : '[data-act=shutdown]'); }
      else if (st.scr === 'gameover') { await wait(5.5); await click('[data-act=report]'); }
    }
    await wait(3.5);
    await scrollTo('.chart-card', 4.5);
    await scrollTo('.bs', 3.5);
    await scrollTo('.tree-card', 5.5);
    await scrollTo('.learn', 3);
    await click('[data-act=hub]');
    await wait(1.5);
  }

  await page.goto(GAME);
  await wait(4); await shot('title');
  await click('[data-act=hub]'); await wait(4); await shot('hub');
  for (const r of runs) await play(r);
  await wait(3); await shot('hub-after');

  const video = page.video();
  await ctx.close();
  await browser.close();

  if (FAST) return console.log('screenshots in', TMP);
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', await video.path(),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', '30',
    '-movflags', '+faststart', OUT_MP4]);
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log('wrote', OUT_MP4);
})();
