# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security vulnerabilities.

Instead, report privately via GitHub's [**Report a vulnerability**](https://github.com/ByHandi/tautree/security/advisories/new) (Security → Advisories), which opens a private channel with the maintainers.

Please include:

- A description of the vulnerability and its impact
- Steps to reproduce (or a proof of concept)
- Affected version / commit, and your environment if relevant

We'll acknowledge your report as soon as we can, keep you updated on the fix, and credit you in the release notes unless you'd prefer to stay anonymous.

## Supported versions

Tautree is pre-1.0 and moves fast. Security fixes are applied to the latest `main`. If you're self-hosting, keep your deployment up to date with `main`.

## Scope & hardening notes

Tautree is designed to be safe to self-host:

- **Privacy-friendly analytics** — no IP addresses, cookies, or user-agent fingerprints are stored.
- **User-generated content** — link thumbnails are validated and re-encoded server-side (SVG and non-images rejected); embed URLs are parsed and sanitized to an allowlist of providers.
- **Access control** — suspended users are hidden from all public paths (page, OG image, redirects).
- **Auth** — sessions are JWT-based via Auth.js; `AUTH_SECRET` must be a strong random value in production.

If you find a gap in any of the above, we want to hear about it.
