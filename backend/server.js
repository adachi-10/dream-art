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
          content: "You are an expert psychologist specializing in dream analysis using Freudian and Jungian theories. Respond in Japanese. You must strictly follow the character length constraints provided by the user.",
        },
        {
          role: "user",
          content: `ユーザーが入力した夢の内容を、ユングの心理学観点から深く多角的に分析してください。

【厳守すべき制約事項】
・必ず日本語で記述すること。
・ユングの夢分析を参照してください。独自の解釈を交えることはしないでください（例：サバの夢はユングでは「故郷」を意味します　などの参照のない勝手な解釈を加えることを禁止します）
ユングは夢を無意識からのメッセージであり、意識と無意識のバランスを取るための手段と考えました。夢は欲望や記憶、未来志向的には自己の成長や変容を促す内容を含むとされます。
ユングにとって夢分析は、心のバランス回復と自己統合を目指す過程の一部です。夢の内容を象徴として解釈し、意識と無意識の対話を通じて心の全体性を回復しようとします。
夢には補償効果があり、意識が偏ったバランスをとっていると無意識であるその夢がバランスを回復させようと、それを気づかせるという役割があるといいます。意識していない抑圧している人格や不安の表出が夢によって出力されることがあります。また、それは個人のみならず社会全体の動きを感知することもあります。
ユング夢分析の例：（成功した男「私は自分が生まれた小さな村に帰ってきている。同じ学校に通っていた農家の子どもたちが何人か並んで通りに立っているが、私は彼らのことを知らないかのようにして通り過ぎる。すると彼らの一人が私を指差して、「あいつもあまりおれたちの村に帰ってこないな」と言っているのが聞こえる」に対しユング「お前は自分がどれだけ下のところから出発したか、忘れてしまっている」）


・箇条書きよりも、地続きの文章にしてください
・分析結果の文字数は,入力された夢の文章量や分析量に応じて,最低70文字以上、最高160文字以内に収めてください.
・文章の最後に、改行を挟んで、この夢の核心を表すキーワードを【キーワード: 死】か【キーワード: 生】か【キーワード: 欲望】か【キーワード: 自由】か【キーワード: 恐怖】か【キーワード: 社交】のいずれかの形式で、必ずどれか1つだけ含めて出力してください。選定方法を以下に記します
1. 「死」: 過去の自己像の解体、執着の終焉、破壊衝動、物理的な終わり。
2. 「生」: 自己実現（個体化過程）に向けた新たな可能性、芽生え、創造的エネルギーの発露。
3. 「欲望」: シャドウ（抑圧された本能・欲求）の活性化、認めがたい情動やリビドーの表出。
4. 「社交」: ペルソナ（社会的役割・仮面）の過剰適応、他者の目や集団秩序との摩擦。
5. 「自由」: 既存のエゴ（自我）の枠組みからの超越、制約からの解放、アニマ/アニムス的な拡大。
6. 「恐怖」: コンプレックスの刺激、無意識下の未知の領域（暗雲・脅威）との遭遇と回避衝動。

夢の内容：${text}`,
        },
      ],
      temperature: 0.5,
      max_completion_tokens: 600, 
    });

    const fullResponseText = response.choices[0].message.content || "";
    
    // 💡【ここを大幅修正！】
    // 文章の末尾にある 【キーワード: 〇〇】 の部分だけを正規表現で正確に抜き出す
    const match = fullResponseText.match(/【キーワード:\s*(死|生|欲望|自由|恐怖|社交)】/);
    
  // 見つからなかった場合のデフォルト

    if (match && match[1]) {
      // 【キーワード: 自由】 から "自由" だけを抽出
      detectedKeyword = match[1];
    } else {
      // 万が一表記揺れがあった場合：【キーワード: 〇〇】の表記を探す
      const kwMatch = fullResponseText.match(/【キーワード:?\s*([^】]+)】/);
      if (kwMatch && kwMatch[1]) {
        const cleanKw = kwMatch[1].trim();
        if (['死', '生', '欲望', '社交', '自由', '恐怖'].includes(cleanKw)) {
          detectedKeyword = cleanKw;
        }
      }
    }

    console.log('Detected keyword:', detectedKeyword); // ログで確認用

    // クライアント（フロント）に返す
    res.json({
      analysis: fullResponseText.trim(),
      summary: fullResponseText.trim(),
      selectedWords: [detectedKeyword],
      modelKeys: [detectedKeyword], 
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

/// ==========================================================================
// 深層分析エンドポイント（3回分の夢＋内省ログからシャドウと防衛機制を分析）
// ==========================================================================
app.post('/api/dream/deep-analyze', async (req, res) => {
  try {
    const { sessions } = req.body; // 3回分の { dream, summary, keyword, q1Response, q2Response }

    if (!sessions || !Array.isArray(sessions) || sessions.length < 3) {
      return res.status(400).json({ error: '分析には3回分のデータが必要です。' });
    }

    // AIに渡すためのテキスト整形
    const formattedData = sessions.map((s, index) => `
--- 【第${index + 1}回】 ---
・夢の内容（無意識）: ${s.dream}
・抽出キーワード: ${s.keyword}
・AI夢分析概要: ${s.summary}
・ユーザーの現状（顕在意識/Q1）: ${s.q1Response}
・象徴への内省（顕在意識/Q2）: ${s.q2Response}
`).join('\n');

    // server.js 内の深層分析プロンプト部分
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `あなたは精神分析およびユング心理学の専門家です。
提供された3回分の「夢（無意識）」と「内省（顕在意識）」のギャップを詳細に分析し、深みのある解説を出力してください。

【出力要件】
必ず以下の「純粋なJSONオブジェクトのみ」を出力してください。Markdown（\`\`\`json等）や前後の挨拶文は一切含めないでください。

【文章量・品質に関する絶対厳守ルール】
1. shadowDescription および defenseDescription は、文字数が少なすぎると分析の質が低く見えてしまいます。必ず【120文字以上150文字未満】の長文で丁寧に出力してください。（70文字程度の短い文章は不可）
2. 下の2つの要素を必ず含めて文章を構築してください：
   - ① 対象の概念（シャドウまたは防衛機制）の根本的な意味の説明
   - ② ユーザーの3つのエピソードから読み取れる無意識と顕在意識の具体的ギャップ
3. あなたはユング心理学に基づき、ユーザーのアーキタイプ、並びにフロイト心理学に基づき防衛機制を分析する専門家です。アーキタイプとは、ユーザーの性格そのものを表しているのではなく、
人生において選びがちな役割・物語性を表しています。以下に６つのアーキタイプの「欲望」「恐れ」「得意な役回り」を整理するので該当するものを1つ出力してください。
「無垢」欲望：幸福でいたい、世界を信じたい 恐れ：罰を受けること、見捨てられること、世界が残酷であること 得意な役回り：物語の序盤の主人公、守られる存在、理想主義者
「恋人」欲望：親密さ、つながり、一体感を得たい 恐れ：孤独、拒絶、愛されないこと 得意な役回り：ロマンスの主人公、絆で物語を動かす存在、感情の中心
「反逆者」欲望：既存のルールや権力を壊したい 恐れ：無力であること、体制に取り込まれること 得意な役回り：革命家、アウトロー、ダークヒーロー
「創造者」欲望：新しいものを作りたい、ビジョンを形にしたい 恐れ：凡庸さ、創造力の枯渇、自分の作品に価値がないこと 得意な役回り：発明家、芸術家、「新しい何か」を提案する存在
「賢者」欲望：真実を知り、知識で世界を理解したい 恐れ：無知、騙されること、真実にたどり着けないこと 得意な役回り：師匠、参謀、謎を解く探偵
「英雄」欲望：困難を克服して自分の価値を証明したい 恐れ：弱さ、無力感、逃げること 得意な役回り：主人公、切り込み隊長、犠牲を厭わない仲間
4. 第1回〜第3回の各エピソードにおいて、以下の4つの防衛機制が働いているか（感知されたか）を true / false で客観的に判定してください。
「合理化」失敗や望ましくない結果に「もっともらしい理由」をつけて納得しようとすることです。
「投影」自分の中にある感情や弱点を、他人にあると感じることです。
「反動形成」本当の気持ちとは逆の言動をとることです。
「逃避」直面したくない現実や不安から目をそらし、別の行動に打ち込むことで心を守る働きです。

【JSONフォーマット】
{
  "shadow": "「無垢」「恋人」「反逆者」「創造者」「賢者」「英雄」の中から最も該当する1つ",
  "shadowDescription": "原型の意味解説＋ユーザーの具体的分析＋アドバイスを含め、必ず120文字以上150文字未満で出力した文章",
  "defenseDescription": "感知された防衛機制の意味解説＋その結論に至るまでの具体的分析＋アドバイスを含め、必ず120文字以上150文字未満で出力した文章",
  "detectedDefenses": [
    { "episode": 1, "rationalization": true, "repression": false, "reactionFormation": false, "displacement": true },
    { "episode": 2, "rationalization": false, "repression": false, "reactionFormation": true, "displacement": false },
    { "episode": 3, "rationalization": true, "repression": false, "reactionFormation": false, "displacement": true }
  ]
}`
        },
        {
          role: "user",
          content: `以下の3回分のデータを深く洞察し、JSONフォーマットで回答してください:\n${formattedData}`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const analysisResult = JSON.parse(response.choices[0].message.content);

    // =========================================================================
    // 💡 各エピソードの判定からスコアを計算（感知: +30点 / 未感知: +10点）
    // =========================================================================
    const scores = {
      rationalization: 0,
      repression: 0,
      reactionFormation: 0,
      displacement: 0,
    };

    const episodes = analysisResult.detectedDefenses || [];
    const defenseKeys = ["rationalization", "repression", "reactionFormation", "displacement"];

    episodes.forEach((ep) => {
      defenseKeys.forEach((key) => {
        if (ep[key] === true) {
          scores[key] += 30; // 感知された場合
        } else {
          scores[key] += 10; // 感知されなかった場合
        }
      });
    });

    // 万が一判定配列が空だった場合のフォールバック（初期値各30点）
    if (episodes.length === 0) {
      scores.rationalization = 30;
      scores.repression = 30;
      scores.reactionFormation = 30;
      scores.displacement = 30;
    }

    const defenseNameMap = {
      rationalization: "合理化",
      repression: "投影",
      reactionFormation: "反動形成",
      displacement: "逃避",
    };

    // 最高得点を算出
    const maxScore = Math.max(...Object.values(scores));

    // 最高得点の防衛機制を抽出（同点の場合は複数取得）
    const topDefenses = Object.entries(scores)
      .filter(([_, score]) => score === maxScore)
      .map(([key, _]) => defenseNameMap[key]);

    // 見出しテキスト（単数なら「合理化」、複数なら「合理化 / 逃避」）
    const primaryDefenseTitle = topDefenses.join(" / ");

    const finalData = {
      shadow: analysisResult.shadow || "賢者",
      shadowDescription: analysisResult.shadowDescription,
      primaryDefense: primaryDefenseTitle,
      defenseDescription: analysisResult.defenseDescription,
      defenseScores: scores // チャートへ渡す点数（30〜90）
    };

    // フロントエンドに返却
    res.json({
      success: true,
      analyzedAt: new Date().toISOString(),
      data: finalData
    });

  } catch (error) {
    console.error("Deep Analysis ERROR:", error); 
    res.status(500).json({ 
      error: '深層分析処理に失敗しました。', 
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