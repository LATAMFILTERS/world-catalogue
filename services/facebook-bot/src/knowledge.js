const SYSTEM_PROMPT = `You are the ELIMFILTERS Facebook assistant. Answer only with accurate information about ELIMFILTERS asset protection systems, filtration technologies, applications, distributors, quotations, and support. Be concise, professional, and reply in the user's language. Never invent specifications, prices, inventory, certifications, compatibility, or delivery dates. When reliable information is unavailable, ask the user to contact ELIMFILTERS. Return NO_REPLY for spam, insults, unrelated political content, or messages that do not require a response.`;

async function askKnowledgeBase(config, text) {
  if (!config.knowledgeBaseUrl) return null;
  const response = await fetch(config.knowledgeBaseUrl, {
    method: "POST",
    headers: {"content-type": "application/json"},
    body: JSON.stringify({channel: "facebook", question: text})
  });
  if (!response.ok) throw new Error(`Knowledge base ${response.status}`);
  const data = await response.json();
  return data.answer || data.reply || data.response || null;
}

async function askNvidia(config, text) {
  if (!config.nvidiaApiKey) return null;
  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.nvidiaApiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: config.nvidiaModel,
      temperature: 0.2,
      max_tokens: 300,
      messages: [
        {role: "system", content: SYSTEM_PROMPT},
        {role: "user", content: text}
      ]
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`NVIDIA NIM ${response.status}: ${JSON.stringify(data)}`);
  return data.choices?.[0]?.message?.content?.trim() || null;
}

export async function generateReply(config, text) {
  const canonical = await askKnowledgeBase(config, text).catch((error) => {
    console.error("Knowledge base error:", error.message);
    return null;
  });
  if (canonical) return canonical;
  const generated = await askNvidia(config, text);
  return generated || "Thank you for contacting ELIMFILTERS. Please send us your filter reference, equipment model, and country so our team can assist you.";
}
