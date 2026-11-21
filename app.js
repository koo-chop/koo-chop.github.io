/**
 * 悪魔狂信者タイプ診断 - メインアプリケーションロジック
 */

document.addEventListener("DOMContentLoaded", () => {
  // アプリケーション状態
  const state = {
    currentScreen: "quiz", // quiz, result, tuning, encyclopedia
    currentQuestionIndex: 0,
    answers: {}, // { [questionId]: choiceValue(1~5) }
    // 「どちらとも言えない(3)」を選択し続けている間は true、一度でもそれ以外を選んだら false
    allNeutral: true,
    // オリ狂を作ろう: ユーザー選択は5段階(1〜5)、内部計算時に LEVEL_TO_RAW_MAP で100段階に変換
    tuningLevels: {
      faith: 3,
      curiosity: 3,
      happiness: 3,
      ethicsCollapse: 3,
      godAffection: 3
    },
    latestResult: null,
    isLatestNewUnlock: false,
    filterEncyclopedia: "all" // all, unlocked, locked
  };

  // DOM要素
  const elements = {
    // ナビゲーション
    navQuiz: document.getElementById("nav-quiz"),
    navTuning: document.getElementById("nav-tuning"),
    navEncyclopedia: document.getElementById("nav-encyclopedia"),
    tabIconQuiz: document.getElementById("tab-icon-quiz"),
    tabIconTuning: document.getElementById("tab-icon-tuning"),
    tabIconEncyclopedia: document.getElementById("tab-icon-encyclopedia"),
    headerTitle: document.getElementById("header-title"),
    headerTitleText: document.getElementById("header-title-text"),
    
    // スクリーンコンテナ
    screens: {
      quiz: document.getElementById("screen-quiz"),
      result: document.getElementById("screen-result"),
      tuning: document.getElementById("screen-tuning"),
      encyclopedia: document.getElementById("screen-encyclopedia")
    },

    // 診断画面要素
    quizProgressText: document.getElementById("quiz-progress-text"),
    quizProgressBar: document.getElementById("quiz-progress-bar"),
    quizQuestionNo: document.getElementById("quiz-question-no"),
    quizQuestionText: document.getElementById("quiz-question-text"),
    quizChoicesContainer: document.getElementById("quiz-choices-container"),
    btnPrevQuestion: document.getElementById("btn-prev-question"),
    btnNextQuestion: document.getElementById("btn-next-question"),
    btnSubmitQuiz: document.getElementById("btn-submit-quiz"),

    // 結果画面要素
    resultNewBadge: document.getElementById("result-new-badge"),
    resultRarity: document.getElementById("result-rarity"),
    resultAvatar: document.getElementById("result-avatar"),
    resultName: document.getElementById("result-name"),
    resultSubtitle: document.getElementById("result-subtitle"),
    resultQuote: document.getElementById("result-quote"),
    resultDescription: document.getElementById("result-description"),
    resultParamsList: document.getElementById("result-params-list"),
    btnGoEncyclopediaFromResult: document.getElementById("btn-go-encyclopedia-from-result"),
    btnRetryQuiz: document.getElementById("btn-retry-quiz"),
    btnShareTwitter: document.getElementById("btn-share-twitter"),

    // オリ狂を作ろう (自由調整) 画面要素
    tuningSlidersContainer: document.getElementById("tuning-sliders-container"),
    btnSubmitTuning: document.getElementById("btn-submit-tuning"),

    // 図鑑画面要素
    encyclopediaRateText: document.getElementById("encyclopedia-rate-text"),
    encyclopediaProgressBar: document.getElementById("encyclopedia-progress-bar"),
    encyclopediaGrid: document.getElementById("encyclopedia-grid"),
    filterButtons: document.querySelectorAll(".encyclopedia-filter-btn"),

    // モーダル要素
    modalDetail: document.getElementById("modal-detail"),
    modalDetailBody: document.getElementById("modal-detail-body"),
    modalDetailClose: document.getElementById("modal-detail-close"),

    // リセット確認モーダル要素
    modalResetConfirm: document.getElementById("modal-reset-confirm"),
    btnResetCancel: document.getElementById("btn-reset-cancel"),
    btnResetConfirm: document.getElementById("btn-reset-confirm"),

    // トースト通知 & 全画面フェードオーバーレイ
    toastContainer: document.getElementById("toast-container"),
    fadeOverlay: document.getElementById("screen-fade-overlay"),

    // リセットボタン
    btnTapReset: document.getElementById("btn-tap-reset")
  };

  // ==========================================
  // アバター画像表示ヘルパー (PNG透過画像 & 絵文字フォールバック)
  // ==========================================
  function getAvatarHtml(type, extraClass = "") {
    if (type.imageUrl && type.imageUrl.trim() !== "") {
      return `
        <span class="avatar-wrapper ${extraClass}">
          <img src="${type.imageUrl}" alt="${type.name}" class="avatar-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';">
          <span class="avatar-fallback" style="display:none;">${type.avatar || '🔮'}</span>
        </span>
      `;
    }
    return `<span class="avatar-text ${extraClass}">${type.avatar || '🔮'}</span>`;
  }

  // ==========================================
  // パラメータアイコン表示ヘルパー (PNG画像 & 絵文字フォールバック)
  // ==========================================
  function getParamIconHtml(paramKey, extraClass = "") {
    const p = PARAMETERS[paramKey];
    if (!p) return "";
    if (p.imageUrl && p.imageUrl.trim() !== "") {
      return `
        <span class="param-icon-wrapper ${extraClass}">
          <img src="${p.imageUrl}" alt="${p.name}" class="param-icon-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
          <span class="param-icon-fallback" style="display:none;">${p.icon}</span>
        </span>
      `;
    }
    return `<span class="param-icon-text ${extraClass}">${p.icon}</span>`;
  }

  // ==========================================
  // システム画像アセット適用処理 (UI_ASSETS による画像差し替え & ホバー切り替え)
  // ==========================================
  function applyUIAssets() {
    if (typeof UI_ASSETS === "undefined") return;

    // 1. システムタイトルロゴ
    if (UI_ASSETS.titleImage && UI_ASSETS.titleImage.trim() !== "" && elements.headerTitle) {
      elements.headerTitle.innerHTML = `<img src="${UI_ASSETS.titleImage}" alt="悪魔狂信者タイプ診断" class="header-title-img">`;
    }

    // 2. タブアイコン
    const tabConfigs = [
      { el: elements.tabIconQuiz, cfg: UI_ASSETS.tabs?.quiz },
      { el: elements.tabIconTuning, cfg: UI_ASSETS.tabs?.tuning },
      { el: elements.tabIconEncyclopedia, cfg: UI_ASSETS.tabs?.encyclopedia }
    ];
    tabConfigs.forEach(item => {
      if (item.el && item.cfg?.icon && item.cfg.icon.trim() !== "") {
        item.el.innerHTML = `<img src="${item.cfg.icon}" alt="tab icon" class="tab-custom-icon">`;
      }
    });

    // 3. ボタン画像（通常時 & ホバー時切り替え対応）
    const buttonMap = [
      { btn: elements.btnSubmitQuiz, cfg: UI_ASSETS.buttons?.submitQuiz },
      { btn: elements.btnSubmitTuning, cfg: UI_ASSETS.buttons?.submitTuning },
      { btn: elements.btnRetryQuiz, cfg: UI_ASSETS.buttons?.retryQuiz },
      { btn: elements.btnGoEncyclopediaFromResult, cfg: UI_ASSETS.buttons?.goEncyclopedia },
      { btn: elements.btnTapReset, cfg: UI_ASSETS.buttons?.tapReset },
      { btn: elements.navQuiz, cfg: UI_ASSETS.tabs?.quiz },
      { btn: elements.navTuning, cfg: UI_ASSETS.tabs?.tuning },
      { btn: elements.navEncyclopedia, cfg: UI_ASSETS.tabs?.encyclopedia }
    ];

    buttonMap.forEach(({ btn, cfg }) => {
      if (!btn || !cfg) return;
      const defaultImg = cfg.defaultImg || cfg.buttonImg;
      const hoverImg = cfg.hoverImg || cfg.buttonHoverImg;

      if (defaultImg && defaultImg.trim() !== "") {
        btn.classList.add("btn-has-custom-img");
        btn.innerHTML = `<img src="${defaultImg}" alt="button" class="btn-img-asset">`;

        const imgEl = btn.querySelector(".btn-img-asset");

        // 原寸表示をデフォルトとしつつ、UI_ASSETS に明示的なサイズ指定(width/height/maxWidth/maxHeight)があれば適用
        if (cfg.width) imgEl.style.width = typeof cfg.width === "number" ? `${cfg.width}px` : cfg.width;
        if (cfg.height) imgEl.style.height = typeof cfg.height === "number" ? `${cfg.height}px` : cfg.height;
        if (cfg.maxWidth) imgEl.style.maxWidth = typeof cfg.maxWidth === "number" ? `${cfg.maxWidth}px` : cfg.maxWidth;
        if (cfg.maxHeight) imgEl.style.maxHeight = typeof cfg.maxHeight === "number" ? `${cfg.maxHeight}px` : cfg.maxHeight;

        if (hoverImg && hoverImg.trim() !== "") {
          // ホバー画像を事前ロードして切り替えのチラつきを防止
          const preloadImg = new Image();
          preloadImg.src = hoverImg;

          btn.addEventListener("mouseenter", () => {
            imgEl.src = hoverImg;
          });
          btn.addEventListener("mouseleave", () => {
            // ★重要: is-shivering（モーダル表示中の震え・ホバー維持）中はホバー画像を維持する
            if (btn.classList.contains("is-shivering")) {
              return;
            }
            imgEl.src = defaultImg;
          });
        }
      }
    });

    // 4. 狂信タイプ診断の選択肢 ＆ TAPモーダルボタン共通 border-image 設定の適用
    if (UI_ASSETS.choiceBorderImage) {
      const cfg = UI_ASSETS.choiceBorderImage;
      if (cfg.source && cfg.source.trim() !== "") {
        const src = cfg.source.trim();
        const urlVal = src.startsWith("url(") ? src : `url("${src}")`;
        document.documentElement.style.setProperty("--common-border-image-source", urlVal);

        if (cfg.slice !== undefined && cfg.slice !== null) {
          document.documentElement.style.setProperty("--common-border-image-slice", String(cfg.slice));
        }
        if (cfg.width !== undefined && cfg.width !== null) {
          const w = typeof cfg.width === "number" ? `${cfg.width}px` : cfg.width;
          document.documentElement.style.setProperty("--common-border-image-width", w);
        }
        if (cfg.repeat) {
          document.documentElement.style.setProperty("--common-border-image-repeat", cfg.repeat);
        }
        if (cfg.outset !== undefined && cfg.outset !== null) {
          const o = typeof cfg.outset === "number" ? `${cfg.outset}px` : cfg.outset;
          document.documentElement.style.setProperty("--common-border-image-outset", o);
        }
      }
    }
  }

  // ==========================================
  // 初期化
  // ==========================================
  function init() {
    setupEventListeners();
    renderQuestion(0);
    renderTuningSliders();
    applyUIAssets();
    switchScreen("quiz");

    // 開発者・制作者用コンソール
    window.__DEVIL_STATS__ = {
      getUserId: () => storageManager.getUserId(),
      getStats: () => storageManager.getStatistics(RESULT_TYPES),
      unlockAll: () => {
        storageManager.unlockAllTypes(RESULT_TYPES);
        renderEncyclopedia();
        console.log("すべての図鑑タイプ（全20種）を解放しました");
      },
      resetData: () => {
        storageManager.resetAllData();
        renderEncyclopedia();
        console.log("図鑑データと履歴をリセットしました");
      }
    };
  }

  // ==========================================
  // 画面遷移
  // ==========================================
  function switchScreen(screenName) {
    state.currentScreen = screenName;

    [elements.navQuiz, elements.navTuning, elements.navEncyclopedia].forEach(btn => {
      if (btn) btn.classList.remove("active");
    });
    if (screenName === "quiz" && elements.navQuiz) elements.navQuiz.classList.add("active");
    if (screenName === "tuning" && elements.navTuning) elements.navTuning.classList.add("active");
    if (screenName === "encyclopedia" && elements.navEncyclopedia) elements.navEncyclopedia.classList.add("active");

    Object.keys(elements.screens).forEach(key => {
      const screen = elements.screens[key];
      if (!screen) return;
      if (key === screenName) {
        screen.classList.remove("hidden");
        screen.classList.add("fade-in");
      } else {
        screen.classList.add("hidden");
        screen.classList.remove("fade-in");
      }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (screenName === "encyclopedia") {
      renderEncyclopedia();
    }
  }

  // ==========================================
  // イベントリスナー設定
  // ==========================================
  function setupEventListeners() {
    if (elements.navQuiz) elements.navQuiz.addEventListener("click", () => switchScreen("quiz"));
    if (elements.navTuning) elements.navTuning.addEventListener("click", () => switchScreen("tuning"));
    if (elements.navEncyclopedia) elements.navEncyclopedia.addEventListener("click", () => switchScreen("encyclopedia"));

    // 診断画面 前へ/次へ
    if (elements.btnPrevQuestion) {
      elements.btnPrevQuestion.addEventListener("click", () => {
        if (state.currentQuestionIndex > 0) {
          renderQuestion(state.currentQuestionIndex - 1);
        }
      });
    }
    if (elements.btnNextQuestion) {
      elements.btnNextQuestion.addEventListener("click", () => {
        if (state.currentQuestionIndex < QUESTIONS.length - 1) {
          renderQuestion(state.currentQuestionIndex + 1);
        }
      });
    }

    // 狂信タイプ診断 結果表示ボタン
    if (elements.btnSubmitQuiz) {
      elements.btnSubmitQuiz.addEventListener("click", () => {
        processDiagnosisResult("quiz");
      });
    }

    // オリ狂を作ろう 結果表示ボタン
    if (elements.btnSubmitTuning) {
      elements.btnSubmitTuning.addEventListener("click", () => {
        processDiagnosisResult("free_tuning");
      });
    }

    // 結果画面：図鑑で確認ボタン
    if (elements.btnGoEncyclopediaFromResult) {
      elements.btnGoEncyclopediaFromResult.addEventListener("click", () => {
        switchScreen("encyclopedia");
      });
    }

    // ★重要: 「はじめから」ボタン押下時の演出 & 画面分岐
    // 狂信タイプ診断モード: 赤い画面にフェードインアウトし、質問回答を初期化して診断画面の最初へ
    // オリ狂を作ろうモード: 演出なしで即座にオリ狂画面へ遷移（パラメータはリセットしない）
    if (elements.btnRetryQuiz) {
      elements.btnRetryQuiz.addEventListener("click", () => {
        const isTuning = state.latestResult && state.latestResult.mode === "free_tuning";
        if (isTuning) {
          // オリ狂を作ろうモードへ遷移: 画面遷移の演出は無し、パラメータはリセットしない
          switchScreen("tuning");
        } else {
          // 狂信タイプ診断モードの最初へ: 赤い画面にフェードインアウトし、質問回答を初期化
          performRedFadeTransition(() => {
            state.answers = {};
            state.allNeutral = true;
            renderQuestion(0);
            switchScreen("quiz");
          });
        }
      });
    }

    // 結果画面：X (Twitter) シェアボタン
    if (elements.btnShareTwitter) {
      elements.btnShareTwitter.addEventListener("click", () => {
        if (!state.latestResult) return;
        shareToTwitter(state.latestResult.type, state.latestResult.mode);
      });
    }

    // ★重要: 「TAP！」（リセット機能 & カスタムモーダル）
    // ホバー・クリックで微震えし、モーダル「すべてを終わらせる？(図鑑データが完全に削除されます。)」を表示。
    // モーダルを閉じるかリセットするまで、ホバー画像・赤色発光・微震えを完全に維持。
    function closeResetModal() {
      if (elements.modalResetConfirm) {
        elements.modalResetConfirm.classList.add("hidden");
      }
      if (elements.btnTapReset) {
        elements.btnTapReset.classList.remove("is-shivering");

        // カスタム画像ボタンの場合、ホバー状態を解除して通常画像へ戻す
        const imgEl = elements.btnTapReset.querySelector(".btn-img-asset");
        const tapResetCfg = (typeof UI_ASSETS !== "undefined" && UI_ASSETS.buttons) ? UI_ASSETS.buttons.tapReset : null;
        if (imgEl && tapResetCfg) {
          const defaultImg = tapResetCfg.defaultImg || tapResetCfg.buttonImg;
          const hoverImg = tapResetCfg.hoverImg || tapResetCfg.buttonHoverImg;
          // モーダルを閉じた瞬間にマウスがまだボタン上にあればホバー画像を維持、離れていれば通常画像へ戻す
          if (elements.btnTapReset.matches(":hover") && hoverImg) {
            imgEl.src = hoverImg;
          } else if (defaultImg) {
            imgEl.src = defaultImg;
          }
        }
      }
    }

    if (elements.btnTapReset) {
      elements.btnTapReset.addEventListener("click", () => {
        // ホバー時の状態(震えている状態・ホバー画像・赤発光)を完全に維持
        elements.btnTapReset.classList.add("is-shivering");

        // カスタム画像ボタンの場合、ホバー画像を確実に適用して維持
        const imgEl = elements.btnTapReset.querySelector(".btn-img-asset");
        const tapResetCfg = (typeof UI_ASSETS !== "undefined" && UI_ASSETS.buttons) ? UI_ASSETS.buttons.tapReset : null;
        if (imgEl && tapResetCfg) {
          const hoverImg = tapResetCfg.hoverImg || tapResetCfg.buttonHoverImg;
          if (hoverImg && hoverImg.trim() !== "") {
            imgEl.src = hoverImg;
          }
        }

        if (elements.modalResetConfirm) {
          elements.modalResetConfirm.classList.remove("hidden");
        }
      });
    }

    if (elements.btnResetCancel) {
      elements.btnResetCancel.addEventListener("click", closeResetModal);
    }

    if (elements.modalResetConfirm) {
      elements.modalResetConfirm.addEventListener("click", (e) => {
        if (e.target === elements.modalResetConfirm) {
          closeResetModal();
        }
      });
    }

    if (elements.btnResetConfirm) {
      elements.btnResetConfirm.addEventListener("click", () => {
        closeResetModal();
        performResetFadeTransition(() => {
          storageManager.resetAllData();
          state.answers = {};
          state.allNeutral = true;
          renderQuestion(0);
          renderEncyclopedia();
          switchScreen("quiz");
          showToast("すべての図鑑データをリセットしました", 3500, "toast-message toast-message-tap");
        });
      });
    }

    // 図鑑フィルター
    elements.filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        elements.filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.filterEncyclopedia = btn.dataset.filter;
        renderEncyclopedia();
      });
    });

    // モーダル閉じる
    if (elements.modalDetailClose) {
      elements.modalDetailClose.addEventListener("click", closeModal);
    }
    if (elements.modalDetail) {
      elements.modalDetail.addEventListener("click", (e) => {
        if (e.target === elements.modalDetail) closeModal();
      });
    }
  }

  // ==========================================
  // 赤フェード演出 (はじめからボタン用)
  // 赤い画面にフェードイン → 処理実行 → フェードアウト
  // ==========================================
  function performRedFadeTransition(onTransition) {
    const overlay = elements.fadeOverlay;
    if (!overlay) {
      onTransition();
      return;
    }

    overlay.className = "screen-fade-overlay fade-red-enter";
    overlay.classList.remove("hidden");

    setTimeout(() => {
      onTransition();
      overlay.className = "screen-fade-overlay fade-red-leave";
      setTimeout(() => {
        overlay.classList.add("hidden");
        overlay.className = "screen-fade-overlay";
      }, 350);
    }, 300);
  }

  // ==========================================
  // リセット用フェード演出 (TAP! ボタン用)
  // 赤い画面(一瞬表示) → 黒い画面(ゆっくりめ)にフェード
  // ==========================================
  function performResetFadeTransition(onTransition) {
    const overlay = elements.fadeOverlay;
    if (!overlay) {
      onTransition();
      return;
    }

    // 1. 赤い画面を一瞬表示 (Flash Red)
    overlay.className = "screen-fade-overlay fade-red-flash";
    overlay.classList.remove("hidden");

    setTimeout(() => {
      // 2. 黒い画面にゆっくりフェードイン (Fade to Dark Black)
      overlay.className = "screen-fade-overlay fade-black-enter";

      setTimeout(() => {
        onTransition();
        // 3. 黒い画面がゆっくり明ける
        overlay.className = "screen-fade-overlay fade-black-leave";
        setTimeout(() => {
          overlay.classList.add("hidden");
          overlay.className = "screen-fade-overlay";
        }, 500);
      }, 1000);
    }, 100);
  }

  // ==========================================
  // 狂信タイプ診断: 質問レンダリング & 回答
  // ==========================================
  function renderQuestion(index) {
    state.currentQuestionIndex = index;
    const q = QUESTIONS[index];
    const total = QUESTIONS.length;
    const currentNo = index + 1;

    elements.quizProgressText.textContent = `第 ${currentNo} 問 / 全 ${total} 問`;
    const progressPercent = Math.round((currentNo / total) * 100);
    elements.quizProgressBar.style.width = `${progressPercent}%`;

    elements.quizQuestionNo.textContent = `Q${currentNo}.`;
    elements.quizQuestionText.textContent = q.text;

    elements.quizChoicesContainer.innerHTML = "";
    const selectedValue = state.answers[q.id];

    ANSWER_CHOICES.forEach(choice => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn common-frame-border";
      if (selectedValue === choice.value) {
        btn.classList.add("selected");
      }

      btn.innerHTML = `
        <span class="choice-radio"></span>
        <span class="choice-text">${choice.label}</span>
      `;

      btn.addEventListener("click", () => {
        selectChoice(q.id, choice.value);
      });

      elements.quizChoicesContainer.appendChild(btn);
    });

    elements.btnPrevQuestion.disabled = (index === 0);

    const isAnswered = selectedValue !== undefined;
    const isLast = (index === total - 1);

    if (isLast) {
      elements.btnNextQuestion.classList.add("hidden");
      elements.btnSubmitQuiz.classList.remove("hidden");
      elements.btnSubmitQuiz.disabled = !isAnswered;
    } else {
      elements.btnNextQuestion.classList.remove("hidden");
      elements.btnSubmitQuiz.classList.add("hidden");
      elements.btnNextQuestion.disabled = !isAnswered;
    }
  }

  function selectChoice(questionId, value) {
    state.answers[questionId] = value;

    // ★重要要件: 「どちらとも言えない(3)」を選択し続けている間は true、一度でもそれ以外の選択肢を選んだら false
    state.allNeutral = Object.values(state.answers).every(v => v === 3);
    
    const choiceButtons = elements.quizChoicesContainer.querySelectorAll(".choice-btn");
    choiceButtons.forEach((btn, idx) => {
      if (ANSWER_CHOICES[idx].value === value) {
        btn.classList.add("selected");
      } else {
        btn.classList.remove("selected");
      }
    });

    const isLast = (state.currentQuestionIndex === QUESTIONS.length - 1);
    if (isLast) {
      elements.btnSubmitQuiz.disabled = false;
    } else {
      elements.btnNextQuestion.disabled = false;
    }
  }

  // ==========================================
  // パラメータ算出 & 5段階丸め込みロジック (狂信タイプ診断用)
  // ==========================================
  function calculateScoresFromAnswers() {
    const rawScores = {
      faith: 50,
      curiosity: 50,
      happiness: 50,
      ethicsCollapse: 50,
      godAffection: 50
    };

    QUESTIONS.forEach(q => {
      const userChoiceVal = state.answers[q.id];
      if (userChoiceVal !== undefined) {
        const choice = ANSWER_CHOICES.find(c => c.value === userChoiceVal);
        const multiplier = choice ? choice.multiplier : 0;

        if (q.weights) {
          Object.keys(q.weights).forEach(paramKey => {
            if (rawScores[paramKey] !== undefined) {
              rawScores[paramKey] += q.weights[paramKey] * multiplier;
            }
          });
        }
      }
    });

    const clampedRaw = {};
    const levels = {};
    Object.keys(rawScores).forEach(key => {
      let val = Math.round(rawScores[key]);
      if (val < 0) val = 0;
      if (val > 100) val = 100;
      clampedRaw[key] = val;
      levels[key] = getLevel(val);
    });

    return { raw: clampedRaw, levels: levels };
  }

  // ==========================================
  // 結果判定ロジック (マスタのpriority順に判定)
  // levels, raw, context (mode, isQuiz, isTuning, allNeutral) を渡して判定
  // ==========================================
  function determineResultType(levels, raw, context) {
    const sortedTypes = [...RESULT_TYPES].sort((a, b) => b.priority - a.priority);

    for (const type of sortedTypes) {
      try {
        if (type.checkCondition(levels, raw, context)) {
          return type;
        }
      } catch (err) {
        console.error(`Condition error in type ${type.id}:`, err);
      }
    }

    return RESULT_TYPES[RESULT_TYPES.length - 1];
  }

  // ==========================================
  // 診断結果の処理 (コンテキスト生成 & 図鑑アンロック)
  // ==========================================
  function processDiagnosisResult(mode = "quiz") {
    let raw, levels;

    const isQuiz = (mode === "quiz");
    const isTuning = (mode === "free_tuning");

    // 全問回答済みで、かつ一度も「どちらともいえない(3)」以外を選んでいないかどうか
    const allNeutralFinal = isQuiz &&
      (Object.keys(state.answers).length === QUESTIONS.length) &&
      state.allNeutral;

    // ★重要要件: モード判別フラグ & 全問「どちらとも言えない」判別フラグ
    const context = {
      mode: mode,                       // "quiz" | "free_tuning"
      isQuiz: isQuiz,                   // 狂信タイプ診断なら true
      isTuning: isTuning,               // オリ狂を作ろうなら true
      allNeutral: allNeutralFinal,      // 狂信タイプ診断で全問「どちらともいえない」なら true
      isAllNeutral: allNeutralFinal
    };

    if (isQuiz) {
      const calculated = calculateScoresFromAnswers();
      raw = calculated.raw;
      levels = calculated.levels;
    } else {
      levels = { ...state.tuningLevels };
      raw = {
        faith: LEVEL_TO_RAW_MAP[levels.faith] || 50,
        curiosity: LEVEL_TO_RAW_MAP[levels.curiosity] || 50,
        happiness: LEVEL_TO_RAW_MAP[levels.happiness] || 50,
        ethicsCollapse: LEVEL_TO_RAW_MAP[levels.ethicsCollapse] || 50,
        godAffection: LEVEL_TO_RAW_MAP[levels.godAffection] || 50
      };
    }

    const resultType = determineResultType(levels, raw, context);
    const unlockRes = storageManager.unlockType(resultType.id, mode);
    
    storageManager.saveHistory({
      mode: mode,
      resultTypeId: resultType.id,
      rawScores: raw,
      levels: levels
    });

    state.latestResult = {
      type: resultType,
      raw: raw,
      levels: levels,
      isNew: unlockRes.isNew,
      mode: mode
    };

    renderResultScreen(state.latestResult);
    switchScreen("result");

    if (unlockRes.isNew) {
      showToast(`✨ NEW! 図鑑に『${resultType.name}』が新しく登録されました！`, 4500, "toast-message");
    }
  }

  // ==========================================
  // 結果画面のレンダリング (スマホ1枚スクショ最適化)
  // ==========================================
  function renderResultScreen(resultData) {
    const { type, raw, levels, isNew } = resultData;

    if (isNew) {
      elements.resultNewBadge.classList.remove("hidden");
    } else {
      elements.resultNewBadge.classList.add("hidden");
    }

    elements.resultRarity.textContent = `RARITY: ${type.rarity} [No.${type.no}]`;
    elements.resultRarity.style.borderColor = type.badgeColor || "#a855f7";

    elements.resultAvatar.innerHTML = getAvatarHtml(type, "result-avatar-size");
    elements.resultName.textContent = type.name;
    elements.resultSubtitle.textContent = type.subtitle;
    elements.resultQuote.textContent = type.quote;
    elements.resultDescription.textContent = type.description;

    elements.resultParamsList.innerHTML = "";
    Object.keys(PARAMETERS).forEach(key => {
      const def = PARAMETERS[key];
      const score = raw[key];
      const lvl = levels[key];
      const lvlInfo = LEVEL_LABELS[lvl];

      const item = document.createElement("div");
      item.className = "param-result-card";
      item.innerHTML = `
        <div class="param-result-header">
          <span class="param-result-title">${getParamIconHtml(key)} ${def.name}</span>
          <span class="param-result-level-badge">${lvlInfo.text}</span>
        </div>
        <div class="param-bar-bg">
          <div class="param-bar-fill" style="width: ${score}%; background-color: ${def.color};"></div>
        </div>
      `;
      elements.resultParamsList.appendChild(item);
    });
  }

  // ==========================================
  // オリ狂を作ろう (5段階 & フレーバーテキスト表示)
  // ==========================================
  function renderTuningSliders() {
    elements.tuningSlidersContainer.innerHTML = "";

    Object.keys(PARAMETERS).forEach(key => {
      const def = PARAMETERS[key];
      const initialLvl = state.tuningLevels[key] || 3;
      const lvlInfo = LEVEL_LABELS[initialLvl];
      const initialFlavor = (PARAM_FLAVOR_TEXTS[key] && PARAM_FLAVOR_TEXTS[key][initialLvl]) || "";

      const row = document.createElement("div");
      row.className = "tuning-slider-row";
      row.innerHTML = `
        <div class="tuning-label-group">
          <label for="slider-${key}" class="tuning-param-name">${getParamIconHtml(key)} ${def.name}</label>
          <span class="tuning-val-display" id="val-display-${key}">段階 ${initialLvl}：${lvlInfo.text}</span>
        </div>
        <p class="tuning-param-desc">${def.description}</p>
        <div class="slider-wrapper">
          <input type="range" min="1" max="5" step="1" value="${initialLvl}" class="tuning-range-slider" id="slider-${key}">
        </div>
        <div class="slider-ticks">
          <span>1 (極低)</span>
          <span>2 (低)</span>
          <span>3 (中)</span>
          <span>4 (高)</span>
          <span>5 (極高)</span>
        </div>
        <!-- 段階ごとのフレーバーテキスト -->
        <div class="tuning-flavor-box" id="flavor-${key}">${initialFlavor}</div>
      `;

      elements.tuningSlidersContainer.appendChild(row);

      const slider = row.querySelector(`#slider-${key}`);
      slider.addEventListener("input", (e) => {
        const lvl = parseInt(e.target.value, 10);
        state.tuningLevels[key] = lvl;
        const currentLvlInfo = LEVEL_LABELS[lvl];

        const valDisplay = document.getElementById(`val-display-${key}`);
        if (valDisplay) {
          valDisplay.textContent = `段階 ${lvl}：${currentLvlInfo.text}`;
        }

        const flavorBox = document.getElementById(`flavor-${key}`);
        if (flavorBox && PARAM_FLAVOR_TEXTS[key]) {
          flavorBox.textContent = PARAM_FLAVOR_TEXTS[key][lvl] || "";
        }
      });
    });
  }

  // ==========================================
  // 図鑑モード (取得回数は表示しない)
  // ==========================================
  function renderEncyclopedia() {
    const unlockedMap = storageManager.getUnlockedData();
    const unlockedIds = Object.keys(unlockedMap);
    const totalCount = RESULT_TYPES.length;
    const unlockedCount = unlockedIds.length;
    const percent = Math.round((unlockedCount / totalCount) * 100);

    elements.encyclopediaRateText.textContent = `発見状況: ${unlockedCount} / ${totalCount} 種 (${percent}%)`;
    elements.encyclopediaProgressBar.style.width = `${percent}%`;

    elements.encyclopediaGrid.innerHTML = "";

    RESULT_TYPES.forEach(type => {
      const isUnlocked = !!unlockedMap[type.id];
      const unlockInfo = unlockedMap[type.id];

      if (state.filterEncyclopedia === "unlocked" && !isUnlocked) return;
      if (state.filterEncyclopedia === "locked" && isUnlocked) return;

      const card = document.createElement("div");
      card.className = `encyclopedia-card ${isUnlocked ? 'unlocked' : 'locked'}`;

      if (isUnlocked) {
        // ★要件: 取得回数は集計・表示しなくて良い
        card.innerHTML = `
          <div class="card-badge" style="background-color:${type.badgeColor}">${type.rarity}</div>
          <div class="card-avatar">${getAvatarHtml(type, "card-avatar-size")}</div>
          <div class="card-no">No.${type.no}</div>
          <div class="card-title">${type.name}</div>
          <div class="card-subtitle">${type.subtitle}</div>
          <div class="card-footer">
            <span class="card-unlocked-status">解放済み</span>
            <span class="card-btn-view">詳細を見る ❯</span>
          </div>
        `;
        card.addEventListener("click", () => {
          openDetailModal(type, unlockInfo);
        });
      } else {
        card.innerHTML = `
          <div class="card-badge locked-badge">???</div>
          <div class="card-avatar locked-avatar"><span class="avatar-text">❓</span></div>
          <div class="card-no">No.${type.no}</div>
          <div class="card-title locked-title">？？？？？？</div>
          <div class="card-hint">ヒント: ${type.hint || "特定のパラメータ条件で解放"}</div>
          <div class="card-footer">
            <span class="card-locked-text">未発見</span>
          </div>
        `;
      }

      elements.encyclopediaGrid.appendChild(card);
    });
  }

  // ==========================================
  // 詳細モーダル表示 (回数非表示 & 取得方法連動シェア対応)
  // ==========================================
  function openDetailModal(type, unlockInfo) {
    const formattedDate = unlockInfo.unlockedAt 
      ? new Date(unlockInfo.unlockedAt).toLocaleString("ja-JP")
      : "不明";

    const originModeText = unlockInfo.firstUnlockedVia === 'quiz' ? '狂信タイプ診断' : 'オリ狂を作ろう';

    elements.modalDetailBody.innerHTML = `
      <div class="modal-header-area">
        <div class="modal-avatar">${getAvatarHtml(type, "modal-avatar-size")}</div>
        <div class="modal-rarity" style="color:${type.badgeColor}">【${type.rarity}】 No.${type.no}</div>
        <h2 class="modal-title">${type.name}</h2>
        <p class="modal-subtitle">${type.subtitle}</p>
      </div>

      <div class="modal-quote">
        ${type.quote}
      </div>

      <div class="modal-section">
        <h3>狂信者プロファイル</h3>
        <p class="modal-description">${type.description}</p>
      </div>

      <div class="modal-section">
        <h3>目安となる傾向</h3>
        <p class="modal-hint-text">${type.hint || ""}</p>
      </div>

      <div class="modal-meta-info">
        <div>初回解放日時: ${formattedDate}</div>
        <div>解放経路: ${originModeText}</div>
      </div>

      <div class="modal-actions-area">
        <button type="button" class="btn btn-share btn-sm" id="btn-modal-share-twitter">
          𝕏 結果をシェア
        </button>
      </div>
    `;

    // モーダル内のシェアボタンイベント（取得経路に依存）
    const modalShareBtn = document.getElementById("btn-modal-share-twitter");
    if (modalShareBtn) {
      modalShareBtn.addEventListener("click", () => {
        shareToTwitter(type, unlockInfo.firstUnlockedVia);
      });
    }

    elements.modalDetail.classList.remove("hidden");
  }

  function closeModal() {
    elements.modalDetail.classList.add("hidden");
  }

  // ==========================================
  // X (Twitter) シェア文章の条件分岐
  // 狂信タイプ診断画面 → 狂信タイプ診断結果
  // オリ狂を作ろう → オリ狂を作ったよ
  // 図鑑 → 最初に取得した方法に依存
  // ==========================================
  function shareToTwitter(type, mode) {
    let mainSentence = "";

    if (mode === "quiz") {
      mainSentence = `狂信タイプ診断結果は【${type.name} (${type.rarity})】でした！`;
    } else {
      // free_tuning
      mainSentence = `オリ狂を作ったよ！【${type.name} (${type.rarity})】を召喚しました！`;
    }

    const text = `【悪魔狂信者タイプ診断】\n${mainSentence}\n\n${type.quote}\n\n#狂者タイプ診断 `;
    const url = window.location.href;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank");
  }

  function showToast(message, duration = 3000, toastType) {
    const toast = document.createElement("div");
    toast.className = toastType;
    toast.textContent = message;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 400);
    }, duration);
  }

  // 起動
  init();
});
