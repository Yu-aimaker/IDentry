'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ProfileData {
  name: string;
  photo: string;
  bio: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  github: string;
  skills: string[];
  education: Array<{
    school: string;
    degree: string;
    year: string;
  }>;
  career: Array<{
    company: string;
    position: string;
    period: string;
  }>;
  portfolio: Array<{
    title: string;
    description: string;
    url: string;
    image: string;
  }>;
}

export default function PreviewPage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 実際のアプリでは、ローカルストレージまたはAPIからデータを取得
    const mockData: ProfileData = {
      name: '山田太郎',
      photo: '',
      bio: 'フロントエンドエンジニアとして3年の経験があります。ReactやNext.jsを使った開発が得意で、ユーザビリティを重視したWebアプリケーション開発に情熱を注いでいます。',
      twitter: '@yamada_taro',
      instagram: '@yamada_taro',
      linkedin: 'https://linkedin.com/in/yamada-taro',
      github: 'yamada-taro',
      skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js'],
      education: [
        {
          school: '東京大学',
          degree: '工学部情報工学科',
          year: '2020年3月'
        }
      ],
      career: [
        {
          company: '株式会社テクノロジー',
          position: 'フロントエンドエンジニア',
          period: '2020年4月 〜 現在'
        }
      ],
      portfolio: [
        {
          title: 'ECサイト開発',
          description: 'React/Next.jsを使用したECサイト。決済機能まで実装。',
          url: 'https://example-ec.com',
          image: ''
        }
      ]
    };
    
    setProfileData(mockData);
    // 仮の共有URLを生成
    setShareUrl(`https://identry.com/p/${generateTempId()}`);
  }, []);

  const generateTempId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('URLをクリップボードにコピーしました！');
    } catch (err) {
      console.error('コピーに失敗しました:', err);
    }
  };

  const handlePublish = () => {
    // 実際のアプリでは、ここでAPIに保存
    alert('プロフィールを公開しました！ダッシュボードから管理できます。');
    router.push('/dashboard');
  };

  if (!profileData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">プロフィールを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">ID</span>
            </div>
            <span className="text-xl font-bold text-black">IDentry</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link 
              href="/create"
              className="text-gray-600 hover:text-black transition-colors"
            >
              ← 編集に戻る
            </Link>
            <button
              onClick={handleShare}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              🔗 シェア
            </button>
            <button
              onClick={handlePublish}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              公開する
            </button>
          </div>
        </div>
      </header>

      {/* プレビュー通知 */}
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-4xl mx-auto px-4 py-3 text-center">
          <p className="text-blue-800">
            <span className="font-medium">👀 プレビューモード</span> - 
            これはあなたのプロフィールがどのように表示されるかのプレビューです
          </p>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* ヘッダー部分 */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12 text-white relative">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* プロフィール写真 */}
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-blue-600">
                {profileData.photo ? (
                  <Image
                    src={profileData.photo}
                    alt={profileData.name}
                    width={96}
                    height={96}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  profileData.name.charAt(0)
                )}
              </div>
              
              {/* 基本情報 */}
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold mb-2">{profileData.name}</h1>
                <p className="text-blue-100 text-lg leading-relaxed max-w-2xl">
                  {profileData.bio}
                </p>
                
                {/* SNSリンク */}
                <div className="flex justify-center md:justify-start space-x-4 mt-4">
                  {profileData.twitter && (
                    <a 
                      href={`https://twitter.com/${profileData.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                    >
                      𝕏
                    </a>
                  )}
                  {profileData.instagram && (
                    <a 
                      href={`https://instagram.com/${profileData.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                    >
                      📷
                    </a>
                  )}
                  {profileData.linkedin && (
                    <a 
                      href={profileData.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                    >
                      💼
                    </a>
                  )}
                  {profileData.github && (
                    <a 
                      href={`https://github.com/${profileData.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                    >
                      🐱
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* コンテンツ部分 */}
          <div className="p-8 space-y-8">
            {/* スキル */}
            {profileData.skills.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
                  💡 スキル
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* 経歴 */}
            {profileData.career.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
                  🏢 経歴
                </h2>
                <div className="space-y-4">
                  {profileData.career.map((item, index) => (
                    <div key={index} className="border-l-4 border-blue-600 pl-4">
                      <h3 className="font-semibold text-lg text-black">{item.company}</h3>
                      <p className="text-gray-600">{item.position}</p>
                      <p className="text-sm text-gray-500">{item.period}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 学歴 */}
            {profileData.education.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
                  🎓 学歴
                </h2>
                <div className="space-y-4">
                  {profileData.education.map((item, index) => (
                    <div key={index} className="border-l-4 border-green-500 pl-4">
                      <h3 className="font-semibold text-lg text-black">{item.school}</h3>
                      <p className="text-gray-600">{item.degree}</p>
                      <p className="text-sm text-gray-500">{item.year}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ポートフォリオ */}
            {profileData.portfolio.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
                  🌟 ポートフォリオ
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profileData.portfolio.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={400}
                          height={192}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg text-black mb-2">{item.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                        {item.url && (
                          <a 
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm font-medium"
                          >
                            プロジェクトを見る →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* シェアモーダル */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🔗</div>
              <h2 className="text-2xl font-bold text-black mb-2">プロフィールをシェア</h2>
              <p className="text-gray-600">このURLでプロフィールを共有できます</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  コピー
                </button>
              </div>
            </div>
            
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-500">
                ⚠️ このURLは一時的なものです。<br />
                公開すると正式なURLが発行されます。
              </p>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}