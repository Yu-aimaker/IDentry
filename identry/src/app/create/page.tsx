'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { saveFormDataLocally, getFormDataLocally, uploadTempProfileImage, getUserProfile, Profile, Education, Career, Portfolio, updateFullProfile, getGoogleAvatarUrl, clearFormDataLocally } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth-context';

interface FormData {
  name: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthDate: string;
  gender: string;
  address: string;
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

const steps = [
  { id: 1, title: '名前', emoji: '😎' },
  { id: 2, title: '生年月日', emoji: '📅' },
  { id: 3, title: '性別', emoji: '⚧' },
  { id: 4, title: '住所', emoji: '🏠' },
  { id: 5, title: '学歴', emoji: '🎓' },
  { id: 6, title: '職歴', emoji: '🏢' },
  { id: 7, title: 'SNSリンク', emoji: '🔗' },
  { id: 8, title: 'スキル', emoji: '💡' },
  { id: 9, title: 'ポートフォリオ', emoji: '🌟' },
  { id: 10, title: '自己紹介', emoji: '💬' }
];

function CreatePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [justCompletedStep, setJustCompletedStep] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    birthDate: '',
    gender: '',
    address: '',
    photo: '',
    bio: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    github: '',
    skills: [],
    google_avatar_url: '',
    education: [],
    career: [],
    portfolio: []
  });

  // データベースのプロフィールデータをフォームデータ形式に変換
  const convertProfileToFormData = (profile: Profile & { education?: Education[], career?: Career[], portfolio?: Portfolio[] }): FormData => {
    return {
      name: profile.name || '',
      birthYear: profile.birth_year || '',
      birthMonth: profile.birth_month || '',
      birthDay: profile.birth_day || '',
      birthDate: profile.birth_date || '',
      gender: profile.gender || '',
      address: profile.address || '',
      photo: profile.photo || '',
      bio: profile.bio || '',
      twitter: profile.twitter || '',
      instagram: profile.instagram || '',
      linkedin: profile.linkedin || '',
      github: profile.github || '',
      skills: profile.skills || [],
      google_avatar_url: profile.google_avatar_url || '',
      education: profile.education?.map((edu) => ({
        school: edu.school || '',
        degree: edu.degree || '',
        year: edu.year || ''
      })) || [],
      career: profile.career?.map((car) => ({
        company: car.company || '',
        position: car.position || '',
        period: car.period || ''
      })) || [],
      portfolio: profile.portfolio?.map((port) => ({
        title: port.title || '',
        description: port.description || '',
        url: port.url || '',
        image: port.image || ''
      })) || []
    };
  };

  // 初期化時の処理
  useEffect(() => {
    const initializeData = async () => {
      if (loading) return;

             // 編集モードかどうかを確認（URLパラメータまたはログイン状態）
       const edit = searchParams.get('edit') === 'true' || !!user;

      if (user && edit) {
        // ログインユーザーの場合、データベースからプロフィールを取得
        setIsLoadingProfile(true);
        try {
          const profile = await getUserProfile();
          if (profile) {
            const convertedData = convertProfileToFormData(profile);
            setFormData(convertedData);
            // プロフィールが存在する場合、完了済みステップを設定
            const completed: number[] = [];
            if (convertedData.name) completed.push(1);
            if (convertedData.birthDate || (convertedData.birthYear && convertedData.birthMonth && convertedData.birthDay)) completed.push(2);
            if (convertedData.gender) completed.push(3);
            if (convertedData.address) completed.push(4);
            if (convertedData.education.length > 0) completed.push(5);
            if (convertedData.career.length > 0) completed.push(6);
            if (convertedData.twitter || convertedData.instagram || convertedData.linkedin || convertedData.github) completed.push(7);
            if (convertedData.skills.length > 0) completed.push(8);
            if (convertedData.portfolio.length > 0) completed.push(9);
            if (convertedData.bio) completed.push(10);
            setCompletedSteps(completed);
            // ローカルストレージも上書き
            saveFormDataLocally((convertedData as unknown) as Record<string, unknown>);
          } else {
            // プロフィールが存在しない場合、Googleアバターを取得
            const googleAvatarUrl = await getGoogleAvatarUrl();
            if (googleAvatarUrl) {
              setFormData(prev => ({ ...prev, google_avatar_url: googleAvatarUrl }));
            }
          }
        } catch (error) {
          console.error('プロフィール取得エラー:', error);
          // エラーの場合はローカルストレージから復元
          const savedData = getFormDataLocally();
          if (savedData) {
            setFormData(savedData);
          }
          // エラーの場合でもGoogleアバターを試行
          try {
            const googleAvatarUrl = await getGoogleAvatarUrl();
            if (googleAvatarUrl) {
              setFormData(prev => ({ ...prev, google_avatar_url: googleAvatarUrl }));
            }
          } catch (googleError) {
            console.error('Googleアバター取得エラー:', googleError);
          }
        } finally {
          setIsLoadingProfile(false);
        }
      } else {
        // 未ログインまたは新規作成の場合、ローカルストレージから復元
        const savedData = getFormDataLocally();
        if (savedData) {
          setFormData(savedData);
        }
      }
    };

    initializeData();
  }, [user, loading, searchParams]);

  // フォームデータが変更されるたびにローカルストレージに保存
  useEffect(() => {
    saveFormDataLocally(formData as unknown as Record<string, unknown>);
  }, [formData]);

  // ローディング中の表示
  if (loading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isLoadingProfile ? 'プロフィールを読み込み中...' : '読み込み中...'}
          </p>
        </div>
      </div>
    );
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNext();
    }
  };

  const handleNext = async () => {
    // バリデーション
    if (currentStep === 1 && !formData.name) {
      alert('名前を入力してください');
      return;
    }
    if (currentStep === 10 && !formData.bio) {
      alert('自己紹介を入力してください');
      return;
    }

    // 現在のステップを完了済みとして追加（重複を避ける）
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setJustCompletedStep(currentStep);
      
      // アニメーション完了後にjustCompletedStepをリセット
      setTimeout(() => {
        setJustCompletedStep(null);
      }, 1000);
    }

    if (currentStep < 10) {
      setCurrentStep(currentStep + 1);
    } else {
      // 全ステップ完了時の処理
      if (user) {
        // ログインユーザーの場合、データベースに保存
        try {
          setIsLoadingProfile(true);
          const result = await updateFullProfile({
            name: formData.name,
            birth_year: formData.birthYear,
            birth_month: formData.birthMonth,
            birth_day: formData.birthDay,
            birth_date: formData.birthDate,
            gender: formData.gender,
            address: formData.address,
            photo: formData.photo,
            bio: formData.bio,
            twitter: formData.twitter,
            instagram: formData.instagram,
            linkedin: formData.linkedin,
            github: formData.github,
            skills: formData.skills,
            google_avatar_url: formData.google_avatar_url,
            education: formData.education,
            career: formData.career,
            portfolio: formData.portfolio
          });
          if (result === null) {
            clearFormDataLocally();
            router.push('/preview');
          } else {
            clearFormDataLocally();
            router.push('/preview?from=edit');
          }
        } catch (error) {
          console.error('プロフィール保存エラー:', error);
          let errorMessage = 'プロフィールの保存に失敗しました。もう一度お試しください。';
          
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          }
          
          alert(errorMessage);
        } finally {
          setIsLoadingProfile(false);
        }
      } else {
        // 未ログインの場合は通常通りプレビューへ
        router.push('/preview');
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const updateFormData = (field: keyof FormData, value: string | string[] | FormData[keyof FormData]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 作成ページ用の画像表示ロジック
  const getCreateImageUrl = (data: FormData): string | null => {
    // 1. 設定されたプロフィール画像があれば優先
    if (data.photo) {
      return data.photo;
    }
    
    // 2. Googleアバターがあれば使用
    if (data.google_avatar_url) {
      return data.google_avatar_url;
    }
    
    // 3. どちらもない場合はnull
    return null;
  };

  const handleDateChange = (dateValue: string) => {
    if (dateValue) {
      const date = new Date(dateValue);
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString();
      const day = date.getDate().toString();
      
      setFormData(prev => ({
        ...prev,
        birthDate: dateValue,
        birthYear: year,
        birthMonth: month,
        birthDay: day
      }));
    }
  };

  const handleSelectChange = (field: 'birthYear' | 'birthMonth' | 'birthDay', value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // 年月日が全て入力されている場合、日付文字列も更新
      if (updated.birthYear && updated.birthMonth && updated.birthDay) {
        const year = updated.birthYear;
        const month = updated.birthMonth.padStart(2, '0');
        const day = updated.birthDay.padStart(2, '0');
        updated.birthDate = `${year}-${month}-${day}`;
      }
      
      return updated;
    });
  };

  const addArrayItem = (field: 'education' | 'career' | 'portfolio', item: FormData['education'][0] | FormData['career'][0] | FormData['portfolio'][0]) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as unknown[]), item] as FormData[typeof field]
    }));
  };

  const removeArrayItem = (field: 'education' | 'career' | 'portfolio', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as unknown[]).filter((_, i) => i !== index) as FormData[typeof field]
    }));
  };

  // 入力情報の量に基づいた進捗を計算する関数
  const calculateProgress = () => {
    const fields = [
      // 必須項目（重み：2）
      { filled: !!formData.name, weight: 2 },
      { filled: !!(formData.birthDate || (formData.birthYear && formData.birthMonth && formData.birthDay)), weight: 2 },
      { filled: !!formData.bio, weight: 2 },
      
      // 任意項目（重み：1）
      { filled: !!formData.gender, weight: 1 },
      { filled: !!formData.address, weight: 1 },
      { filled: formData.education.length > 0, weight: 1 },
      { filled: formData.career.length > 0, weight: 1 },
      { filled: !!(formData.twitter || formData.instagram || formData.linkedin || formData.github), weight: 1 },
      { filled: formData.skills.length > 0, weight: 1 },
      { filled: formData.portfolio.length > 0, weight: 1 },
      { filled: !!(formData.photo || formData.google_avatar_url), weight: 1 }
    ];

    const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0);
    const filledWeight = fields.reduce((sum, field) => sum + (field.filled ? field.weight : 0), 0);
    
    return Math.round((filledWeight / totalWeight) * 100);
  };

  // 画像アップロード処理
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB制限
      alert('ファイルサイズは5MB以下にしてください');
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadTempProfileImage(file);
      updateFormData('photo', imageUrl);
      console.log('画像アップロード成功:', imageUrl);
    } catch (error) {
      console.error('画像アップロード失敗:', error);
      alert('画像のアップロードに失敗しました。もう一度お試しください。');
    } finally {
      setIsUploading(false);
    }
  };

  // ドラッグアンドドロップ処理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-white" onKeyDown={handleKeyPress}>
      {/* ヘッダー */}
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6 relative">
          {/* 中央：ロゴ */}
          <div className="flex justify-center">
            <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity duration-200">
              <Image
                src="/img/banner.png"
                alt="IDentry Banner"
                width={200}
                height={80}
                className="h-15 object-contain"
              />
            </Link>
          </div>
          
          {/* 右側：マイページボタン（ログイン時のみ表示） */}
          {user && (
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
              <Link
                href="/dashboard"
                className="px-6 py-2 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
              >
                マイページ
              </Link>
            </div>
          )}
        </div>
      </header>


      {/* ステップインジケーター */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-5 md:grid-cols-10 gap-3 mb-6">
          {steps.map((step) => (
            <div
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              className={`flex flex-col items-center justify-center space-y-2 p-4 rounded-xl transition-all duration-500 min-h-[80px] cursor-pointer hover:scale-105 ${
                step.id < currentStep
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg hover:from-green-100 hover:to-emerald-100 hover:border-green-300 hover:shadow-xl step-completed'
                  : step.id === currentStep
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-md scale-105 animate-pulse'
                    : 'bg-gray-50 border border-gray-200 opacity-60 hover:opacity-80 hover:bg-gray-100'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium transition-all duration-500 ${
                step.id < currentStep
                  ? `bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg ${
                      justCompletedStep === step.id ? 'animate-step-complete' : ''
                    }`
                  : step.id === currentStep
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg animate-pulse'
                    : 'bg-gray-300 text-gray-500'
              }`}>
                {step.id < currentStep ? (
                  <span
                    className={`text-xl font-bold ${
                      justCompletedStep === step.id
                        ? 'animate-checkmark-pop'
                        : ''
                    }`}
                    key={`check-${step.id}-${justCompletedStep === step.id ? Date.now() : 'static'}`}
                  >
                    ✓
                  </span>
                ) : step.emoji}
              </div>
              <div className="text-center">
                <div className={`text-xs font-bold transition-colors duration-300 ${
                  step.id < currentStep
                    ? 'text-green-800'
                    : step.id === currentStep
                      ? 'text-blue-800'
                      : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
                {step.id < currentStep && (
                  <div className="text-xs text-green-600 font-medium mt-1 opacity-80">
                    完了 ✨
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* メインコンテンツ */}
      <div className="max-w-2xl mx-auto px-4 py-8 pb-32">
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">{steps[currentStep - 1].emoji}</div>
            <h1 className="text-3xl font-bold text-black mb-2">
              {steps[currentStep - 1].title}
            </h1>
            <p className="text-gray-600">
              {currentStep === 1 && "プロフィール画像とお名前を設定してください"}
              {currentStep === 2 && "生年月日を入力してください"}
              {currentStep === 3 && "性別を選択してください"}
              {currentStep === 4 && "現在の住所を入力してください（任意）"}
              {currentStep === 5 && "学歴を入力してください（任意）"}
              {currentStep === 6 && "職歴を入力してください（任意）"}
              {currentStep === 7 && "SNSアカウントを教えてください（任意）"}
              {currentStep === 8 && "あなたのスキルをタグで追加してください"}
              {currentStep === 9 && "ポートフォリオ作品を追加してください（任意）"}
              {currentStep === 10 && "120文字以内で自己紹介を書いてください"}
            </p>
          </div>

          {/* ステップ1: 名前 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* アイコン画像アップロード */}
              <div>
                <label className="block text-sm font-medium text-black mb-4">
                  プロフィール画像をアップロード
                </label>
                
                {/* 画像プレビューまたはアップロードエリア */}
                <div className="flex flex-col items-center space-y-4">
                  {getCreateImageUrl(formData) ? (
                    /* 画像プレビュー */
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 shadow-lg">
                        <Image
                          src={getCreateImageUrl(formData)!}
                          alt="プロフィール画像"
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {formData.photo && (
                        <button
                          onClick={() => updateFormData('photo', '')}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ) : (
                    /* アップロードエリア */
                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className="w-40 h-40 border-2 border-dashed border-blue-300 rounded-full flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer relative"
                    >
                      {isUploading ? (
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-blue-600 text-xs font-medium">アップロード中</p>
                        </div>
                      ) : (
                        <>
                          <div className="text-2xl text-blue-400 mb-2">📸</div>
                          <p className="text-blue-600 text-xs font-medium mb-1">ドロップまたは</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file);
                            }}
                            className="hidden"
                            id="photo-upload"
                          />
                          <label
                            htmlFor="photo-upload"
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors cursor-pointer"
                          >
                            選択
                          </label>
                          <p className="text-xs text-gray-400 mt-1">JPG, PNG (5MB以下)</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 名前入力 */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  お名前 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="山田太郎"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* ステップ2: 生年月日 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-black mb-4">
                生年月日
              </label>
              
              {/* 年月日の個別選択 */}
              <div className="grid grid-cols-3 gap-4">
                {/* 年 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">年</label>
                  <select
                    value={formData.birthYear}
                    onChange={(e) => handleSelectChange('birthYear', e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    autoFocus
                  >
                    <option value="">----</option>
                    {Array.from({ length: 100 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
                
                {/* 月 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">月</label>
                  <select
                    value={formData.birthMonth}
                    onChange={(e) => handleSelectChange('birthMonth', e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="">--</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* 日 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">日</label>
                  <select
                    value={formData.birthDay}
                    onChange={(e) => handleSelectChange('birthDay', e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="">--</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* カレンダー選択 */}
              <div className="mt-6">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">または</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                <div className="mt-3 flex items-center space-x-3">
                  <span className="text-sm text-gray-600">📅</span>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="カレンダーから選択"
                  />
                  <span className="text-xs text-gray-500">カレンダーで選択</span>
                </div>
              </div>
            </div>
          )}

          {/* ステップ3: 性別 */}
          {currentStep === 3 && (
            <div>
              <label className="block text-sm font-medium text-black mb-4">
                性別
              </label>
              <div className="space-y-3">
                {['男性', '女性', 'その他'].map((option, index) => (
                  <label key={option} className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value={option}
                      checked={formData.gender === option}
                      onChange={(e) => updateFormData('gender', e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      autoFocus={index === 0}
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ステップ4: 住所 */}
          {currentStep === 4 && (
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                住所（任意）
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="東京都渋谷区"
                autoFocus
              />
            </div>
          )}

          {/* ステップ5: 学歴 */}
          {currentStep === 5 && (
            <EducationInput
              education={formData.education}
              addEducation={(item) => addArrayItem('education', item)}
              removeEducation={(index) => removeArrayItem('education', index)}
            />
          )}

          {/* ステップ6: 職歴 */}
          {currentStep === 6 && (
            <CareerInput
              career={formData.career}
              addCareer={(item) => addArrayItem('career', item)}
            />
          )}

          {/* ステップ7: SNSリンク */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Twitter/X
                </label>
                <input
                  type="text"
                  value={formData.twitter}
                  onChange={(e) => updateFormData('twitter', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="@username"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Instagram
                </label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => updateFormData('instagram', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="@username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => updateFormData('linkedin', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  GitHub
                </label>
                <input
                  type="text"
                  value={formData.github}
                  onChange={(e) => updateFormData('github', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="username"
                />
              </div>
            </div>
          )}

          {/* ステップ8: スキル */}
          {currentStep === 8 && (
            <SkillsInput
              skills={formData.skills}
              updateSkills={(skills) => updateFormData('skills', skills)}
            />
          )}

          {/* ステップ9: ポートフォリオ */}
          {currentStep === 9 && (
            <PortfolioInput
              portfolio={formData.portfolio}
              addPortfolio={(item) => addArrayItem('portfolio', item)}
              removePortfolio={(index) => removeArrayItem('portfolio', index)}
            />
          )}

          {/* ステップ10: 自己紹介 */}
          {currentStep === 10 && (
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                自己紹介 * ({formData.bio.length}/120)
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => updateFormData('bio', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && e.ctrlKey && handleNext()}
                maxLength={120}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                placeholder="フロントエンドエンジニアとして3年の経験があります。ReactやNext.jsを使った開発が得意で、ユーザビリティを重視したWebアプリケーション開発に情熱を注いでいます。（Ctrl+Enterで次へ）"
                autoFocus
              />
            </div>
          )}

          {/* ナビゲーションボタン */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium ${
                currentStep === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ← 戻る
            </button>
            <button
              onClick={handleNext}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {currentStep === 10 ? 'プレビューを見る →' : '次へ →'}
            </button>
          </div>
        </div>
      </div>

      {/* 最下部の固定プログレスバー */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* ランナーアイコンとトラック */}
          <div className="relative mb-4">
            {/* トラック背景 */}
            <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-700 ease-out relative"
                style={{ width: `${calculateProgress()}%` }}
              >
                {/* サブトルな光沢効果 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full"></div>
              </div>
            </div>
            
            {/* ランナーアイコン */}
            <div
              className="absolute -top-4 transform transition-all duration-700 ease-out"
              style={{ left: `calc(${calculateProgress()}% - 24px)` }}
            >
              <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-blue-500 hover:scale-110 transition-transform duration-300">
                <span className="text-2xl animate-pulse">🚀</span>
              </div>
            </div>
          </div>
          
          {/* スタートとゴールのラベル */}
          <div className="flex justify-between items-center text-sm font-medium">
            <div className="flex items-center space-x-2 text-slate-600">
              <span className="text-base">🏁</span>
              <span>スタート</span>
            </div>
            <div className="text-slate-700 font-semibold">
              {calculateProgress()}% 完了
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <span>ゴール</span>
              <span className="text-base">🏁</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// スキル入力コンポーネント
function SkillsInput({ skills, updateSkills }: { skills: string[], updateSkills: (skills: string[]) => void }) {
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      updateSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    updateSkills(skills.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          placeholder="例: React, TypeScript, Python..."
        />
        <button
          onClick={addSkill}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          追加
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
          >
            <span>{skill}</span>
            <button
              onClick={() => removeSkill(skill)}
              className="text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

// 学歴入力コンポーネント
function EducationInput({ education, addEducation, removeEducation }: { 
  education: Array<{ school: string; degree: string; year: string }>, 
  addEducation: (item: { school: string; degree: string; year: string }) => void,
  removeEducation: (index: number) => void
}) {
  const [school, setSchool] = useState('');
  const [degree, setDegree] = useState('');
  const [year, setYear] = useState('');

  const handleAdd = () => {
    if (school.trim()) {
      // 重複チェック
      const isDuplicate = education.some(e => e.school === school.trim() && e.degree === degree.trim() && e.year === year.trim());
      if (isDuplicate) {
        alert('同じ学歴が既に追加されています');
        return;
      }
      addEducation({ school: school.trim(), degree: degree.trim(), year: year.trim() });
      setSchool('');
      setDegree('');
      setYear('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <input
          type="text"
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          placeholder="学校名（例: 東京大学）"
        />
        <input
          type="text"
          value={degree}
          onChange={(e) => setDegree(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          placeholder="学位・学部（例: 工学部情報工学科）"
        />
        <input
          type="text"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          placeholder="卒業年（例: 2020年3月）"
        />
        <button
          onClick={handleAdd}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          学歴を追加
        </button>
      </div>
      
      {education.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-black">追加済みの学歴</h3>
          {education.map((item, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg flex justify-between items-start">
              <div>
                <div className="font-medium">{item.school}</div>
                <div className="text-gray-600">{item.degree}</div>
                <div className="text-sm text-gray-500">{item.year}</div>
              </div>
              <button
                onClick={() => removeEducation(index)}
                className="ml-4 w-7 h-7 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 text-base font-bold"
                aria-label="削除"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 経歴入力コンポーネント
function CareerInput({ career, addCareer }: { 
  career: Array<{ company: string; position: string; period: string }>, 
  addCareer: (item: { company: string; position: string; period: string }) => void 
}) {
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [period, setPeriod] = useState('');

  const handleAdd = () => {
    if (company.trim()) {
      addCareer({ company: company.trim(), position: position.trim(), period: period.trim() });
      setCompany('');
      setPosition('');
      setPeriod('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          placeholder="会社名（例: 株式会社テクノロジー）"
        />
        <input
          type="text"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          placeholder="役職（例: フロントエンドエンジニア）"
        />
        <input
          type="text"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          placeholder="期間（例: 2020年4月 〜 現在）"
        />
        <button
          onClick={handleAdd}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          経歴を追加
        </button>
      </div>
      
      {career.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-black">追加済みの経歴</h3>
          {career.map((item, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium">{item.company}</div>
              <div className="text-gray-600">{item.position}</div>
              <div className="text-sm text-gray-500">{item.period}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ポートフォリオ入力コンポーネント
function PortfolioInput({ portfolio, addPortfolio, removePortfolio }: { 
  portfolio: Array<{ title: string; description: string; url: string; image: string }>, 
  addPortfolio: (item: { title: string; description: string; url: string; image: string }) => void,
  removePortfolio: (index: number) => void
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [image, setImage] = useState('');

  const handleAdd = () => {
    if (title.trim()) {
      // 重複チェック
      const isDuplicate = portfolio.some(p => p.title === title.trim() && p.description === description.trim() && p.url === url.trim() && p.image === image.trim());
      if (isDuplicate) {
        alert('同じポートフォリオが既に追加されています');
        return;
      }
      addPortfolio({ 
        title: title.trim(), 
        description: description.trim(), 
        url: url.trim(), 
        image: image.trim() 
      });
      setTitle('');
      setDescription('');
      setUrl('');
      setImage('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          placeholder="作品タイトル（例: ECサイト開発）"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
          placeholder="作品の説明（例: React/Next.jsを使用したECサイト。決済機能まで実装）"
        />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          placeholder="作品URL（例: https://example.com）"
        />
        <input
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          placeholder="作品画像URL（例: https://example.com/image.jpg）"
        />
        <button
          onClick={handleAdd}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          ポートフォリオを追加
        </button>
      </div>
      
      {portfolio.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-black">追加済みのポートフォリオ</h3>
          {portfolio.map((item, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg flex justify-between items-start">
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-gray-600 text-sm mb-2">{item.description}</div>
                {item.url && (
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {item.url}
                  </a>
                )}
              </div>
              <button
                onClick={() => removePortfolio(index)}
                className="ml-4 w-7 h-7 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 text-base font-bold"
                aria-label="削除"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CreatePageWithSuspense() {
  return (
    <Suspense>
      <CreatePage />
    </Suspense>
  );
}