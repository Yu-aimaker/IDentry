"use client";

import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>
      <p className="mb-6">IDentry（以下、「当サービス」といいます）は、ユーザーの個人情報を適切に保護し、プライバシーの尊重に最大限努めます。本ポリシーは、当サービスにおける個人情報の取扱いについて定めるものです。</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">1. 取得する情報</h2>
      <p className="mb-4">当サービスは、ユーザー登録・ご利用時に、氏名、メールアドレス、SNSアカウント情報、プロフィール情報等を取得します。</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">2. 利用目的</h2>
      <p className="mb-4">取得した情報は、サービス提供・本人確認・お問い合わせ対応・サービス改善のために利用します。</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">3. 第三者提供</h2>
      <p className="mb-4">法令に基づく場合を除き、ユーザーの同意なく第三者に個人情報を提供することはありません。</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">4. 情報の管理</h2>
      <p className="mb-4">当サービスは、個人情報の漏洩・滅失・毀損を防止するため、適切な安全管理措置を講じます。ただし、当サービスはセキュリティ対策に万全を期しておりますが、ハッキングや不正アクセス等の外部攻撃による情報漏洩等について、完全な安全性を保証するものではありません。</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">5. ユーザーの権利</h2>
      <p className="mb-4">ユーザーは、ご自身の個人情報の開示・訂正・削除を求めることができます。ご希望の場合はお問い合わせ窓口までご連絡ください。</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">6. プライバシーポリシーの変更</h2>
      <p className="mb-4">本ポリシーの内容は、法令等の変更やサービス内容の変更に応じて、予告なく改定されることがあります。</p>
      <div className="mt-12 text-sm text-gray-500">
        <p>制定日：2024年6月</p>
        <p className="mt-2">お問い合わせ：<Link href="/about" className="underline">運営情報</Link>ページをご参照ください。</p>
      </div>
    </div>
  );
} 