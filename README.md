# 悪魔狂信者タイプ診断 (Devil Cultist Personality Quiz)

16問の質問への回答からパラメータを算出し、悪魔狂信者のタイプ（全19種類）を判定するWeb性格診断ゲームです。
診断結果の図鑑収集、オリ狂作成シミュレータ、LocalStorageによる個人ID・発見状況の永続化機能を備えています。

---

## 🌟 主な機能と特徴

| 機能 | 内容 |
|---|---|
| **🔮 狂信タイプ診断** | 全16問の質問に「よく当てはまる〜全く当てはまらない」の5段階で回答。回答を選択後、「次の質問へ」ボタンを押下して自分のペースで進みます。 |
| **⚖️ 5段階丸め込み＆条件判定** | 算出された0〜100の各パラメータを5段階（E〜A）に丸め込み、優先度付きルールに基づいて**全19種類の狂信者タイプ**から判定します。 |
| **🎛️ オリ狂を作ろう** | 5つのパラメータを**5段階（1〜5）スライダー**で選択。スライダー変更に合わせて**各段階のフレーバーテキストがリアルタイムに切り替わります**。内部的には100段階スコア（10, 30, 50, 70, 95pt）にマッピングされ判定されます。 |
| **🔄 「はじめから」モード連動遷移** | 結果画面の「はじめから」ボタン押下時、**狂信タイプ診断モードなら赤フェード演出付きで第1問へ**、**オリ狂を作ろうモードなら演出なしで即座にオリ狂画面へ遷移（調整したパラメータはリセットされず維持）**します。 |
| **🏷️ モード判別＆全問「どちらとも言えない」判定フラグ** | 判定関数 `checkCondition` 内で、現在「狂信タイプ診断」か「オリ狂を作ろう」かを判別でき、モード限定結果を作成可能。さらに**全問「どちらとも言えない」を選び続けた時のみ出現する専用タイプ（No.01 無色の絶対静観者）**も実装されています。 |
| **📖 狂信者図鑑** | 「狂信タイプ診断」「オリ狂を作ろう」のどちらでも、結果表示ボタン押下時に新タイプが図鑑に登録・解放されます（全19種）。未発見タイプはシルエットとヒントで表示されます。 |
| **💀 TAP！リセットモーダル＆微震え演出** | 図鑑画面下部の「TAP！」ボタンを押すと、専用モーダル『すべてを終わらせる？(図鑑データが完全に削除されます。)』が表示。OKボタンは赤色の「うなずく」、キャンセルは「…」。モーダルを閉じるかリセットするまでTAP！ボタンは震え続けます。「うなずく」押下時は赤フラッシュ→黒フェードを経て図鑑データを全初期化します。 |
| **🖼️ 画像アイコン対応（結果・パラメータ）** | 狂信者タイプだけでなく、**各パラメータのアイコンについても画像表示が可能**です（画像未設定時は自動で絵文字が表示されます）。 |
| **🎨 ダイヤ柄＆マットデザイン** | グラデーションや通常時の影を排した重厚なマットデザイン。背景には幾何学的なダイヤ柄（円型ドットの隙間によるキラキラダイヤ）があしらわれ、**ボタンへのホバーやクリック時に赤く妖しく発光**します。 |
| **💾 LocalStorage保存** | 初回アクセス時にUUID形式の個人ID（`usr_...`）を自動発行・内部保持。個人の図鑑発見状況や診断履歴をブラウザ内に永続化します。 |

---

## 📁 ファイル構成

```text
devil-cultist-quiz/
├── index.html     # メイン画面（狂信タイプ診断、結果、オリ狂を作ろう、図鑑、詳細モーダル）
├── style.css      # ダイヤ柄・マット・赤発光のダークテーマCSS（レスポンシブ）
├── data.js        # 質問データ(16問)、パラメータ定義、診断結果マスタ(19種)、フレーバーテキスト
├── storage.js     # LocalStorage管理（個人ID、図鑑アンロック、履歴、ローカル統計集計）
├── app.js         # アプリケーションロジック（算出計算、丸め込み、画面遷移、図鑑登録）
├── assets/
│   └── images/    # 透過PNG画像等の配置ディレクトリ（任意）
└── README.md      # 本ドキュメント
```

---

## ⚙️ 判定条件ロジックのカスタマイズ（モード判別フラグ & 全問中立フラグ）

[`data.js`](file:///C:/Users/mi200/.gemini/antigravity/scratch/devil-cultist-quiz/data.js) 内の各結果タイプの `checkCondition: (levels, raw, context) => boolean` で条件を指定します。

### 第3引数 `context` で利用できるフラグ一覧
- `context.mode`: 現在の診断モード文字列（`"quiz"` または `"free_tuning"`）
- `context.isQuiz`: **狂信タイプ診断モード**なら `true`
- `context.isTuning`: **オリ狂を作ろうモード**なら `true`
- `context.allNeutral`: 狂信タイプ診断で全16問すべて「どちらともいえない（value: 3）」を選択し続けた場合のみ `true`（1問でもそれ以外を選んだら `false`）

### 判定ルールの記述例

#### 1. 狂信タイプ診断モード限定の結果を作りたい場合
```javascript
checkCondition: (levels, raw, context) => {
  if (!context.isQuiz) return false; // 狂信タイプ診断でなければ除外
  return levels.faith >= 5 && levels.ethicsCollapse >= 4;
}
```

#### 2. オリ狂を作ろうモード限定の結果を作りたい場合
```javascript
checkCondition: (levels, raw, context) => {
  if (!context.isTuning) return false; // オリ狂を作ろうでなければ除外
  return levels.happiness >= 5 && levels.curiosity >= 5;
}
```

#### 3. 全問「どちらとも言えない」を選択した場合のみの結果（実装済み: No.01 無色の絶対静観者）
```javascript
checkCondition: (levels, raw, context) => {
  // 狂信タイプ診断 かつ 全て「どちらとも言えない」を選び続けた場合のみ
  return context.isQuiz && context.allNeutral;
}
```

---

## 🖼️ 画像の設定方法（タイプアイコン ＆ パラメータアイコン）

後からイラストや透過PNG画像を用意した場合、[`data.js`](file:///C:/Users/mi200/.gemini/antigravity/scratch/devil-cultist-quiz/data.js) 内の `imageUrl` に画像パスを指定するだけで自動的に画像表示へ切り替わります。

### 1. 狂信者タイプアイコン
```javascript
{
  id: "fanatic_apostle",
  name: "深淵の筆頭使徒",
  avatar: "👑🩸", // 画像未設定・読込失敗時のフォールバック
  imageUrl: "assets/images/fanatic_apostle.png", // ← 透過PNGのパス
  // ...
}
```

### 2. パラメータアイコン
```javascript
const PARAMETERS = {
  faith: {
    id: "faith",
    name: "悪魔への信仰度",
    icon: "🩸", // 画像未設定時のフォールバック
    imageUrl: "assets/images/param_faith.png", // ← 画像パスを指定可能！
    // ...
  },
  // ...
};
```

### 3. ボタン画像（通常・ホバー・原寸表示）
[`data.js`](file:///C:/Users/mi200/.gemini/antigravity/scratch/devil-cultist-quiz/data.js) の `UI_ASSETS.buttons` で画像パスを設定すると、ボタンが**画像の原寸（オリジナルサイズ）**でそのまま表示されます。
```javascript
buttons: {
  tapReset: {
    defaultImg: "assets/button/TAP.png",       // 通常時画像（原寸表示）
    hoverImg: "assets/button/TAP_hover.png",   // ホバー時・震え維持時画像
    // width: 210, // 必要に応じて明示的なサイズ指定も可能（未指定時は原寸）
  }
}
```

### 4. 共通ボーダー画像（border-image: 選択肢 ＆ TAPモーダルボタン）
狂信タイプ診断モードの**5つの選択肢ボタン**と、TAP確認モーダルの**「うなずく」「・・・」ボタン**は、**すべて同じ画像を参照する共通の `border-image` 設定**が適用されています。

[`data.js`](file:///C:/Users/mi200/.gemini/antigravity/scratch/devil-cultist-quiz/data.js) の `UI_ASSETS.choiceBorderImage`（または [`style.css`](file:///C:/Users/mi200/.gemini/antigravity/scratch/devil-cultist-quiz/style.css) の `--common-border-image-*`）から画像パスやスライスを自由に変更できます。
```javascript
choiceBorderImage: {
  source: "assets/images/frame_border.png", // ボーダー画像のパス
  slice: "16",                              // 9スライスの分割幅（例: 16 または "16 fill"）
  width: "8px",                             // 枠線の太さ
  repeat: "round",                          // repeat | round | stretch
  outset: "0"                               // 外側への拡張幅
}
```
※画像を差し替えるだけで、5つの選択肢とTAP確認モーダルの両ボタンすべての枠線が自動的に連動して切り替わります。

---

## 🎛️ 「オリ狂を作ろう」とフレーバーテキスト

オリ狂を作ろうモードでは、5段階（1〜5）の各段階に応じて、信徒の心情や狂気度を表すセリフ（フレーバーテキスト）が表示されます。

- **段階 1 (極低 / E)**: 反抗・拒絶・平穏
- **段階 2 (低 / D)**: 慎重・常識・距離感
- **段階 3 (中 / C)**: 一般的・標準的・中庸
- **段階 4 (高 / B)**: 傾倒・探求・共鳴
- **段階 5 (極高 / A)**: 狂乱・極限・完全服従

フレーバーテキストの内容は [`data.js`](file:///C:/Users/mi200/.gemini/antigravity/scratch/devil-cultist-quiz/data.js) の `PARAM_FLAVOR_TEXTS` で自由に書き換えられます。

---

## 🔍 開発者・制作者用コンソールコマンド

ブラウザの開発者ツール（F12キー）の「コンソール（Console）」から以下のコマンドで確認・操作できます。

- `__DEVIL_STATS__.getUserId()` : 内部保持されている個人IDを確認
- `__DEVIL_STATS__.getStats()` : 診断回数や全19タイプの出現比率などの集計データを閲覧
- `__DEVIL_STATS__.unlockAll()` : テスト用に全図鑑タイプ（19種）を一括解放
- `__DEVIL_STATS__.resetData()` : 図鑑データや履歴をリセット
