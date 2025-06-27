# IDentry - Digital Identity Card Platform

IDentryは、デジタル身分証明書を作成・管理できるプラットフォームです。

## 🚀 Getting Started

### 環境変数の設定

1. `.env.example`を`.env.local`にコピー：
```bash
cp .env.example .env.local
```

2. `.env.local`ファイルを編集して、実際のSupabase情報を入力：
```env
NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
```

### 開発環境での実行

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

## 🌐 Vercelでのデプロイ

### 環境変数の設定方法

Vercelでデプロイする際は、以下の環境変数をVercelダッシュボードで設定してください：

1. [Vercelダッシュボード](https://vercel.com/dashboard)にログイン
2. プロジェクトを選択
3. **Settings** → **Environment Variables**に移動
4. 以下の環境変数を追加：

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | あなたのSupabaseプロジェクトURL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | あなたのSupabaseの匿名キー | Production, Preview, Development |

### Vercel CLIを使用した環境変数設定

```bash
# 環境変数を追加
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# 環境変数一覧を確認
npx vercel env list

# 環境変数を本番からローカルにダウンロード
npx vercel env pull .env.local
```

## 📁 プロジェクト構造

```
identry/
├── src/
│   ├── app/
│   │   ├── create/          # プロフィール作成ページ
│   │   ├── dashboard/       # ダッシュボードページ
│   │   ├── login/          # ログインページ
│   │   └── preview/        # プレビューページ
├── components/
│   └── ui/                 # UIコンポーネント
├── lib/
│   ├── supabase.ts         # Supabase設定・関数
│   └── auth-context.tsx    # 認証コンテキスト
└── public/                 # 静的ファイル
```

## 🔧 使用技術

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Supabase (Database, Authentication, Storage)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 📝 主な機能

- ユーザー認証 (Google OAuth)
- プロフィール作成・編集
- デジタル身分証明書の生成
- プロフィール画像のアップロード
- 学歴・職歴・ポートフォリオの管理
- プロフィールの公開・非公開設定

## 🔒 セキュリティ

- 環境変数は`.env.local`ファイルに保存され、Gitリポジトリには含まれません
- Supabase RLS (Row Level Security) によるデータアクセス制御
- Google OAuthによる安全な認証

## 📞 サポート

問題や質問がある場合は、Issueを作成してください。
