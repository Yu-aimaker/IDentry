'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { getFormDataLocally, clearFormDataLocally, createProfile, addEducation, addCareer, addPortfolio, getUserProfile, updateProfile, getGoogleAvatarUrl } from '../../../lib/supabase';

function LoginPageContent() {
  const [isLogin, setIsLogin] = useState(true); // デフォルトはログインモード
  const searchParams = useSearchParams();

  // URLパラメータに基づいてモードを設定
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsLogin(false); // 新規登録モード
    } else if (mode === 'login') {
      setIsLogin(true); // ログインモード
    }
    // パラメータがない場合はデフォルトのログインモードを維持
  }, [searchParams]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle } = useAuth();

  // エラーメッセージをクリアする関数
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Supabaseエラーを分析してユーザーフレンドリーなメッセージに変換
  const getErrorMessage = (error: Error | unknown): string => {
    if (!error) return '不明なエラーが発生しました。';
    
    let errorMessage = '';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = String(error);
    }
    
    // 認証関連のエラーメッセージを日本語に変換
    if (errorMessage.includes('Invalid login credentials')) {
      return 'メールアドレスまたはパスワードが正しくありません。';
    }
    if (errorMessage.includes('Email not confirmed')) {
      return 'メールアドレスの確認が完了していません。確認メールをご確認ください。';
    }
    if (errorMessage.includes('User already registered')) {
      return 'このメールアドレスは既に登録されています。ログインをお試しください。';
    }
    if (errorMessage.includes('Password should be at least')) {
      return 'パスワードは6文字以上で入力してください。';
    }
    if (errorMessage.includes('Invalid email')) {
      return 'メールアドレスの形式が正しくありません。';
    }
    if (errorMessage.includes('Rate limit exceeded')) {
      return 'リクエストが多すぎます。しばらく時間をおいて再度お試しください。';
    }
    if (errorMessage.includes('Network error')) {
      return 'ネットワークエラーが発生しました。インターネット接続をご確認ください。';
    }
    if (errorMessage.includes('Signup not allowed')) {
      return '現在、新規登録は受け付けておりません。';
    }
    if (errorMessage.includes('Email link is invalid')) {
      return 'メール確認リンクが無効です。再度確認メールを送信してください。';
    }
    if (errorMessage.includes('Token has expired')) {
      return 'セッションの有効期限が切れました。再度ログインしてください。';
    }
    if (errorMessage.includes('Weak password')) {
      return 'パスワードが簡単すぎます。より強力なパスワードを設定してください。';
    }
    if (errorMessage.includes('Too many requests')) {
      return 'アクセスが集中しています。時間をおいて再度お試しください。';
    }
    
    // デフォルトメッセージ
    return `エラーが発生しました: ${errorMessage}`;
  };

  // フォームデータをデータベースに保存する関数
  const saveFormDataToDatabase = async () => {
    const formData = getFormDataLocally();
    if (!formData) return;

    try {
      // 既存プロフィールをチェック
      const existingProfile = await getUserProfile();
      
      if (existingProfile) {
        // 既存プロフィールを更新
        const updatedProfile = await updateProfile({
          name: formData.name || existingProfile.name,
          birth_year: formData.birthYear || existingProfile.birth_year,
          birth_month: formData.birthMonth || existingProfile.birth_month,
          birth_day: formData.birthDay || existingProfile.birth_day,
          birth_date: formData.birthDate || existingProfile.birth_date,
          gender: formData.gender || existingProfile.gender,
          address: formData.address || existingProfile.address,
          photo: formData.photo || existingProfile.photo,
          bio: formData.bio || existingProfile.bio,
          twitter: formData.twitter || existingProfile.twitter,
          instagram: formData.instagram || existingProfile.instagram,
          linkedin: formData.linkedin || existingProfile.linkedin,
          github: formData.github || existingProfile.github,
          skills: formData.skills && formData.skills.length > 0 ? formData.skills : existingProfile.skills,
          google_avatar_url: await getGoogleAvatarUrl() || existingProfile.google_avatar_url
        });

        console.log('プロフィールを更新しました:', updatedProfile);
      } else {
        // 新規プロフィール作成
        const profile = await createProfile({
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
          skills: formData.skills || []
        });

        // 学歴を追加
        if (formData.education && Array.isArray(formData.education)) {
          for (const edu of formData.education) {
            await addEducation(profile.id, edu);
          }
        }

        // 職歴を追加
        if (formData.career && Array.isArray(formData.career)) {
          for (const car of formData.career) {
            await addCareer(profile.id, car);
          }
        }

        // ポートフォリオを追加
        if (formData.portfolio && Array.isArray(formData.portfolio)) {
          for (const port of formData.portfolio) {
            await addPortfolio(profile.id, port);
          }
        }

        console.log('新規プロフィールを作成しました:', profile);
      }

      // ローカルストレージをクリア
      clearFormDataLocally();
    } catch (error) {
      console.error('フォームデータ保存エラー:', error);
      // エラーが発生してもプロフィールが既に存在する場合があるので、
      // 1プロフィール制約エラーの場合は無視
      if (error instanceof Error && error.message.includes('duplicate')) {
        console.log('プロフィールは既に存在します');
        clearFormDataLocally();
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      clearMessages();
      await signInWithGoogle();
      
      // フォームデータが保存されている場合、データベースに保存
      await saveFormDataToDatabase();
      
      setSuccess('Googleログインに成功しました！');
      router.push('/dashboard');
    } catch (error) {
      console.error('Googleログインエラー:', error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください。');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('パスワードが一致しません。');
      return;
    }

    try {
      setIsLoading(true);
      
      if (isLogin) {
        await signIn(email, password);
        setSuccess('ログインに成功しました！');
      } else {
        await signUp(email, password);
        setSuccess('アカウント作成が完了しました！確認メールを送信いたしました。メールをご確認の上、リンクをクリックしてアカウントを有効化してください。');
      }

      // フォームデータが保存されている場合、データベースに保存
      await saveFormDataToDatabase();
      
      if (isLogin) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('認証エラー:', error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* ロゴ */}
        <Link href="/" className="flex items-center justify-center mb-8">
          <Image
            src="/img/banner.png"
            alt="IDentry Banner"
            width={200}
            height={80}
            className="h-15 object-contain cursor-pointer hover:opacity-80 transition-opacity duration-200"
          />
        </Link>
        
        <h2 className="text-center text-3xl font-bold text-black">
          {isLogin ? 'ログイン' : 'アカウント作成'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin ? (
            <>
              アカウントをお持ちでない方は{' '}
              <button
                onClick={() => {
                  setIsLogin(false);
                  clearMessages();
                }}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                アカウント作成
              </button>
            </>
          ) : (
            <>
              既にアカウントをお持ちの方は{' '}
              <button
                onClick={() => {
                  setIsLogin(true);
                  clearMessages();
                }}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                ログイン
              </button>
            </>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-2xl sm:px-10">
          {/* Googleログイン */}
          <div className="mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading ? '処理中...' : 'Googleでログイン'}
            </button>
          </div>

          {/* 区切り線 */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">または</span>
            </div>
          </div>

          {/* エラー・成功メッセージ */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          )}

          {/* メールフォーム */}
          <form onSubmit={handleEmailAuth} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black">
                メールアドレス
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black">
                パスワード
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                  placeholder="パスワードを入力"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-black">
                  パスワード確認
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                    placeholder="パスワードを再入力"
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    ログイン状態を保持
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    パスワードを忘れた方
                  </a>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    処理中...
                  </>
                ) : (
                  isLogin ? 'ログイン' : 'アカウント作成'
                )}
              </button>
            </div>
          </form>

          {!isLogin && (
            <div className="mt-6 text-xs text-gray-500 text-center">
              アカウント作成により、
              <a href="#" className="text-blue-600 hover:underline">利用規約</a>
              および
              <a href="#" className="text-blue-600 hover:underline">プライバシーポリシー</a>
              に同意したものとみなされます。
            </div>
          )}
        </div>

        {/* 戻るリンク */}
        <div className="mt-6 text-center">
          <Link 
            href="/"
            className="text-sm text-gray-600 hover:text-black transition-colors"
          >
            ← ホームページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}