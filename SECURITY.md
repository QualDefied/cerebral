# Security Policy

## Overview

Cerebral Finance prioritizes security through multiple layers of protection, following OWASP guidelines and implementing defense-in-depth strategies. This application is designed for local use only and does not expose data to external networks.

## Security Architecture

### 🔐 Application Security

- **Local-Only Operation**: The application runs entirely on localhost (127.0.0.1) with no external network exposure
- **Zero Trust Model**: All components operate under the principle of least privilege
- **Input Validation**: Comprehensive validation using Express Validator and Zod schemas
- **Type Safety**: Full TypeScript implementation prevents common injection vulnerabilities

### 🛡️ Backend Security Features

- **Helmet.js**: Sets security-related HTTP headers
- **CORS Protection**: Configured to only accept requests from localhost
- **Rate Limiting**: Express Rate Limit protection against abuse
- **Error Handling**: Secure error responses that don't leak sensitive information
- **Environment Variables**: Sensitive configuration kept in environment variables

### 🔒 Data Security

- **Optional Database**: Choose between in-memory storage (session-only) or persistent PostgreSQL
- **Prisma ORM**: Parameterized queries prevent SQL injection
- **Data Sanitization**: All user inputs are validated and sanitized
- **Session Management**: Secure session handling with automatic cleanup

### 🎯 Frontend Security

- **Content Security Policy**: Prevents XSS attacks through proper headers
- **Input Validation**: Client-side validation with React Hook Form and Zod
- **Secure Storage**: Sensitive data handled through secure local storage patterns
- **No External Dependencies**: Minimized attack surface through curated dependencies

## Supported Versions

We maintain security updates on the main branch. Use the latest commit when possible.

## Reporting a Vulnerability

### How to Report
- **GitHub Security Advisory**: Use the "Security" tab > "Advisories" > "Report a vulnerability"
- **Private Communication**: Do not create public issues for security vulnerabilities
- **Email**: Contact maintainers directly if needed

### What to Include
- Clear description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Affected versions or components
- Suggested remediation (if available)

## Responsible Disclosure

We follow a coordinated vulnerability disclosure process:

1. **Acknowledgment**: We will acknowledge receipt within 72 hours
2. **Investigation**: Security team investigates the reported issue
3. **Validation**: Confirm the vulnerability and assess impact
4. **Remediation**: Develop and test a fix
5. **Disclosure**: Public disclosure after fix is deployed
6. **Status Updates**: Regular updates provided throughout the process

## Development Security Practices

### Dependencies
- **Lockfiles**: All dependencies pinned via package-lock.json and lockfiles
- **Security Audits**: Regular npm audit checks
- **Vulnerability Scanning**: Automated scanning for known vulnerabilities
- **Dependency Updates**: Regular updates to address security patches

### Code Security
- **Static Analysis**: ESLint and TypeScript strict mode enabled
- **Security Headers**: Proper security headers configured
- **Input Validation**: Multi-layer validation on both client and server
- **Error Handling**: Secure error handling prevents information leakage

### Testing
- **Security Testing**: Regular security-focused testing
- **Penetration Testing**: Local security assessments
- **Dependency Scanning**: Automated vulnerability scanning in CI/CD

## Best Practices

### For Developers
- Never commit secrets or sensitive configuration
- Use environment variables for all configuration
- Follow the principle of least privilege
- Keep dependencies updated
- Run security scans before deployment

### For Users
- Keep Node.js and npm updated
- Use the application in local development only
- Regularly update the codebase from the main branch
- Monitor for security advisories
- Use strong, unique passwords for database access

## Security Monitoring

- Regular dependency vulnerability checks
- Code review for security implications
- Security headers validation
- Input validation testing
- Error handling verification

## Compliance

This application follows:
- OWASP Top 10 security guidelines
- Node.js security best practices
- React security recommendations
- Database security standards

## Emergency Contacts

For critical security issues requiring immediate attention, please use the GitHub Security Advisory system for the fastest response.


