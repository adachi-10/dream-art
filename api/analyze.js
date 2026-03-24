import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is missing");
      return res.status(500).json({ error: "API key not configured" });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // ✅ ステップ1: 夢分析
    const analysisPrompt = `あなたは、夢分析の専門家です。以下の夢を深層心理学的観点から詳しく分析してください。

夢の内容：
${prompt}

分析の際は以下の観点から分析してください：
1. シンボルと象徴の意味
2. 潜在意識のメッセージ
3. 心理的状態の反映
4. 今後のアドバイス

詳細で洞察に満ちた分析を提供してください。`;

    const analysisCompletion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert dream analyst with deep knowledge of Jungian psychology and dream interpretation.",
        },
        { role: "user", content: analysisPrompt },
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const analysis = analysisCompletion.choices[0].message.content;

    // ✅ ステップ2: キーワード抽出
    const extractionPrompt = `以下の夢分析結果から、「死」「生」「人」のいずれかの概念に関連するキーワードを抽出してください。

夢の内容：
${prompt}

分析結果：
${analysis}

指示：
1. 「死」「生」「人」のいずれかの概念に関連するものを抽出
2. JSON形式で返す
3. 見つからない場合は空配列で返す

JSON形式の例：
{
  "keywords": ["死", "生"],
  "reason": "抽出理由の説明"
}

必ずJSON形式のみで応答してください。`;

    const extractionCompletion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert in keyword extraction. Always respond with valid JSON only.",
        },
        { role: "user", content: extractionPrompt },
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    let keywords = [];
    let extractionReason = "";

    try {
      const extractionText = extractionCompletion.choices[0].message.content;
      // JSON抽出を試みる
      const jsonMatch = extractionText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        keywords = parsed.keywords || [];
        extractionReason = parsed.reason || "";
      }
    } catch (error) {
      console.warn("Failed to parse keyword extraction:", error.message);
      // フォールバック: テキストから手動で抽出
      const validKeywords = ["死", "生", "人"];
      keywords = validKeywords.filter((keyword) =>
        (prompt + analysis).includes(keyword)
      );
    }

    // ✅ ステップ3: レスポンス構築
    return res.status(200).json({
      analysis: analysis, // 分析結果 → DreamAnalyzer.jsxへ
      keywords: keywords, // キーワード → DreamModel.jsxへ
      extractionReason: extractionReason, // 抽出理由（デバッグ用）
    });
  } catch (error) {
    console.error("API Error:", error.message || error);
    return res.status(500).json({
      error: error.message || "Internal Server Error",
      details: process.env.NODE_ENV === "development" ? error.toString() : undefined,
    });
  }
}
