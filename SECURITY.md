# Security Policy

## Supported Versions

We maintain security updates on the main branch. Use the latest release when possible.

## Reporting a Vulnerability

- Please open a private security advisory via GitHub Security (Security > Advisories) or email the maintainers.
- Provide a clear description, steps to reproduce, and potential impact.
- Do not create public issues for vulnerabilities.

## Responsible Disclosure

We appreciate coordinated disclosure. We will acknowledge receipt within 72 hours and provide regular status updates until resolution.

## Best Practices in Repo

- Dependencies pinned via lockfiles
- CI builds for both `server` and `client`
- Secrets should never be committed; use environment variables or GitHub Actions secrets


