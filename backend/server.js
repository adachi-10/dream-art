require('dotenv').config();

// 2. その後に中身を確認（デバッグ用）
console.log("API KEY exists:", !!process.env.OPENAI_API_KEY); 

const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 5000;

// ミドルウェア
app.use(cors());
app.use(express.json());

// 3. 環境変数が読み込まれた後にOpenAIを初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
require('dotenv').config({ path: __dirname + '/.env' });
// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 夢分析エンドポイント
app.post('/api/analyze', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: '夢の内容が必要です' });
    }

    console.log('Analyzing dream:', text);

   const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [
        {
          role: "system",
          content: "You are an expert psychologist specializing in dream analysis using Freudian and Jungian theories. Respond in Japanese. Provide a concise summary of 100-150 characters.",
        },
        {
          role: "user",
          content: `以下の夢をフロイト・ユング心理学の観点から分析してください：\n\n夢の内容：${text}\n\n分析結果と最も合致する単語（死、生、人、絶望の中から1-2個）を返してください。`,
        },
      ],
      temperature: 1, // gpt-4o系は1がデフォルトで推奨されることが多いです
      // max_tokens を max_completion_tokens に変更、もしくは一旦削除
      max_completion_tokens: 500, 
    });

    // 結果の受け取り（ここも重要！）
    const analysis = response.choices[0].message.content || "";
    
    const keywords = ['死', '生', '人',];
    const foundKeywords = keywords.filter(keyword => analysis.includes(keyword));

    res.json({
      summary: analysis.trim(),
      keywords: foundKeywords.length > 0 ? foundKeywords : ['人'],
      modelKey: foundKeywords[0] || '人',
    });

  } catch (error) {
    // ここでターミナル（Node.js側）に具体的なエラー内容が出ます
    console.error("OpenAI API ERROR:", error); 
    res.status(500).json({ 
      error: '分析処理に失敗しました',
      details: error.message 
    });
  }
});
// エラーハンドリング
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
  console.log(`✓ Analyze endpoint: POST http://localhost:${PORT}/api/analyze`);
});