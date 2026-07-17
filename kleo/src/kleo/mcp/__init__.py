"""Modular MCP adapter layer. Each adapter describes how to reach one
external tool (GitHub, Gmail, Google Drive, Google Calendar, filesystem);
none of them embed credentials — those come only from environment
variables at call time."""
