app.post('/api/analyze', async (req, res) => {
  try {
    // "prompt" フィールドを受け取る
    const text = req.body.prompt || req.body.text;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: '夢の内容が必要です' });
    }

    console.log('Analyzing dream:', text);

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert psychologist specializing in dream analysis using Freudian and Jungian theories. Respond in Japanese. Provide a concise summary of 100-150 characters.',
        },
        {
          role: 'user',
          content: `以下の夢をフロイト・ユング心理学の観点から分析してください：\n\n夢の内容：${text}\n\n分析結果と最も合致する単語（死、生、人、絶望の中から1-2個）を返してください。`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const analysis = response.choices[0]?.message?.content || '';

    // 分析結果から単語を抽出
    const keywords = ['死', '生', '欲望'];
    const foundKeywords = keywords.filter(keyword => analysis.includes(keyword));

    res.json({
      summary: analysis.trim(),
      keywords: foundKeywords.length > 0 ? foundKeywords : ['人'],
      modelKey: foundKeywords[0] || '人',
    });
  } catch (error) {
    console.error('Dream analysis error:', error.message);
    res.status(500).json({ 
      error: '分析処理に失敗しました',
      details: error.message 
    });
  }
});
