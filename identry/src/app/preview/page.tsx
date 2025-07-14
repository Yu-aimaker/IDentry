'use client';

import { useState, useEffect, Suspense, ReactElement } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { getProfileByCustomId, getProfileImageUrl, Profile, getUserProfile, getFormDataLocally, getPortfolioOGPImage } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth-context';
import { IDCardProfile } from "../../../components/ui/IDCardProfile";
import { motion } from "framer-motion";
import { FaTwitter, FaGithub, FaInstagram, FaLinkedin, FaGlobe, FaLink, FaGraduationCap, FaLightbulb } from 'react-icons/fa';
import { Briefcase, User, ExternalLink, FileQuestion } from 'lucide-react';

// ローカルストレージベースのプロフィールデータ型
interface LocalProfileData {
  name: string;
  photo: string;
  bio: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  github: string;
  skills: string[];
  google_avatar_url?: string;
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

// ポートフォリオアイテムコンポーネント
function PortfolioItem({ portfolio }: { portfolio: { title: string; description?: string; url?: string; image?: string } }) {
  const [ogpImage, setOgpImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadOGPImage = async () => {
      if (portfolio.url) {
        try {
          const image = await getPortfolioOGPImage(portfolio.url);
          setOgpImage(image);
        } catch (error) {
          console.error('OGP画像の取得に失敗しました:', error);
        }
      }
    };

    loadOGPImage();
  }, [portfolio.url]);

  const displayImage = portfolio.image || ogpImage;

  return (
    <a 
      href={portfolio.url || undefined} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="block bg-white/60 rounded-xl border border-gray-200/80 overflow-hidden group transition-all transform hover:-translate-y-1 hover:shadow-lg"
    >
      {displayImage && !imageError ? (
        <div className="relative w-full h-40 bg-gray-100">
          <Image 
            src={displayImage} 
            alt={portfolio.title} 
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <FaGlobe className="text-4xl text-blue-300" />
        </div>
      )}
      <div className="p-4">
        <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{portfolio.title}</h4>
        <p className="text-sm text-gray-600 mt-1">{portfolio.description}</p>
        {portfolio.url && (
          <div className="flex items-center mt-2 text-xs text-blue-500">
            <ExternalLink className="w-3 h-3 mr-1" />
            <span>{portfolio.url.replace(/https?:\/\//, '')}</span>
          </div>
        )}
      </div>
    </a>
  );
}

function Section({ title, icon, children }: { title: string, icon: ReactElement, children: React.ReactNode }) {
  return (
    <motion.section 
      className="mb-12"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="flex items-center mb-6">
        <div className="text-gray-500 bg-white/80 backdrop-blur-sm rounded-full p-3 mr-4 border border-gray-200/80 shadow-sm">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 tracking-wider">{title}</h2>
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
    <div className="flex flex-wrap gap-4 items-center">
      {sns.map((item, index) => item.show && (
        <a 
          key={index}
          href={item.href} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-gray-500 hover:text-blue-500 transition-colors duration-300 transform hover:scale-110"
          aria-label={item.label}
        >
          {item.icon}
        </a>
      ))}
      {!sns.some(s => s.show) && (
        <p className="text-gray-500 text-sm">SNSアカウントがまだリンクされていません。</p>
      )}
    </div>
  );
}

function PreviewPageContent() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [localProfile, setLocalProfile] = useState<LocalProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  
  const customId = searchParams.get('id');
  const isFromEdit = searchParams.get('from') === 'edit';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. IDが指定されている場合はDBからプロフィールを取得
        if (customId) {
          const userProfile = await getProfileByCustomId(customId);
          if (userProfile) {
            setProfile(userProfile);
            setLocalProfile(null);
          } else {
            setProfile(null);
            setLocalProfile(null);
          }
        }
        // 2. ログインユーザーで、IDが指定されていない場合はユーザーのプロフィールを取得
        else if (user) {
          const userProfile = await getUserProfile();
          if (userProfile) {
            setProfile(userProfile);
            setLocalProfile(null);
          } else {
            // プロフィールがない場合はローカルストレージから取得
            const savedData = getFormDataLocally();
            if (savedData) {
              setLocalProfile({
                name: savedData.name || 'サンプル太郎',
                photo: savedData.photo || '',
                bio: savedData.bio || '',
                twitter: savedData.twitter || '',
                instagram: savedData.instagram || '',
                linkedin: savedData.linkedin || '',
                github: savedData.github || '',
                skills: savedData.skills || [],
                google_avatar_url: savedData.google_avatar_url || '',
                education: savedData.education || [],
                career: savedData.career || [],
                portfolio: savedData.portfolio || []
              });
            }
            setProfile(null);
          }
        }
        // 3. 未ログインの場合はローカルストレージから取得
        else {
          const savedData = getFormDataLocally();
          if (savedData) {
            setLocalProfile({
              name: savedData.name || 'サンプル太郎',
              photo: savedData.photo || '',
              bio: savedData.bio || '',
              twitter: savedData.twitter || '',
              instagram: savedData.instagram || '',
              linkedin: savedData.linkedin || '',
              github: savedData.github || '',
              skills: savedData.skills || [],
              google_avatar_url: savedData.google_avatar_url || '',
              education: savedData.education || [],
              career: savedData.career || [],
              portfolio: savedData.portfolio || []
            });
          } else {
            // デフォルトデータを設定
            setLocalProfile({
              name: 'サンプル太郎',
              photo: '',
              bio: 'まだ自己紹介が入力されていません。',
              twitter: '',
              instagram: '',
              linkedin: '',
              github: '',
              skills: [],
              education: [],
              career: [],
              portfolio: []
            });
          }
          setProfile(null);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setProfile(null);
        setLocalProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customId, user]);

  const cardVariant = typeof window !== 'undefined' ? (localStorage.getItem('card_variant') as 'pasmo' | 'credit' | 'corporate' | 'metro' || 'pasmo') : 'pasmo';

  const handlePublish = () => {
    alert('プロフィールを公開するには新規登録が必要です。入力されたデータは保持されます。');
    router.push('/login?mode=signup');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">プロフィールを読み込み中...</p>
        </div>
      </div>
    );
  }

  // IDが指定されたがプロフィールが見つからない場合（404）
  if (customId && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200/80 p-8 text-center"
        >
          <div className="mx-auto mb-6 flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full">
            <FileQuestion className="w-12 h-12 text-blue-500" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            お探しのページは見つかりませんでした
          </h1>
          <p className="text-gray-600 mb-8 max-w-sm mx-auto">
            ご指定のIDのプロフィールは存在しないか、持ち主によって非公開に設定されているようです。
          </p>
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            ホームに戻る
          </Link>
        </motion.div>
      </div>
    );
  }

  // データが全くない場合は何も表示しない（通常起こらない）
  if (!profile && !localProfile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">データが見つかりません。</p>
      </div>
    );
  }

  // プロフィールデータの準備（DBプロフィールまたはローカルプロフィール）
  const isLocalPreview = !profile && !!localProfile;

  return (
    <div className="bg-gray-50/50 font-sans">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-center">
              <Link href="/">
                <Image
                  src="/img/banner.png"
                  alt="IDentry Banner"
                  width={320}
                  height={60}
                  className="h-12 w-auto object-contain mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>
            <div className="flex items-center space-x-4 absolute right-4 top-1/2 -translate-y-1/2">
              {user && isFromEdit ? (
                <Link
                  href="/create?edit=true"
                  className="text-gray-600 hover:text-black transition-colors text-sm font-medium"
                >
                  ← 編集に戻る
                </Link>
              ) : isLocalPreview ? (
                <Link
                  href="/create"
                  className="text-gray-600 hover:text-black transition-colors text-sm font-medium"
                >
                  ← 編集に戻る
                </Link>
              ) : null}
              
              {isLocalPreview && !user && (
                <button
                  onClick={handlePublish}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  公開する
                </button>
              )}
              
              {user && profile && user.id === profile.user_id ? (
                <Link
                  href="/dashboard"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  マイページに戻る
                </Link>
              ) : !user && !isLocalPreview && (
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-black transition-colors text-sm font-medium"
                >
                  ログイン
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* プレビュー通知 */}
      {isLocalPreview && (
        <div className="bg-blue-50 border-b border-blue-100">
          <div className="max-w-4xl mx-auto px-4 py-3 text-center">
            <p className="text-blue-800">
              <span className="font-medium">👀 プレビューモード</span> - 
              これはあなたのプロフィールがどのように表示されるかのプレビューです
            </p>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column (Sticky) */}
          <div className="lg:col-span-1 lg:sticky top-28 h-full">
            <IDCardProfile
              profileData={{
                name: (profile?.nickname || profile?.name || localProfile?.name) || "",
                title: (profile?.bio || localProfile?.bio || '').split('\n')[0] || "",
                department: "",
                employeeId: profile?.custom_id || "",
                joinDate: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ja-JP') : "",
                email: user?.email || "",
                avatar: profile ? getProfileImageUrl(profile) || undefined : (localProfile?.photo || localProfile?.google_avatar_url || undefined),
              }}
              variant={cardVariant}
            />
          </div>

          {/* Right Column (Scrollable) */}
          <div className="lg:col-span-2">
            {/* 自己紹介 */}
            {(profile?.bio || localProfile?.bio) && (
              <Section title="自己紹介" icon={<User size={24} />}>
                <p className="text-base text-gray-700 whitespace-pre-line leading-relaxed bg-white/60 p-6 rounded-xl border border-gray-200/80">
                  {profile?.bio || localProfile?.bio}
                </p>
              </Section>
            )}

            {/* SNS欄 */}
            {((!profile || profile.show_sns) && 
              ((profile?.twitter || profile?.instagram || profile?.linkedin || profile?.github) || 
               (localProfile?.twitter || localProfile?.instagram || localProfile?.linkedin || localProfile?.github))) && (
              <Section title="SNS" icon={<FaLink size={20} />}>
                <div className="bg-white/60 p-6 rounded-xl border border-gray-200/80">
                  <SNSLinks 
                    twitter={profile?.twitter || localProfile?.twitter}
                    instagram={profile?.instagram || localProfile?.instagram}
                    linkedin={profile?.linkedin || localProfile?.linkedin}
                    github={profile?.github || localProfile?.github}
                  />
                </div>
              </Section>
            )}

            {/* スキル欄 */}
            {((!profile || profile.show_skills) && 
              ((profile?.skills && profile.skills.length > 0) || 
               (localProfile?.skills && localProfile.skills.length > 0))) && (
              <Section title="スキル" icon={<FaLightbulb size={24} />}>
                <div className="flex flex-wrap gap-3 bg-white/60 p-6 rounded-xl border border-gray-200/80">
                  {(profile?.skills || localProfile?.skills || []).map((skill: string, i: number) => (
                    <span key={i} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* 学歴欄 */}
            {((!profile || profile.show_education) && 
              ((profile?.education && profile.education.length > 0) || 
               (localProfile?.education && localProfile.education.length > 0))) && (
              <Section title="学歴" icon={<FaGraduationCap size={24} />}>
                <div className="space-y-4">
                  {(profile?.education || localProfile?.education || []).map((edu, i) => (
                     <div key={i} className="bg-white/60 p-6 rounded-xl border border-gray-200/80 transition-shadow hover:shadow-md">
                        <p className="font-bold text-lg text-gray-800">{edu.school}</p>
                        <p className="text-gray-600">{edu.degree}</p>
                        <p className="text-sm text-gray-500 mt-1">{edu.year}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* 経歴欄 */}
            {((!profile || profile.show_career) && 
              ((profile?.career && profile.career.length > 0) || 
               (localProfile?.career && localProfile.career.length > 0))) && (
              <Section title="経歴" icon={<Briefcase size={24} />}>
                <div className="space-y-4">
                  {(profile?.career || localProfile?.career || []).map((car, i) => (
                    <div key={i} className="bg-white/60 p-6 rounded-xl border border-gray-200/80 transition-shadow hover:shadow-md">
                      <p className="font-bold text-lg text-gray-800">{car.company}</p>
                      <p className="text-gray-600">{car.position}</p>
                      <p className="text-sm text-gray-500 mt-1">{car.period}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* ポートフォリオ欄 */}
            {((!profile || profile.show_portfolio) && 
              ((profile?.portfolio && profile.portfolio.length > 0) || 
               (localProfile?.portfolio && localProfile.portfolio.length > 0))) && (
              <Section title="ポートフォリオ" icon={<FaGlobe size={24} />}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(profile?.portfolio || localProfile?.portfolio || []).map((port, i) => (
                        <PortfolioItem 
                          key={i} 
                          portfolio={port} 
                        />
                    ))}
                </div>
              </Section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="text-center"><div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-gray-600">読み込み中...</p></div></div>}>
      <PreviewPageContent />
    </Suspense>
  );
}