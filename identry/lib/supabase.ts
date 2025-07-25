import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// データベースの型定義
export interface Profile {
  id: string
  user_id: string
  name: string
  birth_year?: string
  birth_month?: string
  birth_day?: string
  birth_date?: string
  gender?: string
  address?: string
  photo?: string
  bio?: string
  twitter?: string
  instagram?: string
  linkedin?: string
  github?: string
  skills: string[]
  is_public: boolean
  views_count: number
  profile_url: string
  created_at: string
  updated_at: string
  show_education: boolean
  show_career: boolean
  show_portfolio: boolean
  show_skills: boolean
  show_sns: boolean
  banner_image?: string
  nickname?: string
  google_avatar_url?: string
  education?: Education[]
  career?: Career[]
  portfolio?: Portfolio[]
  custom_id?: string | null
}

export interface Education {
  id: string
  profile_id: string
  school: string
  degree?: string
  year?: string
  created_at: string
}

export interface Career {
  id: string
  profile_id: string
  company: string
  position?: string
  period?: string
  created_at: string
}

export interface Portfolio {
  id: string
  profile_id: string
  title: string
  description?: string
  url?: string
  image?: string
  created_at: string
}

// 認証ヘルパー関数
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// GoogleアカウントのアバターURLを取得する関数
export const getGoogleAvatarUrl = async () => {
  const { data } = await supabase.auth.getSession()
  return data.session?.user.user_metadata.avatar_url || null
}

// プロフィール画像のURLを取得（優先順位: photo -> google_avatar_url -> null）
export const getProfileImageUrl = (profile: Profile | null): string | null => {
  if (!profile) return null
  
  // 1. 設定されたプロフィール画像があれば優先
  if (profile.photo) {
    return profile.photo
  }
  
  // 2. Googleアバターがあれば使用
  if (profile.google_avatar_url) {
    return profile.google_avatar_url
  }
  
  // 3. どちらもない場合はnull
  return null
}

// プロフィール作成
export const createProfile = async (profileData: {
  name: string
  birth_year?: string
  birth_month?: string
  birth_day?: string
  birth_date?: string
  gender?: string
  address?: string
  photo?: string
  bio?: string
  twitter?: string
  instagram?: string
  linkedin?: string
  github?: string
  skills?: string[]
}) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('認証が必要です')

  // GoogleアカウントのアバターURLを取得（プロフィール画像がない場合のみ）
  let googleAvatarUrl = null;
  if (!profileData.photo) {
    googleAvatarUrl = await getGoogleAvatarUrl();
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      user_id: user.id,
      ...profileData,
      skills: profileData.skills || [],
      google_avatar_url: googleAvatarUrl
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// プロフィール取得
export const getProfile = async (profileId?: string) => {
  const user = await getCurrentUser()
  if (!user && !profileId) throw new Error('認証が必要です')

  let query = supabase
    .from('profiles')
    .select(`
      *,
      education(*),
      career(*),
      portfolio(*)
    `)

  if (profileId) {
    query = query.eq('id', profileId)
  } else {
    query = query.eq('user_id', user!.id)
  }

  const { data, error } = await query.single()
  if (error) throw error
  return data
}

// ユーザーのプロフィール取得（1つのみ）
export const getUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      education(*),
      career(*),
      portfolio(*)
    `)
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116は「データが見つからない」エラー
  return data
}

// 学歴追加
export const addEducation = async (profileId: string, education: {
  school: string
  degree?: string
  year?: string
}) => {
  const { data, error } = await supabase
    .from('education')
    .insert({
      profile_id: profileId,
      ...education
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// 職歴追加
export const addCareer = async (profileId: string, career: {
  company: string
  position?: string
  period?: string
}) => {
  const { data, error } = await supabase
    .from('career')
    .insert({
      profile_id: profileId,
      ...career
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ポートフォリオ追加
export const addPortfolio = async (profileId: string, portfolio: {
  title: string
  description?: string
  url?: string
  image?: string
}) => {
  const { data, error } = await supabase
    .from('portfolio')
    .insert({
      profile_id: profileId,
      ...portfolio
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// プロフィール公開設定更新
export const updateProfileVisibility = async (profileId: string, isPublic: boolean) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_public: isPublic })
    .eq('id', profileId)
    .select()
    .single()

  if (error) throw error
  return data
}

// プロフィール閲覧数増加
export const incrementViews = async (profileId: string) => {
  const { error } = await supabase.rpc('increment_profile_views', {
    profile_id: profileId
  })
  
  if (error) throw error
}

// 一時保存用のローカルストレージヘルパー
export const saveFormDataLocally = (formData: Record<string, unknown>) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('identry_form_data', JSON.stringify(formData))
  }
}

export const getFormDataLocally = () => {
  if (typeof window === 'undefined') return null;
  const savedData = localStorage.getItem('identry_form_data');
  return savedData ? JSON.parse(savedData) : null;
}

export const clearFormDataLocally = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('identry_form_data')
  }
}

// プロフィール更新
export const updateProfile = async (updates: Partial<Profile>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
  return data;
}

// ブロック公開設定更新
export const updateBlockVisibility = async (updates: Partial<Profile>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  return data
}

// 画像アップロード機能
export const uploadProfileImage = async (file: File): Promise<string> => {
  const user = await getCurrentUser()
  if (!user) throw new Error('認証が必要です')

  // ファイル名を生成（ユーザーID/タイムスタンプ_ファイル名）
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('profile-images')
    .upload(fileName, file)

  if (error) throw error

  // 公開URLを取得
  const { data: urlData } = supabase.storage
    .from('profile-images')
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

// 未認証ユーザー用の一時的な画像アップロード（セッションベース）
export const uploadTempProfileImage = async (file: File): Promise<string> => {
  // ファイル名を生成（temp/セッションID_タイムスタンプ_ファイル名）
  const fileExt = file.name.split('.').pop()
  const sessionId = Math.random().toString(36).substring(2)
  const fileName = `temp/${sessionId}_${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('profile-images')
    .upload(fileName, file)

  if (error) throw error

  // 公開URLを取得
  const { data: urlData } = supabase.storage
    .from('profile-images')
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

// 画像削除機能
export const deleteProfileImage = async (imageUrl: string): Promise<void> => {
  const user = await getCurrentUser()
  if (!user) throw new Error('認証が必要です')

  // URLからファイルパスを抽出
  const url = new URL(imageUrl)
  const pathParts = url.pathname.split('/')
  const fileName = pathParts[pathParts.length - 1]
  const filePath = `${user.id}/${fileName}`

  const { error } = await supabase.storage
    .from('profile-images')
    .remove([filePath])

  if (error) throw error
}

// プロフィール編集用の包括的な更新関数
export const updateFullProfile = async (profileData: {
  name: string
  birth_year?: string
  birth_month?: string
  birth_day?: string
  birth_date?: string
  gender?: string
  address?: string
  photo?: string
  bio?: string
  twitter?: string
  instagram?: string
  linkedin?: string
  github?: string
  skills?: string[]
  google_avatar_url?: string
  education?: Array<{
    school: string
    degree?: string
    year?: string
  }>
  career?: Array<{
    company: string
    position?: string
    period?: string
  }>
  portfolio?: Array<{
    title: string
    description?: string
    url?: string
    image?: string
  }>
}) => {
  const user = await getCurrentUser()
  if (!user) return null;

  try {
    // プロフィール情報を更新
    const { education, career, portfolio, ...mainProfileData } = profileData
    
    // Googleアバター情報を取得（ローカルデータに写真がない場合のみ）
    let finalGoogleAvatarUrl = mainProfileData.google_avatar_url;
    if (!mainProfileData.photo && !mainProfileData.google_avatar_url) {
      finalGoogleAvatarUrl = await getGoogleAvatarUrl();
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        ...mainProfileData,
        skills: mainProfileData.skills || [],
        google_avatar_url: finalGoogleAvatarUrl
      }, { onConflict: 'user_id' })
      .select()
      .single()

    if (profileError) {
      console.error('プロフィール更新エラー詳細:', profileError)
      throw new Error(`プロフィールの更新に失敗しました: ${profileError.message || 'データベースエラー'}`)
    }

    // 既存の学歴、職歴、ポートフォリオを削除
    const deletePromises = await Promise.allSettled([
      supabase.from('education').delete().eq('profile_id', profile.id),
      supabase.from('career').delete().eq('profile_id', profile.id),
      supabase.from('portfolio').delete().eq('profile_id', profile.id)
    ])

    // 削除エラーをログに記録（非致命的）
    deletePromises.forEach((result, index) => {
      if (result.status === 'rejected') {
        const tables = ['education', 'career', 'portfolio']
        console.warn(`${tables[index]}の削除に失敗:`, result.reason)
      }
    })

    // 新しい学歴を追加
    if (education && education.length > 0) {
      const uniqueEducation = education.filter((edu, idx, arr) =>
        arr.findIndex((e) => e.school === edu.school && e.degree === edu.degree && e.year === edu.year) === idx
      );
      const educationData = uniqueEducation
        .filter(edu => edu.school) // 空の学校名は除外
        .map(edu => ({
          profile_id: profile.id,
          school: edu.school,
          degree: edu.degree || '',
          year: edu.year || ''
        }));
      
      if (educationData.length > 0) {
        const { error: educationError } = await supabase
          .from('education')
          .insert(educationData);
        
        if (educationError) {
          console.error('学歴追加エラー:', educationError);
          throw new Error(`学歴の追加に失敗しました: ${educationError.message}`);
        }
      }
    }

    // 新しい職歴を追加
    if (career && career.length > 0) {
      const uniqueCareer = career.filter((car, idx, arr) =>
        arr.findIndex((c) => c.company === car.company && c.position === car.position && c.period === car.period) === idx
      );
      const careerData = uniqueCareer
        .filter(car => car.company) // 空の会社名は除外
        .map(car => ({
          profile_id: profile.id,
          company: car.company,
          position: car.position || '',
          period: car.period || ''
        }));
      
      if (careerData.length > 0) {
        const { error: careerError } = await supabase
          .from('career')
          .insert(careerData);
        
        if (careerError) {
          console.error('職歴追加エラー:', careerError);
          throw new Error(`職歴の追加に失敗しました: ${careerError.message}`);
        }
      }
    }

    // 新しいポートフォリオを追加
    if (portfolio && portfolio.length > 0) {
      const uniquePortfolio = portfolio.filter((port, idx, arr) =>
        arr.findIndex((p) => p.title === port.title && p.description === port.description && p.url === port.url && p.image === port.image) === idx
      );
      const portfolioData = uniquePortfolio
        .filter(port => port.title) // 空のタイトルは除外
        .map(port => ({
          profile_id: profile.id,
          title: port.title,
          description: port.description || '',
          url: port.url || '',
          image: port.image || ''
        }));
      
      if (portfolioData.length > 0) {
        const { error: portfolioError } = await supabase
          .from('portfolio')
          .insert(portfolioData);
        
        if (portfolioError) {
          console.error('ポートフォリオ追加エラー:', portfolioError);
          throw new Error(`ポートフォリオの追加に失敗しました: ${portfolioError.message}`);
        }
      }
    }

    return profile
  } catch (error) {
    console.error('プロフィール更新エラー:', error)
    // エラーを詳細にログに出力
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error(`プロフィール更新中に予期しないエラーが発生しました: ${String(error)}`)
    }
  }
}

export const getProfileByCustomId = async (customId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      education (*),
      career (*),
      portfolio (*)
    `)
    .eq('custom_id', customId)
    .eq('is_public', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // PostgREST error for "queried row does not exist"
      console.log(`No public profile found for custom_id: ${customId}`);
      return null;
    }
    console.error('Error fetching profile by custom ID:', error);
    throw error;
  }

  return data as Profile;
} 

// OGP画像を取得する関数
export const fetchOGPImage = async (url: string): Promise<string | null> => {
  if (!url) return null;
  
  try {
    // URLが有効かチェック
    const validUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // OGP取得APIを呼び出し（Next.jsのAPIルートを使用）
    const response = await fetch(`/api/ogp?url=${encodeURIComponent(validUrl)}`);
    
    if (!response.ok) {
      console.error('OGP取得エラー:', response.status);
      return null;
    }
    
    const data = await response.json();
    return data.image || null;
  } catch (error) {
    console.error('OGP画像取得エラー:', error);
    return null;
  }
};

// ポートフォリオのOGP画像をキャッシュ付きで取得
const ogpCache = new Map<string, string | null>();

export const getPortfolioOGPImage = async (url: string): Promise<string | null> => {
  if (!url) return null;
  
  // キャッシュから確認
  if (ogpCache.has(url)) {
    return ogpCache.get(url) || null;
  }
  
  // OGP画像を取得
  const ogpImage = await fetchOGPImage(url);
  
  // キャッシュに保存
  ogpCache.set(url, ogpImage);
  
  return ogpImage;
}; 