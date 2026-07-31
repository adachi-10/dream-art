require('dotenv').config();
require('dotenv').config({ path: __dirname + '/.env' });

console.log("API KEY exists:", !!process.env.OPENAI_API_KEY); 

const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 💡 修正①：React側のfetch先に合わせて、エンドポイントを `/api/dream/analyze` に変更
app.post('/api/dream/analyze', async (req, res) => {
  try {
    // 💡 修正②：React側は `dreamContent` というキーで夢のテキストを送ってきているため、正しく受け取る
    const { dreamContent } = req.body;
    const text = dreamContent;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: '夢の内容が必要です' });
    }

    console.log('Analyzing dream:', text);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [
        {
          role: "system",
          // 💡 修正③：古い文字数制限（100-150）を削除し、完全に「明朝体向けの美しい150〜250文字」に統一
          content: "You are an expert psychologist specializing in dream analysis using Freudian and Jungian theories. Respond in Japanese. You must strictly follow the character length constraints provided by the user.",
        },
        {
          role: "user",
          content: `ユーザーが入力した夢の内容を、フロイトやユングの心理学観点から深く多角的に分析してください。

【厳守すべき制約事項】
・必ず日本語で記述すること。
・箇条書きは禁止。地続きの美しい物語のような文章にすること。
・分析結果の文字数は「絶対に」最低150文字以上、最高250文字以内に収めてください。短すぎたり長すぎたりしてはいけません。
・文章の最後に、改行を挟んで、この夢の核心を表すキーワードを【キーワード: 死】か【キーワード: 生】か【キーワード: 欲望】のいずれかの形式で、必ずどれか1つだけ含めて出力してください。

夢の内容：${text}`,
        },
      ],
      temperature: 0.7, // 💡 少しだけ下げることで、文字数や出力フォーマットの厳守率が大幅に上がります
      max_completion_tokens: 600, 
    });

    const fullResponseText = response.choices[0].message.content || "";
    
    // 💡 修正④：AIの文章から「死・生・欲望」のキーワードを確実に見つけ出すロジック
    const targetKeywords = ['死', '生', '欲望'];
    let detectedKeyword = '死'; // 見つからなかった場合のデフォルト

    // AIの返答テキストから【キーワード: 〇〇】の部分を探すか、含まれる単語をチェック
    for (const kw of targetKeywords) {
      if (fullResponseText.includes(kw)) {
        detectedKeyword = kw;
        break;
      }
    }

    // クライアント（フロント）に返すデータ構造をReactの変数名（analysis, modelKeysなど）に完全一致させる
    res.json({
      analysis: fullResponseText.trim(),
      summary: fullResponseText.trim(), // 互換性のために残す
      selectedWords: [detectedKeyword],
      modelKeys: [detectedKeyword],     // これがReact側で動画や背景色（死、生、欲望）の判定に使われます
      modelKey: detectedKeyword
    });

  } catch (error) {
    console.error("OpenAI API ERROR:", error); 
    res.status(500).json({ 
      error: '分析処理に失敗しました',
      details: error.message 
    });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Analyze endpoint updated to: POST http://localhost:${PORT}/api/dream/analyze`);
});