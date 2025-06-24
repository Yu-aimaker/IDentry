'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { getFormDataLocally, getProfileImageUrl, Profile } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth-context';
import { IDCardProfile } from "../../../components/ui/IDCardProfile";
import { Github, Twitter, Instagram, Linkedin } from "lucide-react";

interface ProfileData {
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
  department?: string;
  employee_id?: string;
  created_at?: string;
  address?: string;
}

export default function PreviewPage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const isFromEdit = searchParams.get('from') === 'edit';
  const [cardVariant] = useState<'pasmo' | 'credit' | 'corporate' | 'metro'>(() => {
    if (typeof window !== 'undefined') {
      const v = localStorage.getItem('card_variant');
      if (v === 'pasmo' || v === 'credit' || v === 'corporate' || v === 'metro') return v;
    }
    return 'pasmo';
  });

  useEffect(() => {
    // ローカルストレージからフォームデータを取得
    const savedData = getFormDataLocally();
    if (savedData) {
      const profileData: ProfileData = {
        name: savedData.name || '名前未設定',
        photo: savedData.photo || '',
        bio: savedData.bio || '',
        twitter: savedData.twitter || '',
        instagram: savedData.instagram || '',
        linkedin: savedData.linkedin || '',
        github: savedData.github || '',
        skills: savedData.skills || [],
        education: savedData.education || [],
        career: savedData.career || [],
        portfolio: savedData.portfolio || [],
        department: savedData.department || '',
        employee_id: savedData.employee_id || '',
        created_at: savedData.created_at || '',
        address: savedData.address || ''
      };
      setProfileData(profileData);
    } else {
      // フォームデータがない場合はデフォルトデータ
      const defaultData: ProfileData = {
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
        portfolio: [],
        department: '',
        employee_id: '',
        created_at: '',
        address: ''
      };
      setProfileData(defaultData);
    }
  }, []);

  const handlePublish = () => {
    // プロフィールを公開する場合は、新規登録ページに遷移してデータベースに保存
    alert('プロフィールを公開するには新規登録が必要です。入力されたデータは保持されます。');
    router.push('/login?mode=signup');
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
            {user && isFromEdit ? (
              <Link
                href="/create?edit=true"
                className="text-gray-600 hover:text-black transition-colors"
              >
                ← 編集に戻る
              </Link>
            ) : (
              <Link
                href="/create"
                className="text-gray-600 hover:text-black transition-colors"
              >
                ← 編集に戻る
              </Link>
            )}
            {!user && (
              <button
                onClick={handlePublish}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                公開する
              </button>
            )}
            {user && (
              <Link
                href="/dashboard"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                マイページに戻る
              </Link>
            )}
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
          {/* ヘッダー部分をIDカードに置き換え */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-full max-w-2xl">
              <IDCardProfile
                profileData={{
                  name: profileData.name,
                  title: profileData.bio || "",
                  department: profileData.department || "",
                  employeeId: profileData.employee_id || "",
                  joinDate: profileData.created_at ? new Date(profileData.created_at).toLocaleDateString() : "",
                  email: user?.email || "",
                  avatar: getProfileImageUrl({
                    ...profileData,
                    id: '',
                    user_id: '',
                    is_public: true,
                    views_count: 0,
                    profile_url: '',
                    created_at: '',
                    updated_at: '',
                    show_education: true,
                    show_career: true,
                    show_portfolio: true,
                    show_skills: true,
                    show_sns: true,
                    skills: profileData.skills || [],
                  } as Profile) || undefined,
                }}
                variant={cardVariant}
              />
            </div>
          </div>

          {/* 新・詳細セクション */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* スキル */}
            {profileData.skills.length > 0 && (
              <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">💡 スキル</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill, i) => (
                    <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* SNSリンク */}
            {(profileData.twitter || profileData.instagram || profileData.linkedin || profileData.github) && (
              <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">🔗 SNS</h3>
                <div className="flex gap-4 items-center">
                  {profileData.twitter && (
                    <a href={`https://twitter.com/${profileData.twitter.replace(/^@/,"")}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">
                      <Twitter className="w-6 h-6" />
                    </a>
                  )}
                  {profileData.instagram && (
                    <a href={`https://instagram.com/${profileData.instagram.replace(/^@/,"")}`} target="_blank" rel="noopener noreferrer" className="hover:text-pink-500">
                      <Instagram className="w-6 h-6" />
                    </a>
                  )}
                  {profileData.linkedin && (
                    <a href={`https://linkedin.com/in/${profileData.linkedin.replace(/^@/,"")}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-700">
                      <Linkedin className="w-6 h-6" />
                    </a>
                  )}
                  {profileData.github && (
                    <a href={`https://github.com/${profileData.github.replace(/^@/,"")}`} target="_blank" rel="noopener noreferrer" className="hover:text-gray-800">
                      <Github className="w-6 h-6" />
                    </a>
                  )}
                </div>
              </div>
            )}
            {/* 経歴 */}
            {profileData.career.length > 0 && (
              <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">🏢 経歴</h3>
                <ul className="space-y-2">
                  {profileData.career.map((item, i) => (
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
            {profileData.education.length > 0 && (
              <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">🎓 学歴</h3>
                <ul className="space-y-2">
                  {profileData.education.map((item, i) => (
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
            {profileData.portfolio.length > 0 && (
              <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col md:col-span-2">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">🌟 ポートフォリオ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profileData.portfolio.map((item, i) => (
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
        </div>
      </div>
    </div>
  );
}