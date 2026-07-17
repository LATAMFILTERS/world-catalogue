from kleo.mcp.base import MCPAdapter


class GoogleCalendarAdapter(MCPAdapter):
    name = "gcalendar"
    required_env_vars = ("GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET", "GOOGLE_OAUTH_REFRESH_TOKEN")
