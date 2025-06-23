'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../../lib/auth-context';
import { getUserProfile, updateProfile, updateBlockVisibility, uploadProfileImage, Profile } from '../../../lib/supabase';

export default function MyPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nickname, setNickname] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      if (loading) return;
      
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const userProfile = await getUserProfile();
        setProfile(userProfile);
        setNickname(userProfile?.nickname || userProfile?.name || '');
      } catch (error) {
        console.error('プロフィール取得エラー:', error);
      }
    };

    loadProfile();
  }, [user, loading, router]);

  const handleUpdateNickname = async () => {
    if (!profile) return;
    
    try {
      const updatedProfile = await updateProfile({ nickname });
      setProfile(updatedProfile);
      setIsEditingNickname(false);
    } catch (error) {
      console.error('ニックネーム更新エラー:', error);
    }
  };

  const handleToggleBlockVisibility = async (blockType: string, currentValue: boolean) => {
    if (!profile) return;

    try {
      const updateData = { [`show_${blockType}`]: !currentValue };
      await updateBlockVisibility(updateData);
      setProfile(prev => prev ? { ...prev, ...updateData } : null);
    } catch (error) {
      console.error('公開設定更新エラー:', error);
    }
  };

  const handleLogout = async () => {
    if (confirm('ログアウトしますか？')) {
      try {
        await signOut();
        router.push('/');
      } catch (error) {
        console.error('ログアウトエラー:', error);
      }
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

  // プロフィール画像アップロード処理
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB制限
      alert('ファイルサイズは5MB以下にしてください');
      return;
    }

    setIsUploadingImage(true);
    try {
      const imageUrl = await uploadProfileImage(file);
      const updatedProfile = await updateProfile({ photo: imageUrl });
      setProfile(updatedProfile);
      console.log('プロフィール画像更新成功:', imageUrl);
    } catch (error) {
      console.error('プロフィール画像更新失敗:', error);
      alert('画像のアップロードに失敗しました。もう一度お試しください。');
    } finally {
      setIsUploadingImage(false);
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
            <div className="max-w-4xl mx-auto px-4 py-4">
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

          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* ページタイトル */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black mb-2">マイページ</h1>
              <p className="text-gray-600">あなたのプロフィールを管理・編集できます</p>
            </div>

            {!profile ? (
              /* プロフィール未作成 */
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
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
              /* プロフィール管理エリア */
              <div className="space-y-6">
                {/* バナー・アイコンエリア */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  {/* バナー画像 */}
                  <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                    <button className="absolute top-4 right-4 bg-white/20 text-white px-3 py-1 rounded-lg text-sm hover:bg-white/30 transition-colors">
                      バナー変更
                    </button>
                  </div>
                  
                  {/* プロフィール情報 */}
                  <div className="p-6 -mt-16 relative">
                    <div className="flex items-end space-x-4 mb-4">
                      {/* アイコン */}
                      <div className="relative">
                        <div className="w-24 h-24 bg-gray-200 rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                          {profile.photo ? (
                            <Image
                              src={profile.photo}
                              alt="プロフィール画像"
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl text-gray-500">👤</span>
                          )}
                        </div>
                        
                        {/* アップロード中のオーバーレイ */}
                        {isUploadingImage && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          </div>
                        )}
                        
                        {/* ファイル選択ボタン */}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                          className="hidden"
                          id="profile-image-upload"
                          disabled={isUploadingImage}
                        />
                        <label
                          htmlFor="profile-image-upload"
                          className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                          ✏️
                        </label>
                      </div>
                      
                      {/* 名前・ニックネーム */}
                      <div className="flex-1 pb-2">
                        {isEditingNickname ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={nickname}
                              onChange={(e) => setNickname(e.target.value)}
                              className="text-xl font-bold text-black border-b-2 border-blue-600 bg-transparent focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={handleUpdateNickname}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setIsEditingNickname(false)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <h2 className="text-xl font-bold text-black">
                              {profile.nickname || profile.name}
                            </h2>
                            <button
                              onClick={() => setIsEditingNickname(true)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              ✏️
                            </button>
                          </div>
                        )}
                        <p className="text-gray-600 text-sm">{profile.bio}</p>
                      </div>
                    </div>

                    {/* アクションボタン */}
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href="/create"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        ✏️ プロフィール編集
                      </Link>
                      
                      <Link
                        href="/preview"
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        👀 プレビュー
                      </Link>
                      
                      <button
                        onClick={() => setShowQRModal(true)}
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
                    </div>
                  </div>
                </div>

                {/* ブロック公開設定 */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-black mb-4">ブロック公開設定</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'education', label: '学歴', value: profile.show_education },
                      { key: 'career', label: '職歴', value: profile.show_career },
                      { key: 'portfolio', label: 'ポートフォリオ', value: profile.show_portfolio },
                      { key: 'skills', label: 'スキル', value: profile.show_skills },
                      { key: 'sns', label: 'SNSリンク', value: profile.show_sns },
                    ].map((block) => (
                      <div key={block.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">{block.label}</span>
                        <button
                          onClick={() => handleToggleBlockVisibility(block.key, block.value)}
                          className={`w-12 h-6 rounded-full transition-colors relative ${
                            block.value ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                              block.value ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 統計情報 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-gray-100">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-2xl">👁️</span>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">総閲覧数</p>
                        <p className="text-2xl font-bold text-black">{profile.views_count || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl border border-gray-100">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-2xl">🌐</span>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">公開状態</p>
                        <p className="text-lg font-bold text-black">
                          {profile.is_public ? '公開中' : '非公開'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl border border-gray-100">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-2xl">📅</span>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">作成日</p>
                        <p className="text-sm font-medium text-black">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* QRコードモーダル */}
      {showQRModal && profile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-black mb-4">QRコード</h2>
              <p className="text-gray-600 mb-6">{profile.nickname || profile.name}</p>
              
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
                  onClick={() => copyToClipboard(profile.profile_url)}
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