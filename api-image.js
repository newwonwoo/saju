export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const KEY = process.env.REPLICATE_API_KEY;
  if (!KEY) return res.status(500).json({ error: "API 키 없음" });

  // ── GET: 폴링 ──────────────────────────────────────────
  if (req.method === "GET") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "id 필요" });

    const r = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { "Authorization": `Bearer ${KEY}` }
    });
    const data = await r.json();

    if (data.status === "succeeded") {
      return res.status(200).json({ status: "succeeded", url: data.output[0] });
    }
    if (data.status === "failed") {
      return res.status(500).json({ status: "failed", error: data.error || "실패" });
    }
    return res.status(200).json({ status: data.status });
  }

  // ── POST: 생성 시작 ────────────────────────────────────
  if (req.method === "POST") {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "prompt 필요" });

    const r = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${KEY}`,
        "Content-Type": "application/json",
        "Prefer": "wait"
      },
      body: JSON.stringify({
        input: {
          prompt,
          num_outputs: 1,
          aspect_ratio: "16:9",
          output_format: "webp",
          output_quality: 85
        }
      })
    });

    const data = await r.json();
    if (data.error) return res.status(500).json({ error: data.error });

    // wait 모드 — 바로 완료
    if (data.output && data.output[0]) {
      return res.status(200).json({ url: data.output[0] });
    }

    // 아직 처리 중 — id 반환해서 프론트가 폴링
    return res.status(200).json({ id: data.id, status: data.status });
  }

  return res.status(405).end();
}
