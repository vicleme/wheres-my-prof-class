# Where's my prof/class? 📍

*(Leia em português: [README.pt-br.md](README.pt-br.md))*

A quick tool to find **room, class, or professor** in the class schedule of Fatec Baixada Santista — no more checking the printed map every time.

🔗 **Live app:** _(paste the Netlify link here after deploying)_

## What it does

- **Search by professor** (partial name works) → shows where and when they teach, day by day.
- **Search by class** (e.g. `CD6`, `ADS4`) → shows the class's full weekly schedule.
- **Search by room** → shows every class that happens there, at any time.
- **Edit schedule**: a screen with the map as a table (room × time slot), to correct or fill in data by comparing with the photo of the printed map.
- **Conflict warnings**: if the same professor ends up scheduled in two rooms at the same day/time (usually a mistake carried over from the printed map), the app flags it — both in search results and in the schedule editor.
- **Source photos**: the original map photos are attached in the app itself, for double-checking.
- Access is password-protected — room/class/professor data is not exposed in the repository or in the public HTML (see **Data security** below).

## How to use

Open the published link, enter the access password, and choose a search mode (professor / class / room).

Don't know a course code? The search tab shows a legend with all the codes (GP, CD, ADS, SI, LOG, GE, languages, etc.) and each course's color.

## Data security

Unlike an earlier version of this project, room/class/professor data **is not stored in any file in the repository** (not `schedule_data.json`, not embedded in `index.html`). It lives only in [Netlify Blobs](https://docs.netlify.com/blobs/overview/), private storage tied to the site, and it only ever leaves there through two Netlify Functions:

- `get-schedule` returns the data, but requires the SHA-256 hash of the **access password** (the same one everyone uses to enter the app).
- `save-schedule` overwrites the data, but requires the hash of a separate **admin password** (to publish a correction for everyone).

The password itself is never sent or stored — the browser computes its SHA-256 hash locally (`crypto.subtle.digest`) and only the hash travels over the network. The published `index.html` is an empty shell: without the right password, it shows nothing.

**What this doesn't solve:** once someone authenticated receives the data in the browser, it passes through the page's JavaScript — anyone could open DevTools and copy it all. This scheme protects against public access (indexing by Google/GitHub, a leaked link with no password), not against an authorized person passing the data along.

### Setting up the passwords

1. Choose an access password (for people who just need to look things up) and an admin password (for people who publish corrections). They can be simple phrases, like `class-2026-2`.
2. Compute the SHA-256 hash of each one. In a terminal with Node installed:
   ```bash
   node -e "console.log(require('crypto').createHash('sha256').update(process.argv[1]).digest('hex'))" "your-password-here"
   ```
   (Or in the browser console: `crypto.subtle.digest('SHA-256', new TextEncoder().encode('your-password-here')).then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))`)
3. In the Netlify dashboard: **Site configuration → Environment variables**, add:
   - `ACCESS_KEY_HASH` = hash of the access password
   - `ADMIN_KEY_HASH` = hash of the admin password
4. Trigger a new deploy (or "Trigger deploy → Clear cache and deploy") for the variables to take effect.

### First-time data publish (seeding Blobs)

Since the data doesn't go into the repository, Blobs starts out empty. To populate it:

1. Open the published site and log in with the access password.
2. Go to the **Edit schedule** tab → **⬆️ Import file (.json)** and select the `schedule_data.json` you have locally (same format the "Download updated data" button generates).
3. Click **📤 Publish update for everyone** and enter the admin password.

Done — from then on, anyone who logs in with the access password sees that data. To update later, edit directly in the grid (compare with the photo in **Source photos** if unsure) and publish again.

**Important:** never commit a `schedule_data.json` with real data to the repository — it only exists as a local import/export format. `.gitignore` already ignores that file.

## Deploying to Netlify

1. Push this folder to GitHub (see below).
2. On [Netlify](https://app.netlify.com), **Add new site → Import an existing project**, and connect the repository.
3. Build command: none. Publish directory: `.` (root). `netlify.toml` already sets this and points `netlify/functions` as the Functions folder.
4. Set the `ACCESS_KEY_HASH` and `ADMIN_KEY_HASH` environment variables (see above) **before** the first deploy, or redeploy after setting them.
5. Deploy. Then follow the **First-time data publish** section above to seed Blobs.

Netlify's free plan includes Functions and Blobs at no cost within normal usage for an app this size (shared credits, ~300/month — one lightweight function call uses a fraction of a credit).

## Running locally

Since the app now depends on Netlify Functions (and Blobs), running it as `file://` or with a simple HTTP server is no longer enough to see the data — the password screen will show up, but the Function won't respond without Netlify's environment. To actually test it locally, use the [Netlify CLI](https://docs.netlify.com/cli/get-started/):

```bash
npm install
npx netlify dev
```

This spins up the site and the Functions together (with Blobs working locally too), usually at `http://localhost:8888`. Set `ACCESS_KEY_HASH` and `ADMIN_KEY_HASH` in a local `.env` or via `netlify env:set` before running.

## Structure

```
index.html                        # the whole app (HTML + CSS + JS), no embedded data
logo.svg                          # logo/favicon in SVG
favicon.ico                       # favicon (fallback)
apple-touch-icon.png              # icon for the iOS home screen
netlify.toml                      # build/publish config and Functions folder
package.json                      # @netlify/blobs dependency
netlify/functions/get-schedule.js # returns the data (requires access password)
netlify/functions/save-schedule.js# overwrites the data (requires admin password)
```

## Disclaimer

This is an unofficial, student-made project, with no affiliation to Fatec Baixada Santista. Professor data comes from the public room map displayed at the campus; if any professor would rather not appear here, please open an *issue* or reach out and it will be removed.

## License

Distributed under the MIT license — see [LICENSE](LICENSE).
