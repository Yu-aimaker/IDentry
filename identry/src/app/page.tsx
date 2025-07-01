"use client";

import Link from "next/link";
import Image from "next/image";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-white">
      {/* 🎯 ファーストビュー（ヒーローセクション） */}
      <section className="min-h-screen flex flex-col px-6 relative">
        
        {/* バナー画像 - 上部・下部に余白 */}
        <div className="py-5">
          <Image
            src="/img/banner.png"
            alt="IDentry Banner"
            width={400}
            height={100}
            className="object-contain max-w-full h-auto mx-auto"
            priority
          />
        </div>
        
        {/* Lottieアニメーション */}
        <div className="flex justify-center py-4">
          <DotLottieReact
            src="/lottie/Animation LottieFiles.lottie"
            autoplay
            speed={0.6}
            style={{ width: '250px', height: '250px' }}
          />
        </div>
        
        {/* メインコンテンツを上寄せ配置 */}
        <div className="flex-1 flex flex-col items-center justify-start pt-4">
          {/* メインコンテンツ */}
          <div className="text-center space-y-8 max-w-4xl">
          <h1 className="text-5xl lg:text-7xl font-bold text-black leading-tight">
            わたしのすべてが、<br />
            <span className="text-blue-600">このIDに。</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            SNSリンク、スキル、経歴、ポートフォリオ。<br />あなたの&quot;ぜんぶ&quot;を、ひとつのページにまとめよう。
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Link 
              href="/create"
              className="bg-blue-600 text-white px-10 py-5 rounded-xl text-xl font-semibold hover:bg-blue-700 hover:scale-105 transition-all duration-300 text-center shadow-lg hover:shadow-xl"
            >
              今すぐはじめる
            </Link>
            <Link
              href="/login?mode=login"
              className="text-blue-600 px-10 py-5 rounded-xl text-xl font-medium hover:bg-blue-50 hover:scale-105 transition-all duration-300 text-center border-2 border-blue-200 hover:border-blue-300"
            >
              ログイン
            </Link>
          </div>
          </div>
        </div>
        
        {/* スクロール指示 */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* 📦 IDentryでできること（機能紹介） */}
      <section id="features" className="bg-gray-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">IDentryでできること</h2>
            <p className="text-xl text-gray-600">あなたのデジタルアイデンティティを、美しく表現</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="text-5xl mb-6">🪪</div>
              <h3 className="text-2xl font-bold text-black mb-4">デジタルIDを一発生成</h3>
              <p className="text-gray-600 leading-relaxed">
                名前・学歴・スキルなどを一度入力するだけ。自己紹介ページが完成。
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="text-5xl mb-6">🎨</div>
              <h3 className="text-2xl font-bold text-black mb-4">ポートフォリオも自由に</h3>
              <p className="text-gray-600 leading-relaxed">
                SNSリンクだけでなく、実績・スキルも魅せられる&quot;あなたのホームページ&quot;
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="text-5xl mb-6">📱</div>
              <h3 className="text-2xl font-bold text-black mb-4">デジタル名刺にも</h3>
              <p className="text-gray-600 leading-relaxed">
                QRコードでシェア。名刺の代わりにURLひとつで情報伝達。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🧱 入力体験（UXの差別化） */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-black">
                プロフィール入力が、<br />
                <span className="text-blue-600">楽しくなる。</span>
              </h2>
              <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                <p>面倒なフォームはもう要らない。</p>
                <p>
                  IDentryでは、「名前」「学歴」「スキル」などを1ブロックずつ、
                  遊び心あるUIで入力していきます。
                </p>
                <p>
                  完了するたびに&quot;報酬&quot;を感じられるUXで、
                  あなたのページがどんどん完成していきます。
                </p>
              </div>
            </div>
            
            {/* ブロックアニメーション風イメージ */}
            <div className="relative">
              <div className="grid grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                  <div 
                    key={i}
                    className={`h-16 rounded-lg transition-all duration-500 ${
                      i < 5 ? 'bg-blue-500' : i < 7 ? 'bg-blue-300' : 'bg-gray-200'
                    }`}
                    style={{
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📤 使い方ステップ */}
      <section id="how-to-use" className="bg-gray-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">使い方は簡単3ステップ</h2>
            <p className="text-xl text-gray-600">今すぐ始められます</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-bold text-black">入力する</h3>
              <p className="text-gray-600 leading-relaxed">
                一問ずつ、わかりやすく入力していきます
              </p>
            </div>
            
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-bold text-black">自動でページが完成</h3>
              <p className="text-gray-600 leading-relaxed">
                美しいデザインで自動生成されます
              </p>
            </div>
            
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-bold text-black">URLをシェア</h3>
              <p className="text-gray-600 leading-relaxed">
                ログインして保存、URLで簡単共有
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🧑‍🎓 活用シーン */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">こんな場面で活用できます</h2>
            <p className="text-xl text-gray-600">様々なシーンであなたを表現</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300">
              <div className="text-3xl mb-4">💼</div>
              <h3 className="font-bold text-black mb-2">就職・転職活動</h3>
              <p className="text-sm text-gray-600">ポートフォリオ提出</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300">
              <div className="text-3xl mb-4">🎨</div>
              <h3 className="font-bold text-black mb-2">フリーランス活動</h3>
              <p className="text-sm text-gray-600">クリエイターの自己紹介</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="font-bold text-black mb-2">SNS強化版</h3>
              <p className="text-sm text-gray-600">プロフィールリンク集</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300">
              <div className="text-3xl mb-4">👥</div>
              <h3 className="font-bold text-black mb-2">チーム紹介</h3>
              <p className="text-sm text-gray-600">コミュニティでの紹介</p>
            </div>
          </div>
        </div>
      </section>

      {/* 📣 よくある質問（FAQ） */}
      <section id="faq" className="bg-gray-50 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">よくある質問</h2>
            <p className="text-xl text-gray-600">気になることがあればチェック</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-black mb-2">無料で使える？</h3>
              <p className="text-gray-600">はい、基本機能は完全無料でご利用いただけます。</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-black mb-2">ログインしないと使えない？</h3>
              <p className="text-gray-600">ページ作成はログイン不要。保存や編集にはアカウントが必要です。</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-black mb-2">情報は非公開にできる？</h3>
              <p className="text-gray-600">はい、公開範囲を細かく設定できます。</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-black mb-2">どんな情報を登録できる？</h3>
              <p className="text-gray-600">プロフィール、SNSリンク、スキル、経歴、ポートフォリオなど。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 CTAセクション（再） */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
            あなたのID、<br />
            <span className="text-blue-600">今すぐ１つに。</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            3分であなたの魅力を伝えるページが完成。<br />
            今すぐ始めて、新しい自分を表現しませんか？
          </p>
          <Link 
            href="/create"
            className="bg-blue-600 text-white px-12 py-4 rounded-xl text-xl font-semibold hover:bg-blue-700 transition-all duration-200 inline-block shadow-lg hover:shadow-xl"
          >
            はじめる
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t border-gray-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <Image
                src="/img/favicon.png"
                alt="IDentry Logo"
                width={28}
                height={28}
                className="object-cover rounded-lg"
              />
              <span className="text-xl font-bold">
                <span className="text-black">ID</span>
                <span className="text-blue-600">entry</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-8 text-sm text-gray-600">
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">プライバシーポリシー</Link>
              <Link href="/terms" className="hover:text-blue-600 transition-colors">利用規約</Link>
              <a href="https://groovibes.studio" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">運営情報</a>
            </div>
          </div>
          
          <div className="border-t border-gray-100 mt-8 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 IDentry. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
