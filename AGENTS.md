# KHIPUAI website instructions

## Purpose

This repository contains the public KHIPUAI website. Its primary job is to help leaders of 20 to 300-person recurring-service businesses understand the offer, assess fit, receive a responsible estimate, and book a fit call.

The current production site is static. The candidate redesign is under `v2/`. Do not imply that the project already uses Next.js, React, TypeScript, or Tailwind. Any migration to that stack is a separate, reviewed project.

## Working rules

- Work on a topic branch. Do not push directly to `main`.
- Keep staging content under `noindex` until the explicit production switch.
- Preserve existing production routes until redirects have been planned and tested.
- Never commit credentials, form secrets, API keys, client data, or private project records.
- Do not publish or deploy without explicit approval.

## Architecture

- Shared English content lives in `v2/shared/content.js`.
- Spanish content lives in `v2/shared/content.es.js` and must match the English object shape.
- Shared behavior belongs in `v2/shared/kinetic.js` or a focused shared module.
- Shared styling belongs in `v2/shared/kinetic.css`.
- Quote rules belong in `v2/shared/quote.js`. Page templates must not duplicate pricing logic.
- Reuse the shared page builder and existing patterns before adding page-specific code.
- Keep UI rendering, quote rules, content, and external-service configuration separate.

## Positioning and content

- Primary customer: recurring-service businesses with 20 to 300 people and complex back-office workflows spanning several systems.
- Lead offer: free fit call, paid Automation Audit, fixed-scope implementation, optional managed improvement.
- Lead with the business problem and operational outcome. Avoid generic claims about "AI transformation."
- Use plain English and professional Spanish. Avoid hype, unexplained jargon, and em dashes.
- Do not copy competitor wording.
- Do not promise autonomous financial, operational, or customer-facing actions. Important actions remain human-approved.

## Claims and proof

- Do not add a result, percentage, dollar amount, testimonial, client name, or client logo without an evidence record and publication permission.
- Label proof accurately as production outcome, measured pilot, operational evidence, capability example, founder experience, or proposed work.
- Do not present founder experience from a prior employer as a KHIPUAI client result.
- Keep claims scoped to the measured timeframe, sample, workflow, and customer context.
- A disclaimer does not replace evidence.
- Until the project review is complete, use capability patterns rather than named case studies.

## Quote estimator

- The estimator provides a non-binding range and a recommended starting engagement.
- Deterministic rules calculate price. An LLM may classify a visitor's needs but must never invent or freely choose a price.
- Keep the local deterministic fallback even if a server endpoint is added.
- Sanity-check any remote result, rate-limit the endpoint, log quote inputs and outputs, and keep API keys server-side.
- Regional multipliers are not production-ready until approved by the business owner.
- The public result must explain assumptions and state that a person confirms scope and price.

## Design system

- Extend the existing navy, copper, ink, and cream visual system through the tokens in `kinetic.css`.
- Reuse the existing typography, buttons, cards, spacing rhythm, and motion patterns.
- Do not add arbitrary one-off colors, fonts, or inline styles when a shared class or token is appropriate.
- Preserve the khipu knot as a meaningful brand element, not decoration repeated on every screen.

## Responsive behavior

- Verify the site at 360, 390, 768, 1024, 1280, and 1440 CSS pixels.
- Important navigation and calls to action must remain available on mobile.
- Support short laptop viewports as well as narrow phones.
- Do not introduce unintended horizontal scrolling, clipped copy, or inaccessible controls.
- Touch targets should be at least 44 by 44 CSS pixels where practical.

## Accessibility

- Target WCAG 2.2 AA.
- Each page needs a main landmark, a working skip link, a meaningful title, and one clear H1.
- All controls must work by keyboard and show a visible focus state.
- Use semantic buttons for actions and links for navigation.
- Forms need programmatic labels, useful validation, and clear error and success states.
- Decorative images use empty alt text. Informative images need concise meaningful alt text.
- Respect `prefers-reduced-motion`.
- Do not rely on color alone to communicate state.

## Localization

- Maintain English and Spanish parity whenever shared content or a public flow changes.
- Run the parity check and review Spanish copy for meaning, not only key matching.
- Prices, legal notes, and evidence must describe the same facts in both languages.

## Required checks

Before reporting a website change complete:

1. Run `node --check` on every changed JavaScript module.
2. Parse every JSON and JSON-LD block that changed.
3. Serve the repository over HTTP and confirm all candidate routes and local assets return successfully.
4. Exercise the complete quote flow in English and Spanish, including back, restart, lowest scope, highest scope, and regional fallback behavior.
5. Confirm there are no browser console exceptions when browser testing is requested.
6. Verify keyboard navigation, focus visibility, reduced motion, and responsive layouts.
7. Review the diff for unapproved claims, credentials, client identifiers, placeholder prices, and accidental production changes.

When a future framework migration adds package scripts, completion must also run lint, typecheck, unit tests, end-to-end tests, and the production build.

## Production switch

The production switch requires a separate checklist and approval. At minimum it must address `noindex`, canonical URLs, relative links, form endpoints, analytics, redirects, regional pricing, structured data, cache behavior, and rollback.
