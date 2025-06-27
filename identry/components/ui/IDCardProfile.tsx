"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { User, Building, Edit2, Check, X, Mail, Palette } from "lucide-react"
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
  variant?: "pasmo" | "credit" | "corporate" | "metro" | "minimal" | "glass" | "custom"
  className?: string
  showPresetSelector?: boolean
  onVariantChange?: (variant: string) => void
  enableAvatarUpload?: boolean
  onAvatarUpload?: (file: File) => Promise<void>
  onSaveId?: (newId: string) => Promise<void>
  customColor?: string
  onCustomColorChange?: (color: string) => void
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
  },
  custom: {
    background: "",
    accent: "bg-white",
    text: "text-white",
    pattern: "custom"
  }
} as const;

const presetOptions = [
  { id: "pasmo", name: "デフォルト", color: "bg-blue-600" },
  { id: "credit", name: "クレカ風", color: "bg-slate-800" },
  { id: "corporate", name: "社員証風", color: "bg-emerald-600" },
  { id: "metro", name: "メトロ風", color: "bg-red-600" },
  { id: "custom", name: "カスタム", color: "bg-gradient-to-r from-purple-500 to-pink-500" }
] as const;

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
  
  if (variant === "minimal") {
    return (
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      </div>
    )
  }
  
  if (variant === "glass") {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/20 rounded-full blur-xl" />
        <div className="absolute bottom-4 left-4 w-32 h-32 bg-blue-200/30 rounded-full blur-xl" />
      </div>
    )
  }
  
  if (variant === "custom") {
    return (
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4 w-6 h-6 border-2 border-white rounded" />
        <div className="absolute top-4 right-4 w-6 h-6 border-2 border-white rounded" />
        <div className="absolute bottom-4 left-4 w-8 h-1 bg-white" />
        <div className="absolute bottom-4 right-4 w-8 h-1 bg-white" />
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

const ColorPicker = ({ color, onChange }: { color: string, onChange: (color: string) => void }) => {
  const [showPicker, setShowPicker] = React.useState(false);
  const [tempColor, setTempColor] = React.useState(color);

  const presetColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
    '#14B8A6', '#F43F5E', '#8B5A2B', '#1F2937', '#7C3AED'
  ];

  const handleColorChange = (newColor: string) => {
    setTempColor(newColor);
    onChange(newColor);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        type="button"
      >
        <div 
          className="w-5 h-5 rounded border border-gray-300" 
          style={{ backgroundColor: color }}
        />
        <Palette className="w-4 h-4" />
        <span className="text-sm">カラーを選択</span>
      </button>
      
      {showPicker && (
        <div className="absolute top-12 left-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-4 min-w-[280px]">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カスタムカラー
              </label>
              <input
                type="color"
                value={tempColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プリセットカラー
              </label>
              <div className="grid grid-cols-5 gap-2">
                {presetColors.map((presetColor) => (
                  <button
                    key={presetColor}
                    onClick={() => handleColorChange(presetColor)}
                    className={cn(
                      "w-8 h-8 rounded-lg border-2 transition-all hover:scale-110",
                      tempColor === presetColor ? "border-gray-800" : "border-gray-300"
                    )}
                    style={{ backgroundColor: presetColor }}
                    type="button"
                  />
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowPicker(false)}
                className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                type="button"
              >
                決定
              </button>
              <button
                onClick={() => {
                  setTempColor(color);
                  setShowPicker(false);
                }}
                className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                type="button"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const IDCardProfile = React.forwardRef<HTMLDivElement, IDCardProfileProps>(
  ({ 
    profileData, 
    variant = "pasmo", 
    className, 
    showPresetSelector = false, 
    onVariantChange, 
    enableAvatarUpload = false, 
    onAvatarUpload, 
    onSaveId,
    customColor = "#8B5CF6",
    onCustomColorChange,
    ...props 
  }, ref) => {
    const [selectedVariant, setSelectedVariant] = React.useState(variant)
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
    const profile = profileData ? profileData : defaultProfile;
    const [editId, setEditId] = React.useState(false);
    const [idValue, setIdValue] = React.useState(profile.employeeId);
    const [idError, setIdError] = React.useState<string | null>(null);
    const currentVariant = cardVariants[selectedVariant as keyof typeof cardVariants];

    // Hydrationエラー防止: 日付はクライアント側でのみ生成
    const [issueDate, setIssueDate] = React.useState('');
    const [expireDate, setExpireDate] = React.useState('');
    React.useEffect(() => {
      setIssueDate(new Date().toLocaleDateString('ja-JP'));
      setExpireDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP'));
    }, []);

    React.useEffect(() => {
      setSelectedVariant(variant);
      setIdValue(profile.employeeId);
    }, [variant, profile.employeeId]);

    type VariantType = "pasmo" | "credit" | "corporate" | "metro" | "minimal" | "glass" | "custom"
    const handleVariantChange = (v: VariantType) => {
      setSelectedVariant(v)
      if (onVariantChange) onVariantChange(v)
    }

    const [showPresetOptions, setShowPresetOptions] = React.useState(false);

    // カスタムカラーのスタイルを生成
    const getCustomStyle = () => {
      if (selectedVariant === 'custom') {
        const rgb = hexToRgb(customColor);
        if (rgb) {
          const { r, g, b } = rgb;
          return {
            background: `linear-gradient(135deg, rgb(${r}, ${g}, ${b}) 0%, rgb(${Math.max(0, r-30)}, ${Math.max(0, g-30)}, ${Math.max(0, b-30)}) 50%, rgb(${Math.max(0, r-60)}, ${Math.max(0, g-60)}, ${Math.max(0, b-60)}) 100%)`
          };
        }
      }
      return {};
    };

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    return (
      <div ref={ref} className={cn("w-full max-w-2xl mx-auto p-6 space-y-6", className)} {...props}>
        {/* デザインプリセット変更ボタン（カード右上・アイコン） */}
        {showPresetSelector && (
          <div className="relative">
            <button
              className="absolute top-2 right-2 z-20 p-2 rounded-full bg-white/70 hover:bg-blue-100 border border-gray-200 shadow transition-colors"
              onClick={() => setShowPresetOptions(v => !v)}
              aria-label="デザインプリセット変更"
              type="button"
            >
              <Edit2 className="w-5 h-5 text-gray-500" />
            </button>
            {showPresetOptions && (
              <div className="absolute top-10 right-0 z-30 bg-white border border-gray-200 rounded-xl shadow-lg p-3 min-w-[180px] animate-fade-in">
                {presetOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      handleVariantChange(option.id as VariantType);
                      setShowPresetOptions(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm w-full",
                      selectedVariant === option.id
                        ? "bg-blue-100 text-blue-700 font-semibold"
                        : "hover:bg-gray-100 text-gray-700"
                    )}
                    type="button"
                  >
                    <div className={cn("w-4 h-4 rounded", option.color)} />
                    <span>{option.name}</span>
                  </button>
                ))}
                
                {/* カスタムカラーピッカー */}
                {selectedVariant === 'custom' && onCustomColorChange && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <ColorPicker 
                      color={customColor} 
                      onChange={onCustomColorChange}
                    />
                  </div>
                )}
                
                <button
                  className="mt-3 w-full px-3 py-2 rounded-lg text-xs text-gray-400 hover:bg-gray-50"
                  onClick={() => setShowPresetOptions(false)}
                  type="button"
                >キャンセル</button>
              </div>
            )}
          </div>
        )}

        {/* IDカード */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div 
            className={cn(
              "relative w-full max-w-md min-h-[260px] rounded-2xl overflow-hidden shadow-2xl mx-auto bg-white/0 flex flex-col",
              selectedVariant !== 'custom' ? currentVariant.background : ""
            )}
            style={selectedVariant === 'custom' ? getCustomStyle() : undefined}
          >
            <PatternOverlay variant={selectedVariant} />
            {/* カード内容 */}
            <div className={cn("relative z-10 w-full flex flex-col items-center gap-2 md:gap-4 p-4 md:p-8", currentVariant.text)}>
              {/* アバター */}
              <div className="flex flex-col items-center justify-center mb-2 md:mb-4">
                <motion.div
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm border border-white/30 relative group shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
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
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-white/70" />
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
              {/* メイン情報 */}
              <div className="flex flex-col items-center justify-center w-full">
                <motion.h2
                  className="text-2xl md:text-3xl font-bold mb-1 text-center"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {profile.name}
                </motion.h2>
                <motion.div
                  className="flex flex-col items-center gap-1 text-base md:text-lg opacity-90 mb-2"
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
              {/* サブ情報 */}
              <motion.div
                className="flex flex-col items-center gap-1 w-full mt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-2 text-xs opacity-80">
                  <span className="font-semibold">ID:</span>
                  {!editId ? (
                    <span className="font-mono">{idValue}</span>
                  ) : (
                    <span className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={idValue}
                        onChange={e => setIdValue(e.target.value)}
                        className="font-mono text-xs border border-gray-300 rounded px-2 py-1 w-28"
                        maxLength={32}
                      />
                      <button
                        className="p-1 border border-red-300 text-red-400 rounded-full hover:bg-red-50"
                        onClick={async () => {
                          setIdError(null);
                          try {
                            if (onSaveId) await onSaveId(idValue);
                            setEditId(false);
                          } catch (e: unknown) {
                            if (e instanceof Error) {
                              setIdError(e.message || '保存に失敗しました');
                            } else {
                              setIdError('保存に失敗しました');
                            }
                          }
                        }}
                        title="保存"
                        type="button"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 border border-gray-400 text-gray-400 rounded-full hover:bg-gray-50"
                        onClick={() => { setEditId(false); setIdValue(profile.employeeId); setIdError(null); }}
                        title="キャンセル"
                        type="button"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  )}
                  {!editId && (
                    <button
                      onClick={() => setEditId(true)}
                      className="ml-2 p-1 rounded border border-gray-300 text-xs hover:bg-white/20 transition-colors"
                      title="IDを編集"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {idError && <div className="text-xs text-red-500 mt-1">{idError}</div>}
                <div className="flex items-center gap-2 text-xs opacity-80">
                  <Mail className="w-4 h-4" />
                  <span>{profile.email}</span>
                </div>
              </motion.div>
              {/* ホログラム効果 */}
              <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-white/30 to-transparent rounded-full backdrop-blur-sm border border-white/50" />
            </div>
          </div>
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
            <div>発行日: {issueDate || '--'}</div>
            <div>有効期限: {expireDate || '--'}</div>
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