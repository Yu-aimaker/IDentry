'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface FormData {
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

const steps = [
  { id: 1, title: '基本情報', emoji: '🧱', reward: '基本ブロック完成' },
  { id: 2, title: '自己紹介', emoji: '🗣', reward: '自己紹介ブロック完成' },
  { id: 3, title: 'SNSリンク', emoji: '🔗', reward: 'つながりブロック完成' },
  { id: 4, title: 'スキル', emoji: '💡', reward: 'スキルブロック完成' },
  { id: 5, title: '学歴', emoji: '🎓', reward: '学歴ブロック完成' },
  { id: 6, title: '経歴', emoji: '🏢', reward: 'キャリアブロック完成' },
  { id: 7, title: 'ポートフォリオ', emoji: '🌟', reward: 'ポートフォリオブロック完成' }
];

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showReward, setShowReward] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
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

  const handleNext = () => {
    // バリデーション
    if (currentStep === 1 && !formData.name) {
      alert('名前を入力してください');
      return;
    }
    if (currentStep === 2 && !formData.bio) {
      alert('自己紹介を入力してください');
      return;
    }

    // 報酬アニメーション表示
    setShowReward(true);
    setTimeout(() => {
      setShowReward(false);
      if (currentStep < 7) {
        setCurrentStep(currentStep + 1);
      } else {
        // 全ステップ完了時にプレビューページへ
        router.push('/preview');
      }
    }, 2000);
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: keyof FormData, value: string | string[] | FormData[keyof FormData]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addArrayItem = (field: 'education' | 'career' | 'portfolio', item: FormData['education'][0] | FormData['career'][0] | FormData['portfolio'][0]) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as unknown[]), item] as FormData[typeof field]
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">ID</span>
            </div>
            <span className="text-xl font-bold text-black">IDentry</span>
          </Link>
          <div className="text-sm text-gray-500">
            ステップ {currentStep}/7
          </div>
        </div>
      </header>

      {/* プログレスバー */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / 7) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* ステップインジケーター */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-center space-x-4 overflow-x-auto">
          {steps.map((step) => (
            <div 
              key={step.id}
              className={`flex flex-col items-center space-y-2 min-w-0 ${
                step.id <= currentStep ? 'opacity-100' : 'opacity-50'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                step.id < currentStep ? 'bg-green-100' : 
                step.id === currentStep ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {step.id < currentStep ? '✅' : step.emoji}
              </div>
              <span className="text-xs text-gray-600 text-center">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 報酬アニメーション */}
      {showReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center animate-bounce">
            <div className="text-6xl mb-4">{steps[currentStep - 1].emoji}</div>
            <h2 className="text-2xl font-bold text-black mb-2">
              {steps[currentStep - 1].reward}！
            </h2>
            <p className="text-gray-600">素晴らしい！次のブロックに進みましょう</p>
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">{steps[currentStep - 1].emoji}</div>
            <h1 className="text-3xl font-bold text-black mb-2">
              {steps[currentStep - 1].title}
            </h1>
            <p className="text-gray-600">
              {currentStep === 1 && "あなたの基本情報を入力してください"}
              {currentStep === 2 && "120文字以内で自己紹介を書いてください"}
              {currentStep === 3 && "SNSアカウントを教えてください（任意）"}
              {currentStep === 4 && "あなたのスキルをタグで追加してください"}
              {currentStep === 5 && "学歴を入力してください（任意）"}
              {currentStep === 6 && "職歴を入力してください（任意）"}
              {currentStep === 7 && "ポートフォリオ作品を追加してください（任意）"}
            </p>
          </div>

          {/* ステップ1: 基本情報 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  お名前 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="山田太郎"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  プロフィール写真URL（任意）
                </label>
                <input
                  type="url"
                  value={formData.photo}
                  onChange={(e) => updateFormData('photo', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
            </div>
          )}

          {/* ステップ2: 自己紹介 */}
          {currentStep === 2 && (
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                自己紹介 * ({formData.bio.length}/120)
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => updateFormData('bio', e.target.value)}
                maxLength={120}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                placeholder="フロントエンドエンジニアとして3年の経験があります。ReactやNext.jsを使った開発が得意で、ユーザビリティを重視したWebアプリケーション開発に情熱を注いでいます。"
              />
            </div>
          )}

          {/* ステップ3: SNSリンク */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Twitter/X
                </label>
                <input
                  type="text"
                  value={formData.twitter}
                  onChange={(e) => updateFormData('twitter', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="@username"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="username"
                />
              </div>
            </div>
          )}

          {/* ステップ4: スキル */}
          {currentStep === 4 && (
            <SkillsInput 
              skills={formData.skills}
              updateSkills={(skills) => updateFormData('skills', skills)}
            />
          )}

          {/* ステップ5: 学歴 */}
          {currentStep === 5 && (
            <EducationInput 
              education={formData.education}
              addEducation={(item) => addArrayItem('education', item)}
            />
          )}

          {/* ステップ6: 経歴 */}
          {currentStep === 6 && (
            <CareerInput 
              career={formData.career}
              addCareer={(item) => addArrayItem('career', item)}
            />
          )}

          {/* ステップ7: ポートフォリオ */}
          {currentStep === 7 && (
            <PortfolioInput 
              portfolio={formData.portfolio}
              addPortfolio={(item) => addArrayItem('portfolio', item)}
            />
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
              {currentStep === 7 ? 'プレビューを見る →' : '次へ →'}
            </button>
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