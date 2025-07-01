"use client";

import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">利用規約</h1>
      <p className="mb-6">この利用規約（以下、「本規約」といいます）は、IDentry（以下、「当サービス」といいます）の利用条件を定めるものです。ご利用の際は本規約に同意いただいたものとみなします。</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">1. サービスの内容</h2>
      <p className="mb-4">当サービスは、ユーザーが自身のプロフィールやSNSリンク等をまとめて公開できるWebサービスです。</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">2. 禁止事項</h2>
      <p className="mb-4">以下の行為は禁止します：<br />・法令または公序良俗に反する行為<br />・他者の権利を侵害する行為<br />・不正アクセスやシステムへの攻撃<br />・虚偽情報の登録やなりすまし</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">3. 免責事項</h2>
      <p className="mb-4">当サービスは、ユーザーデータの保護に最大限努めますが、ハッキングや不正アクセス等の外部攻撃による情報漏洩・損害について、当サービスは一切の責任を負いません。</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">4. サービスの変更・停止</h2>
      <p className="mb-4">当サービスは、事前の予告なくサービス内容の変更・停止・終了を行うことがあります。</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">5. 規約の変更</h2>
      <p className="mb-4">本規約は、必要に応じて予告なく変更されることがあります。変更後の規約は、当サービス上に掲載した時点で効力を生じます。</p>
      <div className="mt-12 text-sm text-gray-500">
        <p>制定日：2024年6月</p>
        <p className="mt-2">お問い合わせ：<Link href="/about" className="underline">運営情報</Link>ページをご参照ください。</p>
      </div>
    </div>
  );
} 