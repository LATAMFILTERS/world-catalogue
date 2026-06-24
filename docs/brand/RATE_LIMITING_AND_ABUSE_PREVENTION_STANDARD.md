# RATE_LIMITING_AND_ABUSE_PREVENTION_STANDARD

## Purpose

This document defines rate limiting, abuse prevention, anti-scraping, and platform protection standards.

The objective is to preserve platform availability, reduce abuse, and protect infrastructure costs.

---

# Core Principle

Legitimate users must have access.

Automated abuse must be restricted.

---

# Website Access

Public website:

No hard limit.

Cloudflare protection enabled.

---

# Part Search

Limits:

60 requests per minute

300 requests per hour

1000 requests per day

per IP address.

Response when exceeded:

HTTP 429

---

# AI Engine

Limits:

20 requests per minute

100 requests per hour

500 requests per day

per IP address.

Response when exceeded:

HTTP 429

---

# Contact Forms

Limits:

5 submissions per hour

per IP address.

---

# Distributor Applications

Limits:

3 submissions per day

per IP address.

---

# Authentication

Failed login attempts:

5 failures

?

15 minute lockout

---

20 failures

?

24 hour lockout

---

# Password Reset

Limits:

3 requests per hour

per account.

---

# API Protection

Public APIs:

Rate limited.

Private APIs:

Authentication required.

---

# Anti-Scraping Controls

Detection Signals:

- Sequential searches
- High request velocity
- Repetitive patterns
- Automated agents

Actions:

- Challenge
- Throttle
- Temporary block
- Permanent block

---

# Cloudflare Requirements

Enabled:

- WAF
- Bot Fight Mode
- Rate Limiting
- Managed Challenge
- DDoS Protection

---

# Monitoring

Track:

- Requests
- Failed Logins
- API Abuse
- AI Abuse
- Search Abuse

---

# Ban Policy

Temporary Ban:

1 hour

24 hours

7 days

depending on severity.

---

# Strategic Objective

Protect platform availability while maintaining a positive user experience.

---

# Governance Rule

Every public-facing system must implement rate limiting and abuse prevention controls.
