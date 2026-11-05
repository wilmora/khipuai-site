# Self-assessment leads (Google Apps Script)

The "Get it by email" form on `/self-assessment/` posts here. The script saves
each lead to a Google Sheet, emails the visitor their result, and emails the
script owner a "new lead" notice. Until `leads` in `shared/content.js` holds the
web app URL, the form stays hidden and the page shows the plain PDF download.

**`Code.gs` in this folder is a copy, not the running script.** The script
that runs is the one pasted into the Apps Script editor of the KHIPUAI Leads
sheet. A change to `Code.gs` here, including the hardening below, does
nothing until the owner pastes the new `Code.gs` into that editor, approves
any new permission and deploys a new version (see "Changing the script").

## One-time setup (about 5 minutes, in the Google account that should own the leads)

1. Create a Google Sheet named **KHIPUAI Leads** and share it with no one
   (see "Keep the sheet private").
2. In the sheet: **Extensions > Apps Script**. Delete the starter code, paste
   all of `Code.gs`, and save.
3. Pick `testSetup` in the function list and press **Run**. Approve the
   permissions (this spreadsheet only, send email, connect to an external
   service). It creates the `Leads` tab and sends nothing.
4. **Deploy > New deployment > Web app**. Execute as: **Me**. Who has access:
   **Anyone**. Deploy and copy the URL ending in `/exec`.
5. Put that URL in `shared/content.js` as `leads: '<url>'`, then make the
   test submission (step 5 of "Changing the script").

## Changing the script (redeploy, keeps the same URL)

The script sends email as you, so read what changed before you paste it: on
GitHub, open the pull request or commit that changed `edge/leads/Code.gs` and
read every changed line. Paste only a version from the `main` branch.

1. Open the **KHIPUAI Leads** sheet, then **Extensions > Apps Script**.
2. In `Code.gs` in the editor, select everything, delete it, paste all of the
   new `Code.gs` from this folder, and save (Ctrl+S, or Cmd+S on a Mac). Its
   first line is `/** @OnlyCurrentDoc */`.
3. Pick `testSetup` in the function list and press **Run**. If Google asks
   for permission, review and approve it. The log line shows how many emails
   the script can still send today and ends with whether the Turnstile check
   is on or off.
4. **Deploy > Manage deployments**, select the active web app deployment,
   press **Edit** (the pencil), set **Version: New version**, and press
   **Deploy**. Editing that same deployment keeps the `/exec` URL, so the
   site does not change. Do not use **Deploy > New deployment** for an
   update: a new deployment gets a new URL that the site does not know.
5. Test submission: from the live page, send your own result to your own
   address. Check all three: the result email arrives; the row appears with
   **Result emailed** set to `yes`; and the owner notice arrives, with a
   subject like `New KHIPUAI lead: 18/24 (High)` and `Sheet:` as its
   first line. If one is missing, open **Executions** in the Apps Script
   editor and read the error for `doPost`.

### The narrower Sheets permission

The first line of `Code.gs`, `/** @OnlyCurrentDoc */`, asks Google for access
to this one spreadsheet instead of every spreadsheet in your account. Google
keeps the broader permission an earlier version was given until you remove
it. Once the five steps above work:

1. At myaccount.google.com, go to **Security > Third-party connections** (it
   may be called "Your connections to third-party apps & services"), open
   this Apps Script project (listed under its project name) and remove its
   access. From now until step 2 the form fails while the page still shows
   "Sent", so go straight on.
2. In the Apps Script editor, run `testSetup` again and approve. The Sheets
   permission should now cover only the spreadsheet the script belongs to,
   not all your spreadsheets.
3. Make the test submission again (step 5 above).

If either test submission fails with a permission problem (no row; a notice
with `NOT SAVED` in its subject and a permission error; or a `doPost` error
in **Executions** about `getActiveSpreadsheet` or a missing permission), the
narrower permission does not work for this web app. Delete the first line,
`/** @OnlyCurrentDoc */`, save, run `testSetup`, approve, deploy a new
version (step 4), and test again. The rest of the script works the same
without that line.

### Keep the sheet private

Share the KHIPUAI Leads sheet with no one. Anyone who can edit the sheet can
also open and change this script, which sends email as you, and the sheet
holds visitors' names and addresses. To give someone the leads, send a copy
or an export instead.

## What the first November 2026 hardening changed

- **First name.** Only letters (any alphabet, with accents), spaces,
  apostrophes (`'` and `’`) and hyphens are kept. Digits, dots, slashes, `@`
  and everything else are removed, runs of spaces become one, and the name
  is capped at 40 characters. So a "name" like `Visit example.co/claim now`
  arrives as `Visit examplecoclaim now` and cannot become a link in the
  result email that KHIPUAI sends. A name with no letter left is treated as
  empty, and the email says "Hi there,".
- **The sheet.** The email address (and the first name) now get the same
  formula guard as the other typed fields: a value starting with `=`, `+`,
  `-` or `@` is written with a `'` in front, so Sheets, or Excel after a
  download, shows it as text instead of running it. The result is still sent
  to the address exactly as typed.
- **Band and area ids** must match exactly. Before, a band id such as
  `constructor` slipped through and produced an email reading "undefined".
  Repeated area ids are counted once.
- **The owner notice** shows the same cleaned and capped campaign (UTM)
  values as the sheet, instead of the raw text a request carried.
- **Optional Cloudflare Turnstile check** (below). Off until you set it up.
- Unchanged: the caps, the honeypot, the reply format, the email wording
  (apart from "Hi there,"), the sheet headers, and the band and area ids the
  site sends.
- **Tests:** `node --test tests/leads.test.mjs` runs this `Code.gs` against
  small fakes of the Google services. CI runs it with the other site tests.

## What the second round changed (November 2026)

- **Permission:** Sheets access covers only this spreadsheet (see "The
  narrower Sheets permission").
- **Owner notice:** nothing the visitor typed in the subject; the sheet link
  and a warning come first, and typed text is shown so it cannot be a link.
- **Failed sends** are recorded on the row and in the owner notice instead of
  losing the lead, and the last 5 emails of the day are kept for notices.
- **Address check:** addresses Gmail refuses (a dot at the start, two dots in
  a row, a dot right before the `@`, commas and similar) are refused, with
  the same rule as the form on the site.
- **Turnstile:** at most 30 calls to Cloudflare a minute.

## New permission: connect to an external service

The Turnstile check calls Cloudflare with `UrlFetchApp`, so this version of
the script needs one more Google permission, shown as **Connect to an
external service**. Google asks for it based on the code, even while the
Turnstile check is off. Approve it once, by running `testSetup` from the
editor (step 3 of "Changing the script") **before** you deploy the new
version. A web app that runs as you cannot ask visitors for your permission,
so until you approve it the form's requests fail, while the page still
shows "Sent".

## Turnstile: an optional check that the visitor is a person

Today only a hidden honeypot field stops bots, so a script can make this
endpoint send result emails (up to the daily cap) to addresses it chooses.
Cloudflare Turnstile is a free check, usually invisible to people, that is
hard for a bot to pass. It does not need the domain's DNS to be on Cloudflare; a free
Cloudflare account is enough. When it is on, every request must carry a
token that Cloudflare confirms was solved on khipuai.co, and the check runs
before anything is counted, saved or sent.

Do the steps in this order. Setting the secret before visitors' browsers
have the site key would make the script refuse every request, and the page
would still show "Sent".

1. Redeploy the new `Code.gs` (see "Changing the script"). With no secret
   set, it behaves exactly as before.
2. In the Cloudflare dashboard: **Turnstile > Add widget**. Name it
   (for example, KHIPUAI self-assessment), add the hostnames `khipuai.co`
   and `www.khipuai.co`, choose **Managed**, and create it. Copy the
   **site key** and the **secret key**.
3. Put the site key in `shared/content.js` as `turnstile: '<site key>'`
   (it is public by design), merge it, and wait for the Pages deploy plus
   about 10 minutes for browser caches. On the live page, click into the
   email form: the check appears just above the **Email My Result** button.
4. In the Apps Script editor: **Project Settings** (the gear) **> Script
   properties > Add script property**. Property: `TURNSTILE_SECRET`. Value:
   the secret key. Save. No redeploy is needed; the script reads it on every
   request. Never put the secret key in this repository or in
   `shared/content.js`.
5. Pick `testTurnstile` in the function list and press **Run**. If the log
   shows `invalid-input-response`, the secret is right (only the dummy token
   was refused). If it shows `invalid-input-secret`, the secret is wrong.
6. Send your own result from the live page and check the email and the row.

Any Content-Security-Policy on the self-assessment page, whether in its HTML
or added by the Cloudflare edge worker (`edge/worker.js`) if that is ever
deployed, must allow `https://challenges.cloudflare.com` in `script-src` and
`frame-src`. Otherwise the browser blocks the check and no visitor can send
the form.

Turnstile means Cloudflare processes some data about visitors who use the
form (such as their IP address and browser signals). Consider naming
Cloudflare on the privacy page when you switch it on.

To switch it off: delete the `TURNSTILE_SECRET` script property first, then
empty `turnstile` in `shared/content.js`.

Refused requests are logged in Apps Script under **Executions** (for example
"Turnstile refused a request" with Cloudflare's error codes, or one line when
the per-minute cap below is reached); the secret and the token are never
logged.

## Limits worth knowing

- The visitor email is built only from text in `Code.gs`. The site sends a
  score, a band id and area ids, never free text that gets mailed out, except
  the first name, which keeps only letters, spaces, apostrophes and hyphens.
- The owner notice comes from your own account, so mail filters trust it.
  Its subject is fixed text and numbers only, for example
  `New KHIPUAI lead: 18/24 (High), follow-up OK`. Its body starts with
  the `Sheet:` link and a warning. Below the warning, the company and the
  campaign values (and an address holding a slash) show every dot as `[.]`,
  with slashes, colons and `@` removed, so none of them is a working link.
  The sheet keeps them as typed. Treat everything below the warning as the
  visitor's words, not instructions.
- **Result emailed** is written as `pending` when the row is saved, then set
  to what happened: `yes`, `no (repeat within 10 min)`, `no (daily cap)`,
  `no (mail quota low)` or `no (send failed: <reason>)`. The owner notice
  says the same. For the last two, send the result by hand from the row.
  `yes` means Gmail accepted the email; a bounce, if any, arrives later in
  your inbox. A row still showing `pending` means the script stopped before
  it could record the outcome; check **Executions**.
- If the row itself cannot be saved, the owner notice still goes out, with
  `NOT SAVED` in its subject and the error near the top. That email is then
  the only record of the lead, and no result is sent to the visitor.
- One result per address every 10 minutes; at most 60 result emails a day.
- Google also limits the emails a script can send a day (about 100 for a
  personal Gmail account, about 1,500 for Google Workspace). The script
  keeps the last 5 for owner notices: with 5 or fewer left, it saves the
  lead, skips the result email and records `no (mail quota low)`.
- At most 40 "new lead" notices to the owner a day. The first submission past
  that sends one warning email, then notices stay quiet until the next day.
- At most 200 rows saved a day (failed writes count too); past that,
  requests are dropped without writing. Days are UTC. The counters live in
  the script property `counters`.
- With Turnstile on, at most 30 tokens a minute go to Cloudflare. Past that,
  requests are refused for the rest of the minute without a call, so a flood
  of fake tokens cannot use up the script's daily quota of outside calls.
  Real visitors in that minute are refused too.
- The site cannot read the script's reply (the request is sent with
  `no-cors`), so the page shows "Sent" once the request leaves the browser,
  even when a cap or the Turnstile check dropped it. The success message
  therefore also offers the worksheet download. The Sheet and the notice
  email are the record of truth.
- Followups: only to rows where **OK to follow up** is `yes` (CASL / CAN-SPAM).
