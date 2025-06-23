# IDentry - Supabase Backend Setup

## 🚀 完了した実装

既存のフロントエンドUIを維持しながら、Supabaseを使用したバックエンド機能を完全に実装しました。

### ✅ 実装された機能

1. **データベーススキーマ**
   - `profiles` テーブル（プロフィール情報）
   - `education` テーブル（学歴）
   - `career` テーブル（職歴）
   - `portfolio` テーブル（ポートフォリオ）
   - Row Level Security (RLS) 設定済み

2. **認証機能**
   - Supabase Auth統合
   - Googleログイン対応
   - メール/パスワード認証
   - 認証状態管理

3. **フォームデータ保存**
   - 入力フォームのローカルストレージ保存
   - ログイン後の自動データベース保存
   - 一時的なデータ保持機能

4. **既存UIの機能強化**
   - ランディングページ（そのまま）
   - 作成ページ（データ保存機能追加）
   - プレビューページ（ローカルデータ表示）
   - ログインページ（Supabase認証統合）
   - ダッシュボード（データベース連携）

## 📊 Supabaseプロジェクト情報

- **プロジェクトID**: `tuexsobbaasxuaxtgccq`
- **URL**: `https://tuexsobbaasxuaxtgccq.supabase.co`
- **月額費用**: $0（無料プラン）

## 🔧 使用方法

### 1. 環境変数の設定
```bash
# .env.localファイル（既に作成済み）
NEXT_PUBLIC_SUPABASE_URL=https://tuexsobbaasxuaxtgccq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. アプリケーションの起動
```bash
npm run dev
```

### 3. ユーザーフロー

1. **ランディングページ** (`/`)
   - 「今すぐはじめる」をクリック

2. **情報入力** (`/create`)
   - 10ステップでプロフィール情報を入力
   - データは自動的にローカルストレージに保存

3. **プレビュー** (`/preview`)
   - 入力したデータのプレビュー表示
   - 「公開する」でログインページへ

4. **ログイン/新規登録** (`/login`)
   - Googleログインまたはメール認証
   - ログイン成功時に自動的にデータベースへ保存

5. **ダッシュボード** (`/dashboard`)
   - 作成したプロフィールの管理
   - 公開/非公開設定
   - 閲覧数確認

## 🔐 Google認証の設定

Google認証を有効にするには、Supabaseコンソールで以下を設定してください：

1. Supabaseダッシュボードにアクセス
2. 「Authentication」→「Providers」
3. 「Google」を有効化
4. Google Cloud ConsoleでOAuth設定
5. Client IDとClient Secretを設定

## 📝 データベーススキーマ

### Profiles テーブル
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- name (text, required)
- bio (text)
- birth_year, birth_month, birth_day (text)
- gender, address, photo (text)
- twitter, instagram, linkedin, github (text)
- skills (text array)
- is_public (boolean, default: true)
- views_count (integer, default: 0)
- profile_url (text, unique)
- created_at, updated_at (timestamp)
```

### Education テーブル
```sql
- id (uuid, primary key)
- profile_id (uuid, foreign key)
- school (text, required)
- degree, year (text)
```

### Career テーブル
```sql
- id (uuid, primary key)
- profile_id (uuid, foreign key)
- company (text, required)
- position, period (text)
```

### Portfolio テーブル
```sql
- id (uuid, primary key)
- profile_id (uuid, foreign key)
- title (text, required)
- description, url, image (text)
```

## 🛡️ セキュリティ

- Row Level Security (RLS) が全テーブルで有効
- ユーザーは自分のデータのみアクセス可能
- 公開プロフィールは誰でも閲覧可能

## 🔄 今後の拡張

- プロフィール画像アップロード機能
- QRコード生成機能
- SNS連携機能
- アナリティクス機能
- カスタムドメイン対応

## 🐛 トラブルシューティング

### 認証エラーが発生する場合
1. 環境変数が正しく設定されているか確認
2. Supabaseプロジェクトのステータス確認
3. ブラウザのローカルストレージをクリア

### データが保存されない場合
1. RLSポリシーが正しく設定されているか確認
2. 認証状態を確認
3. ネットワーク接続を確認

## 📞 サポート

実装に関する質問や問題がある場合は、Supabaseドキュメントを参照するか、開発チームにお問い合わせください。 