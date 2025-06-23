'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { getUserProfiles, Profile } from '../../../lib/supabase';

export default function DashboardPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadProfiles = async () => {
      if (loading) return;
      
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const userProfiles = await getUserProfiles();
        setProfiles(userProfiles);
      } catch (error) {
        console.error('プロフィール取得エラー:', error);
      }
    };

    loadProfiles();
  }, [user, loading, router]);

  const handleToggleVisibility = (profileId: string) => {
    setProfiles(prev => 
      prev.map(profile => 
        profile.id === profileId 
          ? { ...profile, is_public: !profile.is_public }
          : profile
      )
    );
  };

  const handleDeleteProfile = (profileId: string) => {
    if (confirm('本当にこのプロフィールを削除しますか？この操作は取り消せません。')) {
      setProfiles(prev => prev.filter(profile => profile.id !== profileId));
    }
  };

  const handleShowQR = (profile: Profile) => {
    setSelectedProfile(profile);
    setShowQRModal(true);
  };

  const handleLogout = () => {
    if (confirm('ログアウトしますか？')) {
      router.push('/');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('URLをクリップボードにコピーしました！');
    } catch (err) {
      console.error('コピーに失敗しました:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 認証状態の読み込み中 */}
      {loading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      )}

      {/* 認証済みでロード完了後の表示 */}
      {!loading && user && (
        <>
          {/* ヘッダー */}
          <header className="bg-white border-b border-gray-100">
            <div className="max-w-6xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">ID</span>
                  </div>
                  <span className="text-xl font-bold text-black">IDentry</span>
                </Link>
                
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">こんにちは、{user?.email}さん</span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    ログアウト
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-6xl mx-auto px-4 py-8">
            {/* ページタイトル */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black mb-2">ダッシュボード</h1>
              <p className="text-gray-600">あなたのプロフィールを管理できます</p>
            </div>

            {/* 統計情報 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl border border-gray-100">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">総閲覧数</p>
                    <p className="text-2xl font-bold text-black">
                      {profiles.reduce((total, profile) => total + (profile.views_count || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-100">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">プロフィール数</p>
                    <p className="text-2xl font-bold text-black">{profiles.length || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-100">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">🌐</span>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">公開中</p>
                    <p className="text-2xl font-bold text-black">
                      {profiles.filter(profile => profile.is_public).length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="mb-8">
              <Link
                href="/create"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <span className="text-xl">+</span>
                <span>新しいプロフィールを作成</span>
              </Link>
            </div>

            {/* プロフィール一覧 */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-black">あなたのプロフィール</h2>
              </div>

              {profiles.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-black mb-2">プロフィールがありません</h3>
                  <p className="text-gray-600 mb-6">最初のプロフィールを作成してみましょう！</p>
                  <Link
                    href="/create"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                  >
                    プロフィールを作成
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1 mb-4 lg:mb-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-black">{profile.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              profile.is_public 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {profile.is_public ? '公開中' : '非公開'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{profile.bio}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>👁️ {profile.views_count || 0} 回閲覧</span>
                            <span>📅 作成日: {profile.created_at}</span>
                            <span>✏️ 更新日: {profile.updated_at}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/preview?id=${profile.id}`}
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                          >
                            👀 プレビュー
                          </Link>
                          
                          <Link
                            href={`/create?edit=${profile.id}`}
                            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                          >
                            ✏️ 編集
                          </Link>
                          
                          <button
                            onClick={() => handleShowQR(profile)}
                            className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                          >
                            📱 QRコード
                          </button>
                          
                          <button
                            onClick={() => copyToClipboard(profile.profile_url)}
                            className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors text-sm"
                          >
                            🔗 URLコピー
                          </button>
                          
                          <button
                            onClick={() => handleToggleVisibility(profile.id)}
                            className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                              profile.is_public
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {profile.is_public ? '🔒 非公開にする' : '🌐 公開する'}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteProfile(profile.id)}
                            className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm"
                          >
                            🗑️ 削除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* QRコードモーダル - 認証状態に関係なく表示 */}
      {showQRModal && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-black mb-4">QRコード</h2>
              <p className="text-gray-600 mb-6">{selectedProfile.name}</p>
              
              {/* QRコードプレースホルダー */}
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">📱</div>
                  <p className="text-sm text-gray-500">QRコード</p>
                  <p className="text-xs text-gray-400 mt-1">実装予定</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                このQRコードをスキャンすると<br />
                プロフィールページが開きます
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => copyToClipboard(selectedProfile.profile_url)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  URLをコピー
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}