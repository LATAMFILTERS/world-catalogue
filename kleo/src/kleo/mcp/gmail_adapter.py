from kleo.mcp.base import MCPAdapter


class GmailAdapter(MCPAdapter):
    name = "gmail"
    required_env_vars = ("GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET", "GOOGLE_OAUTH_REFRESH_TOKEN")
