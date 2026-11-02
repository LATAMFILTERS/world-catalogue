/* Public, read-only site navigation for browser agents. No CRM or privileged operations. */
(() => {
  if (!document.modelContext?.registerTool) return;
  const controller = new AbortController();
  const routes = Object.freeze({
    home: "/",
    knowledge_center: "/knowledge-center/",
    industries: "/industries/",
    llms: "/llms.txt"
  });
  const tool = {
    name: "elimfilters_open_public_resource",
    description: "Navigate this browser tab to a public ELIMFILTERS page (home, Knowledge Center, industries, or public AI guide). No private data or transactions.",
    inputSchema: {
      type: "object",
      properties: {
        resource: { type: "string", enum: Object.keys(routes), description: "Public ELIMFILTERS resource to open." }
      },
      required: ["resource"],
      additionalProperties: false
    },
    async execute({ resource }) {
      if (!Object.prototype.hasOwnProperty.call(routes, resource)) return { error: "Unsupported resource" };
      const url = new URL(routes[resource], window.location.origin);
      if (url.origin !== "https://elimfilters.com") return { error: "Unexpected origin" };
      window.location.assign(url.href);
      return { navigatedTo: url.href };
    }
  };
  Promise.resolve(document.modelContext.registerTool(tool, { signal: controller.signal }))
    .catch(() => { /* WebMCP is experimental; ordinary navigation remains available. */ });
  window.addEventListener("pagehide", () => controller.abort(), { once: true });
})();
