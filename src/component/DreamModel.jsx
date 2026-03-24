import { useState, useEffect } from "react";
import "../styles/DreamModel.css";

// ✅ キーワードと3Dモデル情報のマッピング
const KEYWORD_MODEL_MAP = {
  死: {
    name: "死",
    description: "変化と終わりを象徴するモデル",
    color: "#1a1a1a",
    icon: "💀",
  },
  生: {
    name: "生",
    description: "成長と誕生を象徴するモデル",
    color: "#00cc00",
    icon: "🌱",
  },
  人: {
    name: "人",
    description: "人間関係と自己を象徴するモデル",
    color: "#0066cc",
    icon: "👤",
  },
};

export default function DreamModel({ keywords = [], onModelComplete }) {
  const [models, setModels] = useState([]);
  const [selectedKeyword, setSelectedKeyword] = useState(null);

  // ✅ キーワードを受け取ってモデルを生成
  useEffect(() => {
    if (!keywords || keywords.length === 0) {
      setModels([]);
      setSelectedKeyword(null);
      return;
    }

    // ✅ 有効なキーワードのみをフィルタリング
    const validModels = keywords
      .filter((keyword) => KEYWORD_MODEL_MAP[keyword])
      .map((keyword) => ({
        keyword,
        ...KEYWORD_MODEL_MAP[keyword],
        id: `model-${keyword}`,
      }));

    setModels(validModels);

    // 最初のキーワードを選択
    if (validModels.length > 0) {
      setSelectedKeyword(validModels[0].keyword);
    }

    // ✅ 親コンポーネントに完成したモデルデータを返す
    if (onModelComplete) {
      onModelComplete({
        models: validModels,
        selectedKeyword: validModels.length > 0 ? validModels[0].keyword : null,
        totalCount: validModels.length,
        timestamp: new Date(),
      });
    }
  }, [keywords, onModelComplete]);

  if (models.length === 0) {
    return null;
  }

  const selectedModel = KEYWORD_MODEL_MAP[selectedKeyword];

  return (
    <div className="dream-model-container">
      <h3>🎨 抽出されたテーマモデル</h3>

      {/* キーワード選択ボタン */}
      <div className="models-grid">
        {models.map((model) => (
          <button
            key={model.id}
            className={`model-card ${
              selectedKeyword === model.keyword ? "active" : ""
            }`}
            onClick={() => setSelectedKeyword(model.keyword)}
            style={{
              borderColor: model.color,
              backgroundColor:
                selectedKeyword === model.keyword
                  ? model.color
                  : "transparent",
            }}
          >
            <div className="model-icon">{model.icon}</div>
            <h4>{model.name}</h4>
            <p className="model-description">{model.description}</p>
          </button>
        ))}
      </div>

      {/* 選択されたモデルの詳細表示 */}
      {selectedModel && (
        <div className="model-detail">
          <div className="model-detail-header">
            <h4>
              {selectedModel.icon} {selectedModel.name}
            </h4>
          </div>

          {/* 3Dモデルビューアープレースホルダー */}
          <div className="model-viewer">
            <div className="model-placeholder">
              <div className="placeholder-icon">{selectedModel.icon}</div>
              <p className="placeholder-text">{selectedModel.name}</p>
              <p className="placeholder-desc">{selectedModel.description}</p>
              <p className="placeholder-note">
                ※ 後で3DモデルURL（.gltf/.glb）を設定します
              </p>
            </div>
          </div>

          <div className="model-info">
            <p>
              <strong>🏷️ テーマ:</strong> {selectedModel.name}
            </p>
            <p>
              <strong>📝 説明:</strong> {selectedModel.description}
            </p>
            <p>
              <strong>🎨 識別色:</strong>
              <span
                className="color-swatch"
                style={{ backgroundColor: selectedModel.color }}
              ></span>
              {selectedModel.color}
            </p>
          </div>
        </div>
      )}

      <div className="model-count">
        <span className="count-badge">{models.length}</span> 個のテーマが抽出されました
      </div>
    </div>
  );
}