# Self-assessment leads (Google Apps Script)

The "Get it by email" form on `/self-assessment/` posts here. The script saves
each lead to a Google Sheet, emails the visitor their result, and emails the
script owner a "new lead" notice. Until `leads` in `shared/content.js` holds the
web app URL, the form stays hidden and the page shows the plain PDF download.

## One-time setup (about 5 minutes, in the Google account that should own the leads)

1. Create a Google Sheet named **KHIPUAI Leads**.
2. In the sheet: **Extensions > Apps Script**. Delete the starter code, paste
   all of `Code.gs`, and save.
3. Pick `testSetup` in the function list and press **Run**. Approve the
   permissions (Sheets, send email). It creates the `Leads` tab and sends nothing.
4. **Deploy > New deployment > Web app**. Execute as: **Me**. Who has access:
   **Anyone**. Deploy and copy the URL ending in `/exec`.
5. Put that URL in `shared/content.js` as `leads: '<url>'`, then run a real
   test from the live page with your own address.

## Changing the script later

Edit, then **Deploy > Manage deployments > Edit (pencil) > Version: New
version**. Editing that same deployment keeps the `/exec` URL, so the site does
not change. A brand-new deployment gets a new URL.

## Limits worth knowing

- The visitor email is built only from text in `Code.gs`. The site sends a
  score, a band id and area ids, never free text that gets mailed out, except
  the first name, which is cleaned and capped.
- One result per address every 10 minutes; at most 60 result emails a day.
- At most 40 "new lead" notices to the owner a day. The first submission past
  that sends one warning email, then notices stay quiet until the next day.
- At most 200 rows saved a day; past that, requests are dropped without
  writing. Days are UTC. The counters live in the script property `counters`.
- The site cannot read the script's reply (Apps Script does not do CORS), so
  the page shows "sent" once the request leaves the browser. The Sheet and the
  notice email are the record of truth.
- Followups: only to rows where **OK to follow up** is `yes` (CASL / CAN-SPAM).
