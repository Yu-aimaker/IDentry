'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../../lib/auth-context';
import { getUserProfile, updateBlockVisibility, Profile, getProfileImageUrl, uploadProfileImage, updateFullProfile } from '../../../lib/supabase';
import { IDCardProfile } from "../../../components/ui/IDCardProfile";
import { Github, Twitter, Instagram, Linkedin } from "lucide-react";
import { QRCodeCanvas } from 'qrcode.react';

export default function MyPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const getInitialVariant = (): 'pasmo' | 'credit' | 'corporate' | 'metro' => {
    if (typeof window !== 'undefined') {
      const v = localStorage.getItem('card_variant');
      if (v === 'pasmo' || v === 'credit' || v === 'corporate' || v === 'metro') return v;
    }
    return 'pasmo';
  };
  const [cardVariant, setCardVariant] = useState<'pasmo' | 'credit' | 'corporate' | 'metro'>(getInitialVariant);
  const [showPreset, setShowPreset] = useState(false);
  const cardAreaRef = useRef<HTMLDivElement>(null);

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
      } catch (error) {
        console.error('プロフィール取得エラー:', error);
      }
    };

    loadProfile();
  }, [user, loading, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const v = localStorage.getItem('card_variant');
      if (v === 'pasmo' || v === 'credit' || v === 'corporate' || v === 'metro') setCardVariant(v);
    }
  }, []);

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

  const handleVariantChange = (v: string) => {
    setCardVariant(v as 'pasmo' | 'credit' | 'corporate' | 'metro');
    if (typeof window !== 'undefined') localStorage.setItem('card_variant', v);
    setShowPreset(false);
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
                <Link href="/" className="flex items-center">
                  <Image
                    src="/img/banner.png"
                    alt="IDentry Banner"
                    width={160}
                    height={64}
                    className="h-10 object-contain cursor-pointer hover:opacity-80 transition-opacity duration-200"
                  />
                </Link>
                
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">こんにちは、{profile?.nickname || profile?.name || 'ユーザー'}さん</span>
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
                {/* カード中央寄せ・大きさ調整＋ボタン配置 */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-full max-w-md relative" ref={cardAreaRef}>
                    {/* デザイン変更ボタン */}
                    <button
                      className="absolute top-2 right-2 z-10 bg-white/80 border border-gray-200 rounded-full px-3 py-1 text-xs font-medium shadow hover:bg-white"
                      onClick={() => setShowPreset((v) => !v)}
                    >
                      デザイン変更
                    </button>
                    {/* プリセット選択UI（ポップオーバー） */}
                    {showPreset && (
                      <div className="absolute top-10 right-0 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-64">
                        <IDCardProfile
                          showPresetSelector
                          variant={cardVariant}
                          onVariantChange={handleVariantChange}
                        />
                        <button
                          className="mt-4 w-full text-sm text-gray-500 hover:text-black"
                          onClick={() => setShowPreset(false)}
                        >閉じる</button>
                      </div>
                    )}
                    <IDCardProfile
                      profileData={{
                        name: profile.nickname || profile.name,
                        title: profile.bio || "",
                        department: "",
                        employeeId: profile.id || "",
                        joinDate: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "",
                        email: user?.email || "",
                        avatar: getProfileImageUrl(profile) || undefined,
                      }}
                      variant={cardVariant}
                      enableAvatarUpload
                      onAvatarUpload={async (file) => {
                        // 画像アップロード→プロフィール更新→再取得
                        const url = await uploadProfileImage(file);
                        await updateFullProfile({ ...profile, photo: url });
                        const updated = await getUserProfile();
                        setProfile(updated);
                      }}
                    />
                  </div>
                  {/* 新・詳細セクション */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                    {/* スキル */}
                    {profile.skills && profile.skills.length > 0 && (
                      <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col">
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">💡 スキル</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill: string, i: number) => (
                            <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* SNSリンク */}
                    {(profile.twitter || profile.instagram || profile.linkedin || profile.github) && (
                      <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col">
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">🔗 SNS</h3>
                        <div className="flex gap-4 items-center">
                          {profile.twitter && (
                            <a href={`https://twitter.com/${profile.twitter.replace(/^@/,"")}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">
                              <Twitter className="w-6 h-6" />
                            </a>
                          )}
                          {profile.instagram && (
                            <a href={`https://instagram.com/${profile.instagram.replace(/^@/,"")}`} target="_blank" rel="noopener noreferrer" className="hover:text-pink-500">
                              <Instagram className="w-6 h-6" />
                            </a>
                          )}
                          {profile.linkedin && (
                            <a href={`https://linkedin.com/in/${profile.linkedin.replace(/^@/,"")}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-700">
                              <Linkedin className="w-6 h-6" />
                            </a>
                          )}
                          {profile.github && (
                            <a href={`https://github.com/${profile.github.replace(/^@/,"")}`} target="_blank" rel="noopener noreferrer" className="hover:text-gray-800">
                              <Github className="w-6 h-6" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                    {/* 経歴 */}
                    {((profile as any).career ?? []).length > 0 && (
                      <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col">
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">🏢 経歴</h3>
                        <ul className="space-y-2">
                          {((profile as any).career as {company:string,position?:string,period?:string}[]).map((item, i) => (
                            <li key={i} className="border-l-4 border-blue-400 pl-4">
                              <div className="font-semibold">{item.company}</div>
                              <div className="text-sm text-gray-600">{item.position}</div>
                              <div className="text-xs text-gray-400">{item.period}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* 学歴 */}
                    {((profile as any).education ?? []).length > 0 && (
                      <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col">
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">🎓 学歴</h3>
                        <ul className="space-y-2">
                          {((profile as any).education as {school:string,degree?:string,year?:string}[]).map((item, i) => (
                            <li key={i} className="border-l-4 border-green-400 pl-4">
                              <div className="font-semibold">{item.school}</div>
                              <div className="text-sm text-gray-600">{item.degree}</div>
                              <div className="text-xs text-gray-400">{item.year}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* ポートフォリオ */}
                    {((profile as any).portfolio ?? []).length > 0 && (
                      <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col md:col-span-2">
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">🌟 ポートフォリオ</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {((profile as any).portfolio as {title:string,description?:string,url?:string,image?:string}[]).map((item, i) => (
                            <div key={i} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
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
                                <div className="font-semibold text-lg mb-1">{item.title}</div>
                                <div className="text-gray-600 text-sm mb-2">{item.description}</div>
                                {item.url && (
                                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-medium">
                                    プロジェクトを見る →
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* ボタン群 */}
                  <div className="flex gap-4 justify-center mt-6">
                    <Link href="/preview" className="border-2 border-blue-600 text-blue-600 bg-white px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors font-semibold">プレビュー</Link>
                    <button
                      onClick={() => setShowQRModal(true)}
                      className="border-2 border-orange-500 text-orange-500 bg-white px-6 py-2 rounded-lg hover:bg-orange-50 transition-colors font-semibold"
                    >
                      共有
                    </button>
                    <Link href="/create?edit=true" className="border-2 border-gray-400 text-gray-600 bg-white px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors font-semibold">編集</Link>
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
              <h2 className="text-2xl font-bold text-black mb-4">共有・QRコード</h2>
              <p className="text-gray-600 mb-6">{profile.nickname || profile.name}</p>
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                {profile.profile_url ? (
                  <QRCodeCanvas value={profile.profile_url} size={180} />
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-2">📱</div>
                    <p className="text-sm text-gray-500">QRコード</p>
                    <p className="text-xs text-gray-400 mt-1">URL未設定</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                このQRコードまたはURLをシェアできます
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => copyToClipboard(profile.profile_url)}
                  className="w-full border-2 border-blue-600 text-blue-600 bg-white py-2 rounded-lg hover:bg-blue-50 font-semibold"
                >
                  URLをコピー
                </button>
                <div className="w-full break-all text-xs text-gray-500 bg-gray-50 rounded p-2 mb-2">{profile.profile_url}</div>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="w-full border-2 border-gray-400 text-gray-600 bg-white py-2 rounded-lg hover:bg-gray-50 font-semibold"
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