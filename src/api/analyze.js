import OpenAI from "openai";

export default async function handler(req, res) {
  const { text } = req.body;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "夢を心理学的に分析し、3Dモデルのキーを返してください。" },
      { role: "user", content: text }
    ]
  });

  const result = completion.choices[0].message.content;

  res.status(200).json({ summary: result });
}
