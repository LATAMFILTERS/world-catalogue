from kleo.mcp.base import MCPAdapter


class GitHubAdapter(MCPAdapter):
    name = "github"
    required_env_vars = ("GITHUB_TOKEN",)
