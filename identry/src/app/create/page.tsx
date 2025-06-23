'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { saveFormDataLocally, getFormDataLocally } from '../../../lib/supabase';

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

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [justCompletedStep, setJustCompletedStep] = useState<number | null>(null);
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
    education: [],
    career: [],
    portfolio: []
  });
  const router = useRouter();

  // 初期化時にローカルストレージからデータを復元
  useEffect(() => {
    const savedData = getFormDataLocally();
    if (savedData) {
      setFormData(savedData);
    }
  }, []);

  // フォームデータが変更されるたびにローカルストレージに保存
  useEffect(() => {
    saveFormDataLocally(formData as unknown as Record<string, unknown>);
  }, [formData]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNext();
    }
  };

  const handleNext = () => {
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
      // 全ステップ完了時にプレビューページへ
      router.push('/preview');
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

  return (
    <div className="min-h-screen bg-white" onKeyDown={handleKeyPress}>
      {/* ヘッダー */}
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-center">
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
              {currentStep === 1 && "お名前を入力してください"}
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
                style={{ width: `${(currentStep / 10) * 100}%` }}
              >
                {/* サブトルな光沢効果 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full"></div>
              </div>
            </div>
            
            {/* ランナーアイコン */}
            <div
              className="absolute -top-4 transform transition-all duration-700 ease-out"
              style={{ left: `calc(${(currentStep / 10) * 100}% - 24px)` }}
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
              {Math.round((currentStep / 10) * 100)}% 完了
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
function EducationInput({ education, addEducation }: { 
  education: Array<{ school: string; degree: string; year: string }>, 
  addEducation: (item: { school: string; degree: string; year: string }) => void 
}) {
  const [school, setSchool] = useState('');
  const [degree, setDegree] = useState('');
  const [year, setYear] = useState('');

  const handleAdd = () => {
    if (school.trim()) {
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
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium">{item.school}</div>
              <div className="text-gray-600">{item.degree}</div>
              <div className="text-sm text-gray-500">{item.year}</div>
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
function PortfolioInput({ portfolio, addPortfolio }: { 
  portfolio: Array<{ title: string; description: string; url: string; image: string }>, 
  addPortfolio: (item: { title: string; description: string; url: string; image: string }) => void 
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [image, setImage] = useState('');

  const handleAdd = () => {
    if (title.trim()) {
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
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
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
          ))}
        </div>
      )}
    </div>
  );
}