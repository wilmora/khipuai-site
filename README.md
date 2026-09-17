# KHIPUAI public website

This repository is the production source for [khipuai.co](https://khipuai.co). GitHub Pages publishes the root of `main`.

## Structure

- `index.html`: English Kinetic homepage
- `es/index.html`: Spanish Kinetic homepage
- `about/`: English Kinetic about page
- `self-assessment/`: interactive assessment and direct PDF download
- `shared/`: shared content, behavior, quote rules, design system, fonts, and images
- `audit/`, `work/`, `blog/`, `es/about/`, `es/audit/`, `es/work/`: preserved supporting routes
- `self_assessment.html`: compatibility redirect to `/self-assessment/`

## Development

Serve the repository root over HTTP. Do not open the HTML files directly because the pages use JavaScript modules.

The site is intentionally buildless. Before publishing, follow `AGENTS.md`, validate local routes and assets, exercise both quote languages, test responsive layouts, and confirm production pages do not contain `noindex`.

## Deployment

Production deploys automatically from `main` through GitHub Pages. Do not push unreviewed work directly to `main`. The custom domain is configured by `CNAME`.
