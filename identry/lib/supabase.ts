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

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      user_id: user.id,
      ...profileData,
      skills: profileData.skills || []
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
  const user = await getCurrentUser()
  if (!user) throw new Error('認証が必要です')

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
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('identry_form_data')
    return data ? JSON.parse(data) : null
  }
  return null
}

export const clearFormDataLocally = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('identry_form_data')
  }
}

// プロフィール更新
export const updateProfile = async (profileData: Partial<Profile>) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('認証が必要です')

  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ブロック公開設定更新
export const updateBlockVisibility = async (blockSettings: {
  show_education?: boolean
  show_career?: boolean
  show_portfolio?: boolean
  show_skills?: boolean
  show_sns?: boolean
}) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('認証が必要です')

  const { data, error } = await supabase
    .from('profiles')
    .update(blockSettings)
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