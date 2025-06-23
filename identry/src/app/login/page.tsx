'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { getFormDataLocally, clearFormDataLocally, createProfile, addEducation, addCareer, addPortfolio } from '../../../lib/supabase';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle } = useAuth();

  // フォームデータをデータベースに保存する関数
  const saveFormDataToDatabase = async () => {
    const formData = getFormDataLocally();
    if (!formData) return;

    try {
      // プロフィール作成
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

      // ローカルストレージをクリア
      clearFormDataLocally();
    } catch (error) {
      console.error('フォームデータ保存エラー:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      
      // フォームデータが保存されている場合、データベースに保存
      await saveFormDataToDatabase();
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Googleログインエラー:', error);
      alert('Googleログインに失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert('メールアドレスとパスワードを入力してください。');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      alert('パスワードが一致しません。');
      return;
    }

    try {
      setIsLoading(true);
      
      if (isLogin) {
        await signIn(email, password);
        alert('ログインが成功しました！');
      } else {
        await signUp(email, password);
        alert('アカウント作成が完了しました！確認メールを送信しました。');
      }

      // フォームデータが保存されている場合、データベースに保存
      await saveFormDataToDatabase();
      
      router.push('/dashboard');
    } catch (error) {
      console.error('認証エラー:', error);
      alert(isLogin ? 'ログインに失敗しました。' : 'アカウント作成に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* ロゴ */}
        <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">ID</span>
          </div>
          <span className="text-2xl font-bold text-black">IDentry</span>
        </Link>
        
        <h2 className="text-center text-3xl font-bold text-black">
          {isLogin ? 'ログイン' : 'アカウント作成'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin ? (
            <>
              アカウントをお持ちでない方は{' '}
              <button
                onClick={() => setIsLogin(false)}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                アカウント作成
              </button>
            </>
          ) : (
            <>
              既にアカウントをお持ちの方は{' '}
              <button
                onClick={() => setIsLogin(true)}
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