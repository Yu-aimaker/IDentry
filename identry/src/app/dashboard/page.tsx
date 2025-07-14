'use client';

import { useState, useEffect, ReactElement, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../../lib/auth-context';
import { getUserProfile, updateBlockVisibility, Profile, getProfileImageUrl, uploadProfileImage, updateProfile, updateProfileVisibility, getFormDataLocally, clearFormDataLocally, updateFullProfile } from '../../../lib/supabase';
import { IDCardProfile } from "../../../components/ui/IDCardProfile";
import { motion } from "framer-motion";
import { FaTwitter, FaGithub, FaInstagram, FaLinkedin, FaGlobe, FaLink, FaGraduationCap, FaLightbulb, FaFacebook, FaLine } from 'react-icons/fa';
import { Briefcase, User, QrCode, LogOut, Edit, Eye, Check, X, Settings, Share, Copy } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

// Reusable Switch component
function Switch({ checked, onChange }: { checked: boolean, onChange: (checked: boolean) => void }) {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
    );
}

// Reusable Section with edit/visibility controls
function Section({ title, icon, children, isPublic, onToggleVisibility, editHref }: { title: string, icon: ReactElement, children: React.ReactNode, isPublic?: boolean, onToggleVisibility?: () => void, editHref?: string }) {
  return (
    <motion.section 
      className="mb-12"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
            <div className="text-gray-500 bg-white/80 backdrop-blur-sm rounded-full p-3 mr-4 border border-gray-200/80 shadow-sm">{icon}</div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-wider">{title}</h2>
        </div>
        <div className="flex items-center gap-4">
            {onToggleVisibility && (
                 <div className="flex items-center gap-2">
                    <Switch checked={!!isPublic} onChange={onToggleVisibility} />
                    <span className="text-sm font-medium text-gray-600">{isPublic ? '公開' : '非公開'}</span>
                 </div>
            )}
            {editHref && (
                 <Link href={editHref} className="p-2 rounded-full hover:bg-gray-200/80 transition-colors">
                    <Edit className="w-5 h-5 text-gray-600" />
                 </Link>
            )}
        </div>
      </div>
      <div className="pl-4">{children}</div>
    </motion.section>
  );
}


function SNSLinks({ twitter, instagram, linkedin, github }: { twitter?: string, instagram?: string, linkedin?: string, github?: string }) {
    const sns = [
      { href: twitter ? `https://twitter.com/${twitter.replace(/^@/, "")}` : '', icon: <FaTwitter size={24} />, label: 'Twitter', show: !!twitter },
      { href: instagram ? `https://instagram.com/${instagram.replace(/^@/, "")}` : '', icon: <FaInstagram size={24} />, label: 'Instagram', show: !!instagram },
      { href: linkedin ? `https://linkedin.com/in/${linkedin.replace(/^@/, "")}` : '', icon: <FaLinkedin size={24} />, label: 'LinkedIn', show: !!linkedin },
      { href: github ? `https://github.com/${github.replace(/^@/, "")}` : '', icon: <FaGithub size={24} />, label: 'GitHub', show: !!github },
    ];
  
    return (
      <div className="flex flex-wrap gap-6 items-center">
        {sns.map((item, index) => item.show && (
          <a key={index} href={item.href} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-500 transition-colors duration-300 transform hover:scale-110" aria-label={item.label}>
            {item.icon}
          </a>
        ))}
        {!sns.some(s => s.show) && <p className="text-gray-500 text-sm">SNSアカウントがまだリンクされていません。</p>}
      </div>
    );
}

export default function MyPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [editingId, setEditingId] = useState(false);
  const [idValue, setIdValue] = useState('');
  const [idError, setIdError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  
  const [cardVariant, setCardVariant] = useState<'pasmo' | 'credit' | 'corporate' | 'metro' | 'custom'>('pasmo');
  const [customColor, setCustomColor] = useState('#8B5CF6');
  const hasSaved = useRef(false);
  
  useEffect(() => {
    const v = localStorage.getItem('card_variant') as 'pasmo' | 'credit' | 'corporate' | 'metro' | 'custom' | null;
    if (v) setCardVariant(v);
    const c = localStorage.getItem('custom_color');
    if (c) setCustomColor(c);
  }, []);

  // SNS共有メニューを外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showShareMenu) {
        const target = event.target as Element;
        if (!target.closest('[data-share-menu]')) {
          setShowShareMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        
        // Google認証後のローカルストレージ保存処理をチェック
        const shouldSaveFormData = localStorage.getItem('pending_form_data_save');
        if (shouldSaveFormData && !hasSaved.current) {
          hasSaved.current = true;
          const formData = getFormDataLocally();
          if (formData) {
            try {
              await updateFullProfile({
                name: formData.name || '',
                birth_year: formData.birthYear || '',
                birth_month: formData.birthMonth || '',
                birth_day: formData.birthDay || '',
                birth_date: formData.birthDate || '',
                gender: formData.gender || '',
                address: formData.address || '',
                photo: formData.photo || '',
                bio: formData.bio || '',
                twitter: formData.twitter || '',
                instagram: formData.instagram || '',
                linkedin: formData.linkedin || '',
                github: formData.github || '',
                skills: formData.skills || [],
                education: formData.education || [],
                career: formData.career || [],
                portfolio: formData.portfolio || []
              });
              
              // 保存後にクリーンアップ
              clearFormDataLocally();
              localStorage.removeItem('pending_form_data_save');
              console.log('Google認証後のフォームデータをDBに保存しました');
            } catch (error) {
              console.error('Google認証後のフォームデータ保存エラー:', error);
            }
          }
        }
        
        const userProfile = await getUserProfile();
        setProfile(userProfile);
        setIdValue(userProfile?.custom_id || '');
      } catch (error) {
        console.error('プロフィール取得エラー:', error);
      } finally {
        setLoadingProfile(false);
      }
    };
    loadProfile();
  }, [user, authLoading, router]);
  
  const handleToggleBlockVisibility = async (blockType: 'sns' | 'skills' | 'education' | 'career' | 'portfolio') => {
    if (!profile) return;
    const key = `show_${blockType}` as keyof Profile;
    const currentValue = profile[key];

    // Optimistic update
    setProfile(prev => prev ? { ...prev, [key]: !currentValue } as Profile : null);

    try {
      await updateBlockVisibility({ [key]: !currentValue });
    } catch (error) {
      console.error('公開設定更新エラー:', error);
      // Revert on error
      setProfile(prev => prev ? { ...prev, [key]: currentValue } as Profile : null);
      alert('更新に失敗しました。');
    }
  };

  const handleLogout = async () => {
    if (confirm('ログアウトしますか？')) {
      await signOut();
      router.push('/');
    }
  };

  const handleShowQRModal = () => {
    if (!publicProfileUrl) {
      alert('QRコードを表示するには、まずIDカードのIDを設定してください。');
      setEditingId(true);
      return;
    }
    setShowQRModal(true);
  };

  const handleVariantChange = (v: string) => {
    setCardVariant(v as 'pasmo' | 'credit' | 'corporate' | 'metro' | 'custom');
    localStorage.setItem('card_variant', v);
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    localStorage.setItem('custom_color', color);
  };

  const handleSaveId = async (newId: string) => {
    if (!profile) return;
    setIdError(null);
    try {
      await updateProfile({ custom_id: newId });
      const updated = await getUserProfile();
      setProfile(updated);
      setEditingId(false);
      setIdValue(newId);
    } catch (error) {
      console.error('ID更新エラー:', error);
      if (error instanceof Error) {
        setIdError(error.message);
      } else {
        setIdError('IDの更新に失敗しました');
      }
      throw error;
    }
  };

  const publicProfileUrl = profile?.custom_id ? `${window.location.origin}/preview?id=${profile.custom_id}` : null;

  const handleShareLink = async () => {
    if (!publicProfileUrl) {
      // カスタムIDが設定されていない場合の処理
      alert('公開ページのリンクを共有するには、まずIDカードのIDを設定してください。');
      setEditingId(true);
      return;
    }
    
    // SNS共有メニューの表示/非表示を切り替え
    setShowShareMenu(!showShareMenu);
  };

  const handleCopyLink = async () => {
    if (!publicProfileUrl) return;
    
    try {
      await navigator.clipboard.writeText(publicProfileUrl);
      setCopySuccess(true);
      setShowShareMenu(false);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('リンクのコピーに失敗しました:', error);
      // フォールバック: 古いブラウザ対応
      const textArea = document.createElement('textarea');
      textArea.value = publicProfileUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setShowShareMenu(false);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackError) {
        console.error('フォールバックコピーも失敗しました:', fallbackError);
        alert(`リンクをコピーできませんでした。手動でコピーしてください:\n${publicProfileUrl}`);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleSNSShare = (platform: string) => {
    if (!publicProfileUrl) return;
    
    const shareText = `${profile?.name || profile?.nickname || 'IDentry'}のプロフィールページをチェック！`;
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(publicProfileUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicProfileUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicProfileUrl)}`;
        break;
      case 'line':
        shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(publicProfileUrl)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 font-sans">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-center">
              <Image src="/img/banner.png" alt="IDentry Banner" width={320} height={60} className="h-12 w-auto object-contain mx-auto" />
            </div>
            <div className="flex items-center space-x-2 absolute right-4 top-1/2 -translate-y-1/2">
                <div className="relative" data-share-menu>
                  <button 
                    onClick={handleShareLink}
                    className={`p-2 rounded-full transition-colors ${
                      publicProfileUrl 
                        ? 'hover:bg-gray-200/80 text-gray-700' 
                        : 'hover:bg-orange-100 text-orange-600'
                    }`}
                    title={publicProfileUrl ? 'SNSで共有' : 'IDを設定してSNSで共有'}
                  >
                    <Share className="w-6 h-6" />
                  </button>
                  
                  {/* SNS共有メニュー */}
                  {showShareMenu && publicProfileUrl && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 min-w-[200px] z-50">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 mb-3">SNSで共有</p>
                        
                        <button
                          onClick={() => handleSNSShare('twitter')}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <FaTwitter className="w-5 h-5 text-blue-500" />
                          <span className="text-sm text-gray-700">Twitterで共有</span>
                        </button>
                        
                        <button
                          onClick={() => handleSNSShare('facebook')}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <FaFacebook className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-gray-700">Facebookで共有</span>
                        </button>
                        
                        <button
                          onClick={() => handleSNSShare('linkedin')}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <FaLinkedin className="w-5 h-5 text-blue-700" />
                          <span className="text-sm text-gray-700">LinkedInで共有</span>
                        </button>
                        
                        <button
                          onClick={() => handleSNSShare('line')}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          <FaLine className="w-5 h-5 text-green-500" />
                          <span className="text-sm text-gray-700">LINEで共有</span>
                        </button>
                        
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <button
                            onClick={handleCopyLink}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Copy className="w-5 h-5 text-gray-500" />
                            <span className="text-sm text-gray-700">リンクをコピー</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button 
                  onClick={handleShowQRModal} 
                  className={`p-2 rounded-full transition-colors ${
                    publicProfileUrl 
                      ? 'hover:bg-gray-200/80 text-gray-700' 
                      : 'hover:bg-orange-100 text-orange-600'
                  }`}
                  title={publicProfileUrl ? 'QRコードを表示' : 'IDを設定してQRコードを表示'}
                >
                  <QrCode className="w-6 h-6" />
                </button>
                <button onClick={handleLogout} className="p-2 rounded-full hover:bg-gray-200/80 transition-colors">
                    <LogOut className="w-6 h-6 text-red-500" />
                </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-1 lg:sticky top-28 h-full">
            <IDCardProfile
              profileData={{
                name: profile?.nickname || profile?.name || "",
                title: (profile?.bio || '').split('\n')[0] || "",
                department: "",
                employeeId: profile?.custom_id || "",
                joinDate: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ja-JP') : "",
                email: user?.email || "",
                avatar: getProfileImageUrl(profile) || undefined,
              }}
              variant={cardVariant}
              onVariantChange={handleVariantChange}
              customColor={customColor}
              onCustomColorChange={handleCustomColorChange}
              showPresetSelector
              enableAvatarUpload
              onAvatarUpload={async (file) => {
                if (!profile) return;
                const url = await uploadProfileImage(file);
                const { education, career, portfolio, ...profileFields } = profile;
                void education; void career; void portfolio;
                await updateProfile({ ...profileFields, photo: url });
                const updated = await getUserProfile();
                setProfile(updated);
              }}
              onSaveId={handleSaveId}
            />
            <div className="mt-6">
              {/* 公開/非公開スイッチ追加 */}
              <div className="flex items-center justify-center mb-4 gap-2">
                <Switch
                  checked={!!profile?.is_public}
                  onChange={async (checked) => {
                    if (!profile) return;
                    // 楽観的更新
                    setProfile(prev => prev ? { ...prev, is_public: checked } as Profile : null);
                    try {
                      // DB更新
                      await updateProfileVisibility(profile.id, checked);
                    } catch {
                      // 失敗時は元に戻す
                      setProfile(prev => prev ? { ...prev, is_public: !checked } as Profile : null);
                      alert('公開設定の更新に失敗しました');
                    }
                  }}
                />
                <span className="text-sm font-medium text-gray-600">{profile?.is_public ? '公開中' : '非公開'}</span>
              </div>
              {publicProfileUrl ? (
                <a 
                  href={publicProfileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Eye className="w-5 h-5" />
                  <span>公開ページをプレビュー</span>
                </a>
              ) : (
                <div className="space-y-3">
                  {/* ID登録ボタンとフォーム */}
                  {!editingId ? (
                    <div className="text-center bg-gradient-to-br from-orange-50 to-red-50 border border-dashed border-orange-300 p-4 rounded-xl">
                      <p className="text-sm text-gray-600 font-medium mb-2">公開ページはまだありません。</p>
                      <p className="text-xs text-gray-500 mb-4">IDカードのIDを設定すると有効になります。</p>
                      <button
                        onClick={() => setEditingId(true)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <Settings className="w-5 h-5" />
                        <span>IDを登録する</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          IDを設定してください
                        </label>
                        <input
                          type="text"
                          value={idValue}
                          onChange={(e) => {
                            setIdValue(e.target.value);
                            setIdError(null);
                          }}
                          placeholder="例: my-profile-id"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          maxLength={32}
                        />
                        {idError && (
                          <p className="text-xs text-red-500">{idError}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              try {
                                await handleSaveId(idValue);
                              } catch {
                                // エラーは handleSaveId 内で処理される
                              }
                            }}
                            className="flex-1 flex items-center justify-center gap-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            <span>保存</span>
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(false);
                              setIdValue(profile?.custom_id || '');
                              setIdError(null);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 bg-gray-500 text-white py-2 px-3 rounded-lg hover:bg-gray-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            <span>キャンセル</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2">
            <Section title="自己紹介" icon={<User size={24} />} editHref="/create?edit=true&section=bio">
              {profile?.bio ? (
                <p className="text-base text-gray-700 whitespace-pre-line leading-relaxed bg-white/60 p-6 rounded-xl border border-gray-200/80">
                  {profile.bio}
                </p>
              ) : (
                <div className="text-center py-10 bg-white/60 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">自己紹介がまだありません。</p>
                    <Link href="/create?edit=true&section=bio" className="mt-2 text-blue-600 hover:underline font-medium">追加する</Link>
                </div>
              )}
            </Section>

            <Section title="SNS" icon={<FaLink size={20} />} isPublic={profile?.show_sns} onToggleVisibility={() => handleToggleBlockVisibility('sns')} editHref="/create?edit=true&section=sns">
                <div className="bg-white/60 p-6 rounded-xl border border-gray-200/80">
                  <SNSLinks {...profile} />
                </div>
            </Section>

            <Section title="スキル" icon={<FaLightbulb size={24} />} isPublic={profile?.show_skills} onToggleVisibility={() => handleToggleBlockVisibility('skills')} editHref="/create?edit=true&section=skills">
                <div className="flex flex-wrap gap-3 bg-white/60 p-6 rounded-xl border border-gray-200/80 min-h-[80px] items-center">
                  {profile?.skills && profile.skills.length > 0 ? profile.skills.map((skill: string, i: number) => (
                    <span key={i} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">{skill}</span>
                  )) : <p className="text-gray-500 text-sm">スキルがまだ登録されていません。</p>}
                </div>
            </Section>

            <Section title="学歴" icon={<FaGraduationCap size={24} />} isPublic={profile?.show_education} onToggleVisibility={() => handleToggleBlockVisibility('education')} editHref="/create?edit=true&section=education">
                <div className="space-y-4">
                  {profile?.education && profile.education.length > 0 ? profile.education.map((edu, i) => (
                     <div key={i} className="bg-white/60 p-6 rounded-xl border border-gray-200/80">
                        <p className="font-bold text-lg text-gray-800">{edu.school}</p>
                        <p className="text-gray-600">{edu.degree}</p>
                        <p className="text-sm text-gray-500 mt-1">{edu.year}</p>
                    </div>
                  )) : <p className="text-gray-500 text-sm pl-2">学歴がまだ登録されていません。</p>}
                </div>
            </Section>

            <Section title="経歴" icon={<Briefcase size={24} />} isPublic={profile?.show_career} onToggleVisibility={() => handleToggleBlockVisibility('career')} editHref="/create?edit=true&section=career">
                <div className="space-y-4">
                  {profile?.career && profile.career.length > 0 ? profile.career.map((car, i) => (
                    <div key={i} className="bg-white/60 p-6 rounded-xl border border-gray-200/80">
                      <p className="font-bold text-lg text-gray-800">{car.company}</p>
                      <p className="text-gray-600">{car.position}</p>
                      <p className="text-sm text-gray-500 mt-1">{car.period}</p>
                    </div>
                  )) : <p className="text-gray-500 text-sm pl-2">経歴がまだ登録されていません。</p>}
                </div>
            </Section>

            <Section title="ポートフォリオ" icon={<FaGlobe size={24} />} isPublic={profile?.show_portfolio} onToggleVisibility={() => handleToggleBlockVisibility('portfolio')} editHref="/create?edit=true&section=portfolio">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[120px]">
                    {profile?.portfolio && profile.portfolio.length > 0 ? profile.portfolio.map((port, i) => (
                        <a href={port.url || undefined} key={i} target="_blank" rel="noopener noreferrer" className="block bg-white/60 rounded-xl border border-gray-200/80 overflow-hidden group transition-all transform hover:-translate-y-1 hover:shadow-lg">
                          {port.image && <Image src={port.image} alt={port.title} width={400} height={250} className="w-full h-40 object-cover" />}
                          <div className="p-4">
                            <h4 className="font-bold text-gray-800">{port.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{port.description}</p>
                          </div>
                        </a>
                    )) : <p className="text-gray-500 text-sm pl-2">ポートフォリオがまだ登録されていません。</p>}
                </div>
            </Section>

          </div>
        </div>
      </main>
      
      {showQRModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowQRModal(false)}>
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">マイページのQRコード</h3>
                {publicProfileUrl && <QRCodeCanvas value={publicProfileUrl} size={256} />}
                <p className="text-sm text-gray-600 mt-4 max-w-xs">{publicProfileUrl}</p>
                <button onClick={() => setShowQRModal(false)} className="mt-6 bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors">閉じる</button>
            </div>
        </div>
      )}

      {/* コピー完了トースト */}
      {copySuccess && (
        <div className="fixed bottom-6 right-6 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 z-50 transition-all duration-300 ease-in-out transform translate-y-0">
          <div className="flex items-center gap-2">
            <span className="text-green-500">✅</span>
            <span className="text-sm font-medium text-gray-700">コピー完了</span>
          </div>
        </div>
      )}
    </div>
  );
}