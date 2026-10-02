# RiftEdge — LoL Pick Assistant

> **⚠️ 現在は開発を休止しています（2026年4月〜）。** データの自動収集を止めているため、サイトに表示される勝率は2026年4月時点のものです。

League of Legends のカウンターピック支援Webアプリです。
相手のチャンピオンを選ぶと、対面ごとの勝率から有利なピックを確認できます。

公開サイト: https://draftgap-nine.vercel.app

## 主な機能

- **対面勝率の表示** — チャンピオンごとに、相手との対面勝率を一覧で表示
- **ランク帯・パッチの切り替え** — アイアン〜マスター以上のランク帯と、パッチを選んで絞り込み
- **チャンピオンプール** — 自分の使うチャンピオンを登録しておける
- **対面Tips** — ログインしたユーザーが対面ごとの攻略メモを投稿・いいね・保存
- **日本語／英語の切り替え**

## データの仕組み

- Riot Games API（日本サーバー）から、ランク帯ごとにプレイヤーの直近の試合を取得し、レーンの対面ごとに勝敗を集計しています
- 収集は GitHub Actions で毎日実行し、集計結果（SQLite）をリポジトリに自動コミットしています。ランク帯を3つのグループに分け、1日3回（2時・10時・18時 JST）に分散してAPIの利用制限に収めています
- 処理済みの試合を記録し、同じ試合を二重に数えないようにしています
- チャンピオンの名前や画像は Riot の Data Dragon から取得しています

## 技術スタック

| 領域 | 使ったもの |
|---|---|
| フロントエンド | Next.js 16（App Router）、React 19、TypeScript |
| 多言語対応 | next-intl（日本語・英語） |
| 対面データ | Riot Games API、SQLite（better-sqlite3） |
| ログイン・Tips | Supabase（認証・データベース） |
| データ収集 | GitHub Actions（定期実行） |
| ホスティング | Vercel |

## ローカルで動かす

```bash
npm install
npm run dev
```

`.env.local` に次の値を設定します。

```
RIOT_API_KEY=...                  # データ収集に使用
NEXT_PUBLIC_SUPABASE_URL=...      # ログイン・Tipsに使用
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

対面データを手元で集める場合:

```bash
npm run collect -- --tier GOLD --division I --pages 1 --matches 5
npm run collect:apex    # マスター以上
```

## 開発について

個人開発です。AIコーディングエージェントと協働して開発し、仕様の決定と動作確認は本人が行っています。

---

RiftEdge isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc.
