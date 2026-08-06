# Automatic protocol protection

The bot protocol is protected by GitHub Actions. No manual lock file, reviewer rotation, or open/close procedure is required.

Every pull request to `main` and every push to `main` runs syntax checks, protocol unit and regression tests, protocol E2E tests, and chatbot routing integration. The final required check is `Protocol Gate`.
