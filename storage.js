/**
 * 悪魔狂信者タイプ診断 - ローカルストレージ管理
 * 
 * 個人ID、図鑑の解放状況、診断履歴などをLocalStorageに保存・管理します。
 * 将来のSupabase等外部サーバー連携用のスタブも用意しています。
 */

const STORAGE_KEYS = {
  USER_ID: "devil_cultist_user_id",
  UNLOCKED_TYPES: "devil_cultist_unlocked_types",
  HISTORY: "devil_cultist_history",
  FIRST_VISIT: "devil_cultist_first_visit"
};

class QuizStorage {
  constructor() {
    this.userId = this.initUserId();
  }

  // 1. 個人IDの初期化・取得 (UUIDv4 形式のランダム文字列)
  initUserId() {
    try {
      let id = localStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!id) {
        if (typeof crypto !== "undefined" && crypto.getRandomValues) {
          id = "usr_" + ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
          );
        } else {
          id = "usr_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 10);
        }
        localStorage.setItem(STORAGE_KEYS.USER_ID, id);
        localStorage.setItem(STORAGE_KEYS.FIRST_VISIT, new Date().toISOString());
      }
      return id;
    } catch (e) {
      console.warn("LocalStorage access failed; using in-memory session ID", e);
      return "usr_temp_" + Math.random().toString(36).substring(2, 10);
    }
  }

  getUserId() {
    return this.userId;
  }

  // 2. 解放済み図鑑タイプの取得
  // 返り値: { [typeId]: { unlockedAt: "ISO文字列", count: 回数, firstUnlockedVia: "quiz"|"free_tuning" } }
  getUnlockedData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.UNLOCKED_TYPES);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.error("Failed to parse unlocked types from localStorage", e);
      return {};
    }
  }

  // 解放済みIDの一覧配列を取得
  getUnlockedIds() {
    const data = this.getUnlockedData();
    return Object.keys(data);
  }

  // 3. 図鑑への登録 (結果表示ボタン押下時に実行)
  // 戻り値: { isNew: boolean, data: object }
  unlockType(typeId, mode = "quiz") {
    const unlocked = this.getUnlockedData();
    const isNew = !unlocked[typeId];

    if (isNew) {
      unlocked[typeId] = {
        unlockedAt: new Date().toISOString(),
        count: 1,
        firstUnlockedVia: mode
      };
    } else {
      unlocked[typeId].count = (unlocked[typeId].count || 1) + 1;
      unlocked[typeId].lastUnlockedAt = new Date().toISOString();
    }

    localStorage.setItem(STORAGE_KEYS.UNLOCKED_TYPES, JSON.stringify(unlocked));

    // 将来のサーバー同期フック（管理者用統計収集用など）
    this.dispatchServerSync({
      type: "unlock",
      userId: this.userId,
      typeId: typeId,
      mode: mode,
      isNew: isNew
    });

    return { isNew, record: unlocked[typeId] };
  }

  // 4. 診断履歴の記録
  saveHistory(historyEntry) {
    try {
      const history = this.getHistory();
      const newEntry = {
        id: "hist_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString(),
        userId: this.userId,
        ...historyEntry
      };
      history.unshift(newEntry);
      
      // 最大100件まで保持
      if (history.length > 100) {
        history.pop();
      }
      
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));

      // サーバー同期フック
      this.dispatchServerSync({
        type: "diagnosis",
        userId: this.userId,
        entry: newEntry
      });

      return newEntry;
    } catch (e) {
      console.error("Failed to save history", e);
      return null;
    }
  }

  getHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      return [];
    }
  }

  // 5. ローカル統計情報の集計 (管理者およびデバッグ・進捗確認用)
  getStatistics(allTypesMaster = RESULT_TYPES) {
    const history = this.getHistory();
    const unlocked = this.getUnlockedData();
    const unlockedIds = Object.keys(unlocked);
    const totalTypes = allTypesMaster.length;

    // タイプごとの出現頻度カウント
    const typeCounts = {};
    allTypesMaster.forEach(t => { typeCounts[t.id] = 0; });
    history.forEach(h => {
      if (typeCounts[h.resultTypeId] !== undefined) {
        typeCounts[h.resultTypeId]++;
      }
    });

    // モード別回数
    const modeCounts = { quiz: 0, free_tuning: 0 };
    history.forEach(h => {
      if (h.mode === "free_tuning") modeCounts.free_tuning++;
      else modeCounts.quiz++;
    });

    return {
      userId: this.userId,
      totalDiagnoses: history.length,
      modeCounts: modeCounts,
      unlockedCount: unlockedIds.length,
      totalTypes: totalTypes,
      completionRate: totalTypes > 0 ? ((unlockedIds.length / totalTypes) * 100).toFixed(1) : "0.0",
      typeCounts: typeCounts,
      unlockedMap: unlocked
    };
  }

  // 6. デバッグ・管理用操作
  resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.UNLOCKED_TYPES);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    // ユーザーIDは残す
  }

  unlockAllTypes(allTypesMaster = RESULT_TYPES) {
    const unlocked = {};
    const now = new Date().toISOString();
    allTypesMaster.forEach(t => {
      unlocked[t.id] = {
        unlockedAt: now,
        count: 1,
        firstUnlockedVia: "debug_unlock"
      };
    });
    localStorage.setItem(STORAGE_KEYS.UNLOCKED_TYPES, JSON.stringify(unlocked));
  }

  // 7. 将来のSupabase / クラウド統計送信用スタブ
  // 要件：「発見率表示は現状管理者のみが確認できれば良い（Web上に管理者画面を用意するのは必要になってからでよい）」
  // サーバー実装時にここをSupabaseクライアント呼び出しに差し替えるだけで動くように設計
  dispatchServerSync(payload) {
    // コンソールにデバッグログ出力（将来のWebhookやAPI呼び出し用）
    // console.log("[Storage Sync Stub] Event dispatched:", payload);
    /*
    if (window.supabaseClient) {
      window.supabaseClient.from('statistics').insert([payload]);
    }
    */
  }
}

// グローバルインスタンス
const storageManager = new QuizStorage();
