# KHIPUAI site (publish-ready)

This folder is the complete public website. Everything here is meant to be public. (The internal kit docs in the parent folder are NOT here on purpose.)

Files: `index.html` (the landing page), `self_assessment.html` (the lead magnet), `privacy.html`, `founder.jpg`, `og-image.png` (social share card), `self-assessment.pdf`, `.nojekyll`.

## One thing to set before going live: the booking link

The "Book a call" buttons point to a placeholder `BOOKING_LINK`. Replace it with your Calendly URL in `index.html` and `self_assessment.html` (find and replace all). 

Easiest: create a Calendly event ("20-minute Automation Discovery call"), copy the link, and either do the find-replace yourself, or send the link to Wil's AI assistant and it will swap it and re-package in seconds.

(The self-assessment link already works; it points to `self_assessment.html`.)

## Publish on your PERSONAL GitHub (free, ~10 minutes)

1. Go to github.com, sign in to your personal account, click **New repository**.
2. Name it `khipuai-site` (or anything). Set it **Public**. Do not add a README (this folder has one). Create.
3. On the new repo page, click **"uploading an existing file"**. In your file explorer, open this `site` folder, select ALL the files inside it (Ctrl+A), and drag them into the browser. (Drag the files, not the folder.) Commit.
4. Go to **Settings -> Pages**. Under "Build and deployment", Source = **Deploy from a branch**, Branch = **main** (or master), folder = **/ (root)**. Save.
5. Wait about 1 minute. Your site is live at `https://<your-username>.github.io/khipuai-site/`.

That URL is shareable immediately. Put it on LinkedIn, in your email signature, and in posts.

## Add the custom domain khipuai.co (after you register it)

1. Register **khipuai.co** at a cheap registrar (Cloudflare Registrar, Porkbun, or Namecheap; roughly $10 to $30/yr).
2. In the repo: Settings -> Pages -> Custom domain -> enter `khipuai.co` -> Save. (GitHub creates a CNAME file for you.)
3. At your registrar's DNS, add the records GitHub shows you (an `A`/`ALIAS` to GitHub Pages IPs for the apex, or a `CNAME` to `<username>.github.io` for `www`). GitHub's Pages docs list the exact IPs.
4. Tick **Enforce HTTPS** once the certificate provisions.
5. The social share image (`og-image.png`) and `og:url` already point to `https://khipuai.co/...`, so link previews on LinkedIn will look right once the domain is live.

## Analytics (optional, free, recommended)

Open `index.html`, find the `ANALYTICS` comment in the `<head>`, and paste your snippet:
- **Plausible** (privacy-friendly, ~$9/mo, simplest, no cookie banner needed), or
- **Google Analytics 4** (free).

## Instant-preview alternative (no account)

If you want to see it on a public URL in 60 seconds before doing GitHub: go to **app.netlify.com/drop** and drag this `site` folder onto the page. You get a temporary live URL instantly (sign up free to keep it). Use GitHub Pages for the real home per your preference.
