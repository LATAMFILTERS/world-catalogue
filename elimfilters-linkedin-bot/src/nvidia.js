import { SYSTEM_PROMPT, ELIMFILTERS_KNOWLEDGE } from "./knowledge.js";

export function createNvidiaClient({ apiKey, model }) {
  return {
    async generateReply(userMessage) {
      if (!apiKey) {
        return `Estimado contacto, gracias por escribir a ELIMFILTERS. Para consultar compatibilidad y números de parte, por favor use nuestro buscador oficial: https://part-search.elimfilters.com. Para solicitudes de distribución, visite https://elimfilters.com.`;
      }

      const prompt = `${SYSTEM_PROMPT}\n\n[CONOCIMIENTO BASE OFICIAL]:\n${ELIMFILTERS_KNOWLEDGE}\n\n[MENSAJE EN LINKEDIN]: "${userMessage}"\n\nResponde en español de manera ejecutiva y profesional:`;

      try {
        const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model || "nvidia/nemotron-3-super-120b-a12b",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            max_tokens: 300
          })
        });

        if (!res.ok) {
          throw new Error(`NVIDIA NIM API error status ${res.status}`);
        }

        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content?.trim();
        return reply || `Estimado contacto, gracias por su mensaje a ELIMFILTERS. Puede consultar nuestro catálogo en https://part-search.elimfilters.com.`;
      } catch (err) {
        console.error("[nvidia-nim]", err.message);
        return `Estimado contacto, gracias por su mensaje a ELIMFILTERS. Puede consultar nuestro catálogo en https://part-search.elimfilters.com.`;
      }
    }
  };
}
