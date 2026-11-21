/**
 * 悪魔狂信者タイプ診断 - 設定およびマスタデータ
 * 
 * 質問内容、パラメータ定義、回答選択肢、診断結果タイプとその判定条件、
 * およびシステム画像アセットの設定を管理します。
 */

// ==========================================================================
// 0. システム画像アセット設定 (タイトルロゴ、タブアイコン、ボタン画像など)
// 画像パス（例: "assets/images/title_logo.png"）を指定すると画像表示に切り替わります。
// 空文字 "" の場合は、テキストや標準の絵文字アイコンが表示されます。
// ボタン画像は通常時（defaultImg）とホバー時（hoverImg）で画像を切り替え可能です。
// ==========================================================================
const UI_ASSETS = {
  // システムタイトル (空文字ならテキスト「悪魔狂信者タイプ診断」)
  titleImage: "", // 例: "assets/images/title_logo.png"

  // ナビゲーションタブ
  tabs: {
    quiz: {
      icon: "",          // タブタイトルの横のアイコン画像 (例: "assets/images/tab_quiz_icon.png")
      buttonImg: "",      // タブボタン全体を画像にする場合 (例: "assets/images/tab_btn_quiz.png")
      buttonHoverImg: ""  // タブボタンのホバー時画像
    },
    tuning: {
      icon: "",          // 例: "assets/images/tab_tuning_icon.png"
      buttonImg: "",
      buttonHoverImg: ""
    },
    encyclopedia: {
      icon: "",          // 例: "assets/images/tab_encyclopedia_icon.png"
      buttonImg: "",
      buttonHoverImg: ""
    }
  },

  // 各種主要アクションボタン (通常時とホバー時で画像切り替え可能、デフォルトは原寸表示。width/height等の指定も可能)
  buttons: {
    // 狂信タイプ診断: 結果表示ボタン
    submitQuiz: {
      defaultImg: "",     // 例: "assets/images/btn_submit_quiz.png"
      hoverImg: ""        // 例: "assets/images/btn_submit_quiz_hover.png"
    },
    // オリ狂を作ろう: 召喚ボタン
    submitTuning: {
      defaultImg: "",     // 例: "assets/images/btn_submit_tuning.png"
      hoverImg: ""
    },
    // 結果画面: はじめからボタン
    retryQuiz: {
      defaultImg: "",     // 例: "assets/images/btn_retry.png"
      hoverImg: ""
    },
    // 結果画面: 図鑑で確認するボタン
    goEncyclopedia: {
      defaultImg: "",     // 例: "assets/images/btn_view_encyclopedia.png"
      hoverImg: ""
    },
    // TAP! リセットボタン
    tapReset: {
      defaultImg: "assets/button/TAP.png",     // 例: "assets/images/btn_tap_reset.png"
      hoverImg: "assets/button/TAP_hover.png"
    }
  },

  // ★狂信タイプ診断の選択肢 ＆ TAP確認モーダルボタン（うなずく／・・・）共通のボーダー画像設定 (border-image)
  choiceBorderImage: {
    source: "assets/button/option.png", // ボーダー画像パス（例: "assets/images/frame_border.png"）
    slice: "39",                              // スライスの設定（例: 16 または "16 fill"）
    width: "37px",                             // 枠線の太さ（例: "8px" または 8）
    repeat: "round",                          // repeat | round | stretch
    outset: "17px"                               // アウトセット
  }
};

// 1. 診断パラメータ定義 (各 0〜100)
// imageUrl に画像パス（例: "assets/images/param_faith.png"）を指定可能。
// 空文字 "" の場合は、自動で icon の絵文字が表示されます。
const PARAMETERS = {
  faith: {
    id: "faith",
    name: "悪魔への信仰度",
    description: "悪魔や深淵の存在に魂を捧げる覚悟と盲信の深さ",
    color: "#e63946",
    icon: "🩸",
    imageUrl: "" // 例: "assets/images/param_faith.png"
  },
  curiosity: {
    id: "curiosity",
    name: "好奇心",
    description: "未知の禁忌や隠された真実を知りたいという飽くなき欲求",
    color: "#a855f7",
    icon: "👁️",
    imageUrl: ""
  },
  happiness: {
    id: "happiness",
    name: "幸福度",
    description: "自身の現状や狂気的な境遇に対する満足感と高揚感",
    color: "#eab308",
    icon: "✨",
    imageUrl: ""
  },
  ethicsCollapse: {
    id: "ethicsCollapse",
    name: "倫理感の崩壊度",
    description: "世間の道徳や人道を平然と踏み越える異常性の度合い",
    color: "#6b7280",
    icon: "💀",
    imageUrl: ""
  },
  godAffection: {
    id: "godAffection",
    name: "奇跡の力を与えた神への好感度",
    description: "悪魔とは対極にある光や神聖なる存在に対する親愛・未練",
    color: "#38bdf8",
    icon: "🕊️",
    imageUrl: ""
  }
};

// 2. 回答の5段階定義と乗数 (係数)
const ANSWER_CHOICES = [
  { value: 1, label: "全く当てはまらない", multiplier: -1.0 },
  { value: 2, label: "あまり当てはまらない", multiplier: -0.5 },
  { value: 3, label: "どちらともいえない", multiplier: 0.0 },
  { value: 4, label: "やや当てはまる", multiplier: 0.5 },
  { value: 5, label: "よく当てはまる", multiplier: 1.0 }
];

// 3. 診断質問リスト (全16問)
// weights: 各質問の重要度 (この値 × 回答のmultiplier でパラメータが足し引きされます)
const QUESTIONS = [
  {
    id: 1,
    text: "禁じられた書物や封印された知識と聞くと、危険を冒してでも読みたくなる。",
    weights: { curiosity: 22, ethicsCollapse: 8 }
  },
  {
    id: 2,
    text: "崇高な目的のためであれば、多少の犠牲や裏切りはやむを得ないと思う。",
    weights: { ethicsCollapse: 25, faith: 10 }
  },
  {
    id: 3,
    text: "世界の理から外れた強大な闇の力に魅了され、自ら身を委ねたい衝動がある。",
    weights: { faith: 26, curiosity: 10 }
  },
  {
    id: 4,
    text: "たとえ周囲から狂人と呼ばれようと、自分の今の生き方にはとても満足している。",
    weights: { happiness: 24, faith: 8 }
  },
  {
    id: 5,
    text: "かつて自分を救ってくれた神や光の温もりを、今でも完全に憎み切ることはできない。",
    weights: { godAffection: 28, faith: -10 }
  },
  {
    id: 6,
    text: "誰かが苦痛に歪む表情や混沌とした破滅の光景に、密かな美しさを感じてしまう。",
    weights: { ethicsCollapse: 26, happiness: 10 }
  },
  {
    id: 7,
    text: "偉大なる主（悪魔）のためなら、自らの命や記憶さえも喜んで捧げる覚悟がある。",
    weights: { faith: 28, ethicsCollapse: 12 }
  },
  {
    id: 8,
    text: "神の定めた退屈な平和よりも、悪魔がもたらす激動と知的好奇心に満ちた世界を愛する。",
    weights: { curiosity: 20, faith: 15, godAffection: -15 }
  },
  {
    id: 9,
    text: "日々の儀式や契約の代償を払っている瞬間こそ、生きている実感を最も強く味わえる。",
    weights: { happiness: 22, faith: 14 }
  },
  {
    id: 10,
    text: "たとえ闇の魔術を行使していても、心のどこかで神の赦しや救済を求めている気がする。",
    weights: { godAffection: 25, ethicsCollapse: -12 }
  },
  {
    id: 11,
    text: "他人の感情や命の重みについて、最近は単なる数値や物質のように感じることが増えた。",
    weights: { ethicsCollapse: 24, curiosity: 12 }
  },
  {
    id: 12,
    text: "どれほど恐ろしい怪異や深淵の深さを目の当たりにしても、恐怖より探究心が勝ってしまう。",
    weights: { curiosity: 26, happiness: 10 }
  },
  {
    id: 13,
    text: "神と悪魔、どちらが真の勝者となろうが、自分に奇跡や恩恵をもたらす者を讃えたい。",
    weights: { godAffection: 18, faith: 12, happiness: 15 }
  },
  {
    id: 14,
    text: "自分は至高の幸福の中にあり、他者が哀れに見えて仕方がない。",
    weights: { happiness: 25, ethicsCollapse: 14 }
  },
  {
    id: 15,
    text: "魂を売ったことに一片の悔いもない。永遠の暗黒こそが私の真の安らぎである。",
    weights: { faith: 28, godAffection: -25, happiness: 15 }
  },
  {
    id: 16,
    text: "世界の滅びや終末の予兆を感じたとき、恐れよりも先に高揚感が湧き上がる。",
    weights: { faith: 18, ethicsCollapse: 18, happiness: 12 }
  }
];

// 4. パラメータの5段階丸め込み基準 (0〜100 を 1〜5 の段階に丸める)
function getLevel(score) {
  if (score <= 20) return 1; // 極低 (E)
  if (score <= 40) return 2; // 低 (D)
  if (score <= 60) return 3; // 中 (C)
  if (score <= 80) return 4; // 高 (B)
  return 5;                  // 極高 (A/S)
}

const LEVEL_LABELS = {
  1: { text: "極低 (E)", badge: "E", stars: "★☆☆☆☆" },
  2: { text: "低 (D)", badge: "D", stars: "★★☆☆☆" },
  3: { text: "中 (C)", badge: "C", stars: "★★★☆☆" },
  4: { text: "高 (B)", badge: "B", stars: "★★★★☆" },
  5: { text: "極高 (A)", badge: "A", stars: "★★★★★" }
};

// 5段階レベルから内部スコア(0〜100)への変換定義 (オリ狂を作ろうモードで使用)
const LEVEL_TO_RAW_MAP = {
  1: 10, // 極低 (0〜20 の代表値)
  2: 30, // 低   (21〜40 の代表値)
  3: 50, // 中   (41〜60 の代表値)
  4: 70, // 高   (61〜80 の代表値)
  5: 95  // 極高 (81〜100 の代表値)
};

// 5. 各パラメータの段階別フレーバーテキスト (オリ狂を作ろうモード用)
const PARAM_FLAVOR_TEXTS = {
  faith: {
    1: "「悪魔など妄想か単なる道具。魂を捧げる気など毛頭ない。」",
    2: "「敬意は払うが、信仰と呼べるほどではない。常に距離を置く。」",
    3: "「主の力を認め畏怖を抱く。標準的な信徒としての敬虔さ。」",
    4: "「我が主の御意志こそ我が道。闇の深さに日々魅了されている。」",
    5: "「我が命、我が魂のすべてを主へ！ この身は主の器にして尖兵也！」"
  },
  curiosity: {
    1: "「知らぬが仏。禁忌の書など開く気も起きない、平穏が一番。」",
    2: "「怪異の存在は知っているが、自ら首を突っ込む気はない。」",
    3: "「多少の神秘には興味があるが、常識の範囲内で満足する。」",
    4: "「封印された知識や禁術の構造……知りたい、もっと触れたい。」",
    5: "「たとえ脳が沸騰しようと構わぬ！ 深淵の真理を暴き尽くすのだ！」"
  },
  happiness: {
    1: "「世界も我が身も呪わしい。生きていること自体が果てしない苦痛。」",
    2: "「日々に満ち足りたものはなく、重苦しい虚無が胸を満たしている。」",
    3: "「良くも悪くも平凡。日々の生活に小さな波風が立つ程度。」",
    4: "「悪魔との契約や今の狂気的な環境が、思いのほか心地よい。」",
    5: "「あはは！ 至高の歓喜！ 破滅も苦痛も甘美なる祝福に思える！」"
  },
  ethicsCollapse: {
    1: "「人としての道徳や他者の命を尊ぶ心は、絶対に手放したくない。」",
    2: "「世間の常識を重んじ、非人道的な行いには強い躊躇いを覚える。」",
    3: "「状況によっては多少の嘘もやむを得ないが、常識の範疇。」",
    4: "「大義や自らの欲望のためなら、他人の犠牲を平然と選べる。」",
    5: "「善悪など幻影に過ぎない。命も道徳も踏み躙るためにあるのだ。」"
  },
  godAffection: {
    1: "「神など滅びよ。光の偽善を見るだけで胸焼けと憎悪が込み上げる。」",
    2: "「かつての神への想いはとうに冷え切っており、未練もない。」",
    3: "「神も悪魔も等しく大いなる存在。どちらかに肩入れする気はない。」",
    4: "「悪魔の側に立ちながらも、あの温もりある光の奇跡を愛おしく思う。」",
    5: "「おお主なる神よ……！ 罪深き私を、どうかその慈愛で包み給え……！」"
  }
};

// 6. 診断結果マスタ定義 (全19タイプ)
// -------------------------------------------------------------
// 【checkCondition の引数について】
// checkCondition: (levels, raw, context) => boolean
// - levels: 各パラメータの5段階レベル (1〜5)
// - raw: 各パラメータの内部スコア (0〜100)
// - context: 判定コンテキスト情報
//     context.mode        : "quiz" (狂信タイプ診断) または "free_tuning" (オリ狂を作ろう)
//     context.isQuiz      : 狂信タイプ診断モードなら true
//     context.isTuning    : オリ狂を作ろうモードなら true
//     context.allNeutral  : 狂信タイプ診断ですべて「どちらとも言えない(3)」を選び続けた場合 true
//     context.isAllNeutral: 同上 (エイリアス)
//
// ★モード限定結果の作り方例:
//   // 狂信タイプ診断限定にしたい場合:
//   if (!context.isQuiz) return false;
//   // オリ狂を作ろう限定にしたい場合:
//   if (!context.isTuning) return false;
//   // 全問「どちらとも言えない」限定にしたい場合:
//   return context.isQuiz && context.allNeutral;
// -------------------------------------------------------------
const RESULT_TYPES = [
  {
    id: "absolute_observer",
    no: "01",
    name: "無色の絶対静観者",
    subtitle: "神仏も悪魔も等しく素通りする究極の中立",
    rarity: "UR",
    badgeColor: "#64748b",
    avatar: "👁️🪞",
    imageUrl: "",
    quote: "「神も悪魔も、善も悪も……私には等しく無意味。ただ世界を眺めているだけです。」",
    description: "狂信タイプ診断において、すべての問いに一度のブレもなく「どちらともいえない」を選び続けた者のみに顕現する特異体質。光と闇、快楽と破滅のあらゆる誘惑に一切心を動かされなかった、ある意味で最も狂気的な完全無色透明の魂です。",
    idealLevels: { faith: 3, curiosity: 3, happiness: 3, ethicsCollapse: 3, godAffection: 3 },
    hint: "狂信タイプ診断にて、すべての問いに『どちらともいえない』と答え続けよ。",
    priority: 150, // 最優先判定
    checkCondition: (levels, raw, context) => {
      // 狂信タイプ診断モード かつ 全問「どちらともいえない」を選択した場合のみ
      return context.isQuiz && context.allNeutral;
    }
  },
  {
    id: "void_martyr",
    no: "02",
    name: "虚無を統べる黒き殉教者",
    subtitle: "全てを灰に帰す終焉の導き手",
    rarity: "UR",
    badgeColor: "#450a0a",
    avatar: "👑🌑",
    imageUrl: "",
    quote: "「主よ、この世界に救いなど不要。すべてを等しく漆黒の無へと還しましょう。」",
    description: "極限の絶望と極限の信仰が融合した、終末を渇望する最高位の殉教者。己の苦痛すら主への賛美に変え、世界の完全な崩壊のみを求めて冷酷に深淵の魔術を紡ぎます。",
    idealLevels: { faith: 5, ethicsCollapse: 5, happiness: 1 },
    hint: "悪魔への信仰と倫理崩壊を極限まで高め、幸福度を徹底的に絶望へ落とせ。",
    priority: 110,
    checkCondition: (levels, raw, context) => {
      return levels.faith >= 5 && levels.ethicsCollapse >= 5 && levels.happiness <= 1;
    }
  },
  {
    id: "fanatic_apostle",
    no: "03",
    name: "深淵の筆頭使徒",
    subtitle: "狂気を纏いし混沌の体現者",
    rarity: "SSR",
    badgeColor: "#dc2626",
    avatar: "👑🩸",
    imageUrl: "",
    quote: "「ご覧ください我が主よ、この美しき奈落を……すべてを捧げ尽くしましょう！」",
    description: "悪魔への信仰と倫理の崩壊が極限に達した混沌の体現者。人間としての情動や道徳はとうに消え失せ、主の意志を地上に具現化することのみを至高の使命としています。",
    idealLevels: { faith: 5, ethicsCollapse: 5, godAffection: 1 },
    hint: "悪魔への信仰と倫理崩壊を最大値まで高め、神への好感を極限まで捨てるべし。",
    priority: 100,
    checkCondition: (levels, raw, context) => {
      return levels.faith >= 5 && levels.ethicsCollapse >= 4 && levels.godAffection <= 2;
    }
  },
  {
    id: "blissful_sacrifice",
    no: "04",
    name: "幸福なる生贄志願者",
    subtitle: "破滅に微笑む純粋無垢な狂信",
    rarity: "SSR",
    badgeColor: "#f59e0b",
    avatar: "🕯️✨",
    imageUrl: "",
    quote: "「私の命が主の糧となるのなら、これ以上の歓びがどこにあるでしょう？」",
    description: "自らが悪魔の生贄となることをこの上ない幸福と捉える狂信者。極めて高い幸福度と深い信仰心を持ち、死や苦痛すら祝福として受け入れます。",
    idealLevels: { faith: 5, happiness: 5, ethicsCollapse: 3 },
    hint: "悪魔への信仰と幸福度を最高潮まで引き上げよ。",
    priority: 95,
    checkCondition: (levels, raw, context) => {
      return levels.faith >= 4 && levels.happiness >= 5;
    }
  },
  {
    id: "zealot_inquisitor",
    no: "05",
    name: "奇跡渇望の狂信異端審問官",
    subtitle: "神の慈悲を悪魔の刃で求める狂気",
    rarity: "SSR",
    badgeColor: "#b91c1c",
    avatar: "⚖️🔥",
    imageUrl: "",
    quote: "「神よ、御覧あれ！ この異端の血を以て、あなたの奇跡を証明してみせましょう！」",
    description: "神を異常なまでに敬愛しながらも、手段として悪魔の拷問術と倫理なき断罪を振るう倒錯の使徒。光を求めるあまり闇に染まりきった危険極まりない存在です。",
    idealLevels: { godAffection: 5, ethicsCollapse: 5, faith: 3 },
    hint: "神への好感度と倫理崩壊度を両方とも最大値まで研ぎ澄ませ。",
    priority: 92,
    checkCondition: (levels, raw, context) => {
      return levels.godAffection >= 5 && levels.ethicsCollapse >= 4;
    }
  },
  {
    id: "forbidden_scholar",
    no: "06",
    name: "禁忌の怪異探求学者",
    subtitle: "知の深淵に魅入られた研究狂",
    rarity: "SR",
    badgeColor: "#8b5cf6",
    avatar: "📜👁️",
    imageUrl: "",
    quote: "「悪魔だろうと神だろうと構わない……私は世界の真理を解き明かしたいだけだ。」",
    description: "信仰そのものよりも、未知なるオカルトや深淵の法則を解明することに憑りつかれた狂学者。倫理観を置き去りにし、自らをも実験台にして深淵を記録し続けます。",
    idealLevels: { curiosity: 5, ethicsCollapse: 4, faith: 3 },
    hint: "圧倒的な好奇心を持ち、倫理を置き去りにして知を探求せよ。",
    priority: 90,
    checkCondition: (levels, raw, context) => {
      return levels.curiosity >= 5 && levels.ethicsCollapse >= 3;
    }
  },
  {
    id: "double_agent",
    no: "07",
    name: "背徳のダブルエージェント",
    subtitle: "光と闇の狭間で揺れる境界人",
    rarity: "SSR",
    badgeColor: "#06b6d4",
    avatar: "⚖️🌓",
    imageUrl: "",
    quote: "「悪魔の力も神の奇跡も、要は使い手次第……どちらの顔も捨てられませんね。」",
    description: "悪魔に魂を売り渡しながらも、神への好意や奇跡への執着を捨てきれずにいる特異な狂信者。光と闇の両派閥から力を引き出し、自らの思惑のために綱渡りを続けます。",
    idealLevels: { faith: 4, godAffection: 4 },
    hint: "悪魔への信仰と神への好感度を両方とも高く保つべし。",
    priority: 85,
    checkCondition: (levels, raw, context) => {
      return levels.faith >= 4 && levels.godAffection >= 4;
    }
  },
  {
    id: "mad_carnival_jester",
    no: "08",
    name: "狂乱の宴の道化師",
    subtitle: "破滅の輪舞曲を奏でる怪奇の道化",
    rarity: "SR",
    badgeColor: "#d946ef",
    avatar: "🃏🎪",
    imageUrl: "",
    quote: "「踊れ踊れ、破滅のサーカスだ！ 死ぬ瞬間が一番笑えると思わないかい？」",
    description: "高い好奇心と幸福度、崩壊した倫理観を併せ持つトリックスター。悪魔の恐るべき黒ミサすら壮大なコメディとして笑い飛ばし、周囲を狂乱の渦へと巻き込みます。",
    idealLevels: { curiosity: 5, happiness: 5, ethicsCollapse: 4 },
    hint: "好奇心と幸福度を最大まで高め、倫理を投げ捨てて笑い狂え。",
    priority: 83,
    checkCondition: (levels, raw, context) => {
      return levels.curiosity >= 4 && levels.happiness >= 4 && levels.ethicsCollapse >= 3;
    }
  },
  {
    id: "hedonist_heretic",
    no: "09",
    name: "快楽主義の背教者",
    subtitle: "欲望のままに踊る享楽の使徒",
    rarity: "SR",
    badgeColor: "#ec4899",
    avatar: "🍷🎭",
    imageUrl: "",
    quote: "「敬虔な祈りなど退屈なだけ。悪魔様のおかげで今日も最高に楽しいよ！」",
    description: "教義には興味がなく、契約によって得られる快楽や刺激を貪り尽くす享楽派。倫理は完全に崩壊していますが、幸福度は常に高く、宴を続けます。",
    idealLevels: { happiness: 5, ethicsCollapse: 5, faith: 2 },
    hint: "信仰心は控えめに、幸福度と倫理崩壊度を最大まで高めよ。",
    priority: 80,
    checkCondition: (levels, raw, context) => {
      return levels.happiness >= 4 && levels.ethicsCollapse >= 4 && levels.faith <= 3;
    }
  },
  {
    id: "innocent_abyss_child",
    no: "10",
    name: "無垢なる深淵の寵児",
    subtitle: "悪意なき無邪気さで悪魔と戯れる者",
    rarity: "SR",
    badgeColor: "#38bdf8",
    avatar: "🧸🩸",
    imageUrl: "",
    quote: "「悪魔さん、今日もあそぼ！ え？ 生贄？ よくわからないけど楽しいね！」",
    description: "倫理観は無垢なまま、極めて高い幸福度と好奇心で悪魔と友達感覚で接する特異な存在。その濁りなき純真さゆえに、悪魔からもペットのように可愛がられています。",
    idealLevels: { happiness: 5, curiosity: 4, ethicsCollapse: 1 },
    hint: "幸福度と好奇心を高く保ちつつ、倫理崩壊度は極限まで低く保て。",
    priority: 78,
    checkCondition: (levels, raw, context) => {
      return levels.happiness >= 4 && levels.curiosity >= 4 && levels.ethicsCollapse <= 2;
    }
  },
  {
    id: "saintly_cultist",
    no: "11",
    name: "敬虔なる純白の狂信徒",
    subtitle: "悪魔を『唯一神』と信じ込む聖者",
    rarity: "SR",
    badgeColor: "#10b981",
    avatar: "🕊️🖤",
    imageUrl: "",
    quote: "「皆様、悪魔様はこんなにもお優しいのです。さあ、共に救われましょう。」",
    description: "倫理観を健全に保ったまま悪魔を心から崇拝している異常な信徒。悪魔の教えこそが人々を救う絶対の愛だと無邪気に信じ込んでいます。",
    idealLevels: { faith: 5, ethicsCollapse: 1, happiness: 4 },
    hint: "悪魔への信仰を極限まで高めつつ、倫理崩壊度を低く保つべし。",
    priority: 75,
    checkCondition: (levels, raw, context) => {
      return levels.faith >= 4 && levels.ethicsCollapse <= 2;
    }
  },
  {
    id: "despairing_nihilist",
    no: "12",
    name: "絶望の破滅願望者",
    subtitle: "無に帰することを希求する亡霊",
    rarity: "SR",
    badgeColor: "#4b5563",
    avatar: "🕳️🌧️",
    imageUrl: "",
    quote: "「世界も、私も、神も悪魔も……すべて等しく灰になればいい。」",
    description: "幸福度が極端に低く、すべてに絶望した末に悪魔の門を叩いた狂信者。自らと世界を消滅させる手段として深淵の力を求めます。",
    idealLevels: { happiness: 1, ethicsCollapse: 4, faith: 3 },
    hint: "幸福度を極限まで下げ、荒んだ倫理観を持て。",
    priority: 70,
    checkCondition: (levels, raw, context) => {
      return levels.happiness <= 2 && levels.ethicsCollapse >= 3;
    }
  },
  {
    id: "nostalgic_penitent",
    no: "13",
    name: "郷愁の悔悛者",
    subtitle: "後悔に苛まれながら跪く哀しき信者",
    rarity: "R",
    badgeColor: "#3b82f6",
    avatar: "💧⛓️",
    imageUrl: "",
    quote: "「神よ……なぜあの時、私を救ってくださらなかったのですか……。」",
    description: "悪魔と契約した過去を激しく悔やみ、今なおかつての神の光を恋い焦がれる信徒。心の底では常に奇跡の神の赦しを待ち望んでいます。",
    idealLevels: { godAffection: 5, faith: 2, happiness: 2 },
    hint: "神への好感度を高く保ちつつ、信仰度や幸福度は抑えめにせよ。",
    priority: 65,
    checkCondition: (levels, raw, context) => {
      return levels.godAffection >= 4 && levels.faith <= 3;
    }
  },
  {
    id: "unyielding_survivor",
    no: "14",
    name: "不屈の反骨サバイバー",
    subtitle: "悪魔すら利用して生き延びる強欲の徒",
    rarity: "R",
    badgeColor: "#ea580c",
    avatar: "🐺🗡️",
    imageUrl: "",
    quote: "「信仰だの神の愛だの知るか。私は悪魔の力を使ってでも生き残るだけだ！」",
    description: "信仰心など微塵もなく、ただ自らの生存と利益のために悪魔の力を騙し取る野良狂信者。狡猾な倫理崩壊と強い生存本能を武器に地獄を渡り歩きます。",
    idealLevels: { faith: 1, ethicsCollapse: 4, curiosity: 3 },
    hint: "悪魔への信仰を捨て去り、倫理を崩壊させて生存を希求せよ。",
    priority: 63,
    checkCondition: (levels, raw, context) => {
      return levels.faith <= 2 && levels.ethicsCollapse >= 4 && levels.godAffection <= 2;
    }
  },
  {
    id: "cold_executioner",
    no: "15",
    name: "冷血なる断罪の執行人",
    subtitle: "感情を削ぎ落とした深淵の刃",
    rarity: "R",
    badgeColor: "#991b1b",
    avatar: "⚔️🩸",
    imageUrl: "",
    quote: "「主の仰せの通りに。対象を排除します。それ以外の感情は不要です。」",
    description: "好奇心や幸福感といった人間的感情を完全に削ぎ落とし、冷徹に主の命を実行する戦闘型狂信者。粛清を淡々とこなします。",
    idealLevels: { ethicsCollapse: 4, faith: 4, curiosity: 1 },
    hint: "倫理を捨て去り、好奇心や迷いを持たずに忠誠を示せ。",
    priority: 60,
    checkCondition: (levels, raw, context) => {
      return levels.ethicsCollapse >= 4 && levels.faith >= 3 && levels.curiosity <= 2;
    }
  },
  {
    id: "contract_lawyer",
    no: "16",
    name: "契約書偏執の法務狂信者",
    subtitle: "一字一句の隙を突く地獄の交渉人",
    rarity: "R",
    badgeColor: "#0284c7",
    avatar: "🖋️📜",
    imageUrl: "",
    quote: "「第34条第2項の解釈によれば、私の魂の引き渡しは100年先まで猶予可能です。」",
    description: "悪魔との契約書の抜け穴を研究し尽くし、リスクを最小限に抑えながら恩恵を引き出そうとする超理知派狂信者。悪魔側も手を焼く法律オタクです。",
    idealLevels: { curiosity: 4, faith: 2, ethicsCollapse: 2 },
    hint: "好奇心を高め、信仰度や神への好感度を中庸に保ちつつ冷静でいろ。",
    priority: 57,
    checkCondition: (levels, raw, context) => {
      return levels.curiosity >= 4 && levels.ethicsCollapse <= 3 && levels.faith <= 3 && levels.godAffection >= 3;
    }
  },
  {
    id: "chaos_dabbler",
    no: "17",
    name: "好奇のオカルトフリーク",
    subtitle: "スリルを愛する軽薄な契約者",
    rarity: "R",
    badgeColor: "#14b8a6",
    avatar: "🔮🃏",
    imageUrl: "",
    quote: "「へえ、これが悪魔召喚の陣？ 意外と簡単じゃん！ 面白くなってきた！」",
    description: "深い信仰や重い覚悟はなく、単なる刺激やオカルトブームの延長で悪魔と契約してしまった軽薄な信徒。危険な禁呪にも悪気なく手を出します。",
    idealLevels: { curiosity: 4, faith: 2, ethicsCollapse: 2 },
    hint: "好奇心を高めつつ、悪魔信仰や倫理崩壊は控えめに。",
    priority: 55,
    checkCondition: (levels, raw, context) => {
      return levels.curiosity >= 4 && levels.faith <= 3;
    }
  },
  {
    id: "devoted_acolyte",
    no: "18",
    name: "健気な見習い侍僧",
    subtitle: "主の教えを懸命に学ぶ生真面目信徒",
    rarity: "R",
    badgeColor: "#6366f1",
    avatar: "📖🕯️",
    imageUrl: "",
    quote: "「今日も儀式の準備を整えました！ 主のお役に立てるよう精進します！」",
    description: "悪魔教団に入信したばかりの素直な見習い。教団の異常性にまだ染まりきっておらず、生真面目に掃除や儀式の準備を行っています。",
    idealLevels: { faith: 4, ethicsCollapse: 2, godAffection: 3 },
    hint: "ある程度の信仰心を持ちながらも、極端な倫理崩壊には至らない状態。",
    priority: 50,
    checkCondition: (levels, raw, context) => {
      return levels.faith >= 3 && levels.ethicsCollapse <= 3;
    }
  },
  {
    id: "hedonist_drifter",
    no: "19",
    name: "のんきな迷い込み一般人",
    subtitle: "美味しい供物に惹かれて居座る居候",
    rarity: "N",
    badgeColor: "#64748b",
    avatar: "🍰🍞",
    imageUrl: "",
    quote: "「ここの集会、お菓子が美味しくて居心地いいんですよね……悪魔？ よく分かりません。」",
    description: "教団の炊き出しやお茶会に惹かれてなんとなく紛れ込み、居着いてしまった一般人。信仰心も倫理崩壊もほとんどなく、黒ミサの最中もパンをかじっています。あらゆる特化条件を満たさなかった場合の帰着点です。",
    idealLevels: { happiness: 3, faith: 3, ethicsCollapse: 3 },
    hint: "極端な偏りを持たずに過ごすべし（フォールバック）。",
    priority: 1, // 最低優先度 (フォールバック)
    checkCondition: (levels, raw, context) => {
      return true; // 常にマッチ
    }
  }
];
