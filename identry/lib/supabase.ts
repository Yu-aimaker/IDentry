import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

// ユーザーのプロフィール一覧取得
export const getUserProfiles = async () => {
  const user = await getCurrentUser()
  if (!user) throw new Error('認証が必要です')

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
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