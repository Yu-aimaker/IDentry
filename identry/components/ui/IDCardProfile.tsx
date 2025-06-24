"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { User, Building, Calendar, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
// import { cn } from "@/lib/utils"

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

interface ProfileCardData {
  name: string
  title: string
  department: string
  employeeId: string
  avatar?: string
  joinDate: string
  email: string
}

interface IDCardProfileProps {
  profileData?: ProfileCardData
  variant?: "pasmo" | "credit" | "corporate" | "metro"
  className?: string
  showPresetSelector?: boolean
  onVariantChange?: (variant: string) => void
  enableAvatarUpload?: boolean
  onAvatarUpload?: (file: File) => Promise<void>
}

const cardVariants = {
  pasmo: {
    background: "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700",
    accent: "bg-yellow-400",
    text: "text-white",
    pattern: "pasmo"
  },
  credit: {
    background: "bg-gradient-to-br from-slate-800 via-slate-900 to-black",
    accent: "bg-gold-400",
    text: "text-white",
    pattern: "credit"
  },
  corporate: {
    background: "bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800",
    accent: "bg-white",
    text: "text-white",
    pattern: "corporate"
  },
  metro: {
    background: "bg-gradient-to-br from-red-500 via-red-600 to-red-700",
    accent: "bg-white",
    text: "text-white",
    pattern: "metro"
  }
}

const presetOptions = [
  { id: "pasmo", name: "PASMO風", color: "bg-blue-600" },
  { id: "credit", name: "クレカ風", color: "bg-slate-800" },
  { id: "corporate", name: "社員証風", color: "bg-emerald-600" },
  { id: "metro", name: "メトロ風", color: "bg-red-600" }
] as const

const PatternOverlay = ({ variant }: { variant: string }) => {
  if (variant === "pasmo") {
    return (
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white rounded-full" />
        <div className="absolute top-8 right-8 w-12 h-1 bg-white" />
        <div className="absolute bottom-8 left-8 w-16 h-1 bg-white" />
      </div>
    )
  }
  
  if (variant === "credit") {
    return (
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-6 right-6 w-10 h-6 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded" />
        <div className="absolute bottom-6 left-6 text-xs font-mono opacity-60">VALID THRU</div>
      </div>
    )
  }
  
  if (variant === "corporate") {
    return (
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-4 right-4 w-6 h-6 border border-white" />
        <div className="absolute bottom-4 left-4 text-xs opacity-60">AUTHORIZED PERSONNEL</div>
      </div>
    )
  }
  
  return (
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-4 left-4 w-4 h-4 bg-white rounded-full" />
      <div className="absolute top-4 right-4 w-4 h-4 bg-white rounded-full" />
    </div>
  )
}

const IDCardProfile = React.forwardRef<HTMLDivElement, IDCardProfileProps>(
  ({ profileData, variant = "pasmo", className, showPresetSelector = false, onVariantChange, enableAvatarUpload = false, onAvatarUpload, ...props }, ref) => {
    const [selectedVariant, setSelectedVariant] = React.useState(variant)
    const [showSensitive, setShowSensitive] = React.useState(false)
    const [uploading, setUploading] = React.useState(false)
    const [uploadError, setUploadError] = React.useState<string | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    
    const defaultProfile: ProfileCardData = {
      name: "田中 太郎",
      title: "シニアエンジニア",
      department: "開発部",
      employeeId: "EMP-2024-001",
      joinDate: "2024/04",
      email: "tanaka@company.com",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    }

    const profile = profileData || defaultProfile
    const currentVariant = cardVariants[selectedVariant as keyof typeof cardVariants]

    React.useEffect(() => {
      setSelectedVariant(variant)
    }, [variant])

    type VariantType = "pasmo" | "credit" | "corporate" | "metro"
    const handleVariantChange = (v: VariantType) => {
      setSelectedVariant(v)
      if (onVariantChange) onVariantChange(v)
    }

    return (
      <div ref={ref} className={cn("w-full max-w-2xl mx-auto p-6 space-y-6", className)} {...props}>
        {/* デザインプリセット選択UI（外部制御） */}
        {showPresetSelector && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">デザインプリセット</h3>
            <div className="flex flex-wrap gap-3">
              {presetOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => handleVariantChange(option.id as VariantType)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all",
                    selectedVariant === option.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={cn("w-4 h-4 rounded", option.color)} />
                  <span className="text-sm font-medium">{option.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* IDカード */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className={cn(
            "relative w-full h-56 rounded-2xl overflow-hidden shadow-2xl",
            currentVariant.background
          )}>
            <PatternOverlay variant={selectedVariant} />
            
            {/* カード内容 */}
            <div className={cn("relative z-10 h-full p-6 flex", currentVariant.text)}>
              {/* 左側: アバター */}
              <div className="flex-shrink-0 mr-6">
                <motion.div
                  className="w-20 h-20 rounded-xl overflow-hidden bg-white/20 backdrop-blur-sm border border-white/30 relative group"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  onClick={() => enableAvatarUpload && fileInputRef.current?.click()}
                  style={{ cursor: enableAvatarUpload ? 'pointer' : undefined }}
                >
                  {uploading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                  )}
                  {profile.avatar ? (
                    <Image
                      src={profile.avatar}
                      alt={profile.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-10 h-10 text-white/70" />
                    </div>
                  )}
                  {enableAvatarUpload && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity">画像を変更</div>
                  )}
                  {enableAvatarUpload && (
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={async (e) => {
                        if (!e.target.files || !e.target.files[0]) return;
                        setUploadError(null);
                        setUploading(true);
                        try {
                          await onAvatarUpload?.(e.target.files[0]);
                        } catch (err: unknown) {
                          if (err instanceof Error) {
                            setUploadError(err.message);
                          } else {
                            setUploadError('アップロードに失敗しました');
                          }
                        } finally {
                          setUploading(false);
                        }
                      }}
                    />
                  )}
                </motion.div>
                {uploadError && <div className="text-xs text-red-500 mt-1">{uploadError}</div>}
              </div>

              {/* 右側: 情報 */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <motion.h2
                    className="text-2xl font-bold mb-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {profile.name}
                  </motion.h2>
                  
                  <motion.div
                    className="space-y-1 text-sm opacity-90"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      <span>{profile.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{profile.title}</span>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs opacity-75">社員ID</div>
                    <button
                      onClick={() => setShowSensitive(!showSensitive)}
                      className="p-1 rounded hover:bg-white/20 transition-colors"
                    >
                      {showSensitive ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  
                  <div className="font-mono text-sm">
                    {showSensitive ? profile.employeeId : "***-****-***"}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs opacity-75">
                    <Calendar className="w-3 h-3" />
                    <span>入社: {showSensitive ? profile.joinDate : "****/**"}</span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* ホログラム効果 */}
            <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-white/30 to-transparent rounded-full backdrop-blur-sm border border-white/50" />
          </div>

          {/* カード下部の磁気ストライプ風 */}
          <div className="mt-2 h-2 bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 rounded-sm opacity-60" />
        </motion.div>

        {/* 追加情報 */}
        <motion.div
          className="bg-card border border-border rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h4 className="font-semibold mb-2 text-foreground">詳細情報</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>メール: {showSensitive ? profile.email : "***@***.com"}</div>
            <div>発行日: {new Date().toLocaleDateString('ja-JP')}</div>
            <div>有効期限: {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP')}</div>
          </div>
        </motion.div>
      </div>
    )
  }
)

IDCardProfile.displayName = "IDCardProfile"

export { IDCardProfile }

export default function IDCardProfileDemo() {
  return <IDCardProfile />
} 