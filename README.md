# EchoDict セットアップ手順

## ファイル構成
```
リポジトリ/
├── index.html   ← 辞書アプリ本体
├── ejdict.tsv   ← EJDictデータ（自分でダウンロード）
├── worker.js    ← Cloudflare Workers用コード
└── README.md
```

---

## Step 1: EJDictデータをダウンロード

1. https://github.com/kujirahand/EJDict/tree/master/src を開く
2. `a.txt` 〜 `z.txt` を全部ダウンロードして結合するか、
3. リリース版のTSVを https://github.com/kujirahand/EJDict/releases からダウンロード
4. ファイル名を `ejdict.tsv` にしてリポジトリに置く

---

## Step 2: Cloudflare Workersをデプロイ

1. https://workers.cloudflare.com でアカウント作成（無料）
2. 「Workers & Pages」→「新しいWorkerを作成」
3. `worker.js` の内容を貼り付けてデプロイ
4. 「Settings」→「Variables and Secrets」→「+ Add」
   - 変数名: `ANTHROPIC_API_KEY`
   - 値: AnthropicのAPIキー（https://console.anthropic.com）
5. デプロイ後のURL（`https://xxx.workers.dev`）をメモ

---

## Step 3: index.htmlを書き換え

`index.html` の以下の行を書き換える：

```js
const WORKER_URL = 'https://YOUR_WORKER.YOUR_NAME.workers.dev';
//                   ↑ここをStep2のURLに変更
```

---

## Step 4: GitHub Pagesで公開

1. GitHubにリポジトリを作成
2. `index.html` と `ejdict.tsv` をプッシュ
3. 「Settings」→「Pages」→「Deploy from branch: main」
4. 公開URLが発行される

---

## 動作の流れ

```
ユーザーが単語を検索
  ↓
EJDict（18万語）で検索
  ↓ 見つかった場合
  → 即座に表示（高速・無料）

  ↓ 見つからない場合
Cloudflare Workers経由でClaude APIに問い合わせ
  → 日本語で意味・例文を表示（AI補完）
```
