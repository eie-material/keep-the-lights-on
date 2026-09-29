# Can You Keep the Lights On?

A cash flow game for EIE Module M9, Finance for Startups (CIE, PES University). Students run three small startups for six months each and find out, usually the hard way, that companies die from running out of cash rather than from being unprofitable.

| Startup | Business | How its cash moves | What it teaches |
|---|---|---|---|
| Stufone | Phone for students (the M9 case study) | You pay first and get paid later | Inventory and late-paying customers: profitable on paper, broke in the bank |
| CramCloud | Rs 149 a month study app | You spend to grow and earn it back slowly | Burn rate, runway, CAC vs LTV, raising money early vs when desperate |
| DabbaDrop | Hostel tiffin service | You get paid first and pay later | Customer advances and supplier credit aren't your money; seasons; capex |

After each game, students get a cash vs profit chart, a scorecard, a balance sheet, a decision tree showing where every other choice would have led, a list of their own decisions, and three takeaways.

## Running it

The whole game is `index.html`, a single file of about 330 KB with the fonts and logos inside it. It doesn't need internet, installation or a server.

- **Laptop or desktop:** double-click `index.html`. It opens in Chrome, Edge, Firefox or Safari on Windows, macOS or Linux.
- **Phone:** use a hosted link (see below). Phones don't open HTML files from WhatsApp or email reliably.

It was played start to finish in Chromium, Firefox and WebKit (the engine behind Safari and all iPhone browsers). It was also played by touch on Android phone profiles (Galaxy S8, Pixel 7, and a phone held sideways), including the Android back button.

## Giving students a link

Any one of these works:

1. **GitHub Pages (free and permanent):** make a public repository, upload `index.html`, then turn on Settings > Pages > Deploy from branch. The link looks like `https://<user>.github.io/<repo>/`.
2. **Netlify Drop (free, takes a minute):** drag this folder onto https://app.netlify.com/drop and you get a link straight away. Sign up if you want to keep it.
3. **Any website or LMS that serves HTML files**, such as a college site. Just upload `index.html`.

Google Drive and OneDrive show HTML files as text instead of running them, so don't use them for the link.

The "startups survived" badges are stored in each student's own browser. Nothing is collected or sent anywhere.

## Changing the numbers

Each startup's numbers sit together near the top of the script in `index.html`, in the `STUFONE`, `CRAM` and `DABBA` blocks (`cfg`, `startCash`, `setup` and `offers`). The decision tree replays the game each time it's shown, so its endings stay correct after any change.

## Re-recording the demo video

`demo.mp4` is a recording of the real game made by `record-demo.js`. To make a new one you need Node.js and ffmpeg:

```
npm i playwright
npx playwright install chromium
node record-demo.js
```

Add `FAST=1` for a quick dry run that saves screenshots instead of a video, or `FFMPEG=/path/to/ffmpeg` if ffmpeg isn't on your PATH.
