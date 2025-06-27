"use client"

import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Building, Calendar, Eye, EyeOff, MapPin, BadgeCheck } from "lucide-react"
import Image from "next/image"

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export interface ProfileData {
  name: string
  title: string
  department: string
  employeeId: string
  joinDate: string
  location: string
  avatar?: string
}

export interface CardDesign {
  id: string
  name: string
  background: string
  textColor: string
  accentColor: string
  borderColor?: string
  pattern?: string
  glassEffect?: boolean
}

export const cardDesigns: CardDesign[] = [
  {
    id: "modern-glass",
    name: "Modern Glass",
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
    textColor: "text-foreground",
    accentColor: "hsl(var(--primary))",
    borderColor: "rgba(255, 255, 255, 0.1)",
    pattern: "glass",
    glassEffect: true
  },
  {
    id: "gradient-purple",
    name: "Gradient Purple",
    background: "linear-gradient(135deg, hsl(var(--primary) / 0.8) 0%, hsl(var(--primary) / 0.4) 100%)",
    textColor: "text-white",
    accentColor: "#ffffff",
    pattern: "modern"
  },
  {
    id: "pasmo",
    name: "デフォルト",
    background: "linear-gradient(135deg, #00A0E9 0%, #0066CC 100%)",
    textColor: "text-white",
    accentColor: "#FFD700",
    pattern: "pasmo"
  },
  {
    id: "credit",
    name: "Credit Card",
    background: "linear-gradient(135deg, #1a1a1a 0%, #333333 100%)",
    textColor: "text-white",
    accentColor: "#FFD700",
    pattern: "credit"
  }
]

export interface IDCardProps {
  profile: ProfileData
  design: CardDesign
  className?: string
}

const IDCard = React.forwardRef<HTMLDivElement, IDCardProps>(
  ({ profile, design, className }, ref) => {
    const [isRevealed, setIsRevealed] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    const PatternOverlay = () => {
      if (design.pattern === "pasmo") {
        return (
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white rounded-full" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border border-white rounded" />
          </div>
        )
      }
      
      if (design.pattern === "glass") {
        return (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            <div className="absolute bottom-4 left-4 w-32 h-32 bg-primary/10 rounded-full blur-xl" />
          </div>
        )
      }

      if (design.pattern === "modern") {
        return (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16 blur-xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />
            <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/5 rounded-full transform -translate-x-1/2 -translate-y-1/2 blur-md" />
          </div>
        )
      }

      if (design.pattern === "minimal") {
        return (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          </div>
        )
      }

      if (design.pattern === "credit") {
        return (
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12" />
          </div>
        )
      }

      return null
    }

    return (
      <motion.div
        ref={ref}
        className={cn("relative", className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          className={cn(
            "relative w-80 h-48 rounded-2xl shadow-xl overflow-hidden",
            design.borderColor && "border",
            design.glassEffect && "backdrop-blur-md"
          )}
          style={{
            background: design.background,
            borderColor: design.borderColor
          }}
          whileHover={{ 
            scale: 1.02,
            transition: { type: "spring", stiffness: 400, damping: 10 }
          }}
        >
          <PatternOverlay />
          
          {/* Card Content */}
          <div className="relative z-10 p-6 h-full flex">
            {/* Left side - Avatar */}
            <div className="flex-shrink-0 mr-4">
              <motion.div
                className={cn(
                  "w-16 h-16 rounded-full overflow-hidden backdrop-blur-sm border-2",
                  design.id === "minimal-dark" ? "bg-background/20 border-border/30" : "bg-white/20 border-white/30"
                )}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {profile.avatar ? (
                  <Image
                    src={profile.avatar}
                    alt={profile.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className={cn("w-8 h-8", design.id === "minimal-dark" ? "text-foreground/70" : "text-white/70")} />
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right side - Information */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <motion.div
                  className="flex items-center gap-1 mb-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className={cn("text-xl font-bold", design.textColor)}>
                    {profile.name}
                  </h2>
                  <BadgeCheck className={cn("w-4 h-4", 
                    design.id === "minimal-dark" ? "text-primary" : "text-white/80"
                  )} />
                </motion.div>
                
                <motion.p
                  className={cn("text-sm opacity-90 mb-2", design.textColor)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {profile.title}
                </motion.p>

                <motion.div
                  className={cn("flex items-center text-xs opacity-80 mb-1", design.textColor)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Building className="w-3 h-3 mr-1" />
                  {profile.department}
                </motion.div>
              </div>

              <div className="space-y-1">
                <motion.div
                  className={cn("flex items-center justify-between text-xs", design.textColor)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="opacity-70">ID:</span>
                  <span className="font-mono">
                    {isRevealed ? profile.employeeId : "***-****-***"}
                  </span>
                </motion.div>

                <motion.div
                  className={cn("flex items-center justify-between text-xs", design.textColor)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <span className="opacity-70 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Joined:
                  </span>
                  <span>{profile.joinDate}</span>
                </motion.div>

                <motion.div
                  className={cn("flex items-center justify-between text-xs", design.textColor)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <span className="opacity-70 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    Location:
                  </span>
                  <span>{profile.location}</span>
                </motion.div>
              </div>
            </div>

            {/* Reveal Button */}
            <motion.button
              className={cn(
                "absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm border border-white/30 transition-colors",
                design.id === "minimal-dark" 
                  ? "bg-background/20 hover:bg-background/30 border-border/30" 
                  : "bg-white/20 hover:bg-white/30"
              )}
              onClick={() => setIsRevealed(!isRevealed)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
            >
              {isRevealed ? (
                <EyeOff className={cn("w-4 h-4", design.id === "minimal-dark" ? "text-foreground" : "text-white")} />
              ) : (
                <Eye className={cn("w-4 h-4", design.id === "minimal-dark" ? "text-foreground" : "text-white")} />
              )}
            </motion.button>
          </div>

          {/* Chip simulation for credit card style */}
          {design.pattern === "credit" && (
            <motion.div
              className="absolute bottom-4 right-4 w-8 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-sm"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            />
          )}

          {/* Animated highlight effect on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ opacity: 0, x: -200 }}
                animate={{ opacity: 1, x: 200 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    )
  }
)
IDCard.displayName = "IDCard"

export interface DesignSelectorProps {
  designs: CardDesign[]
  selectedDesign: CardDesign
  onDesignChange: (design: CardDesign) => void
}

export const DesignSelector: React.FC<DesignSelectorProps> = ({
  designs,
  selectedDesign,
  onDesignChange
}) => {
  return (
    <div className="p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl">
      <h3 className="text-lg font-semibold text-foreground mb-4">カードデザイン</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {designs.map((design) => (
          <motion.button
            key={design.id}
            onClick={() => onDesignChange(design)}
            className={cn(
              "relative p-3 rounded-lg border-2 transition-all",
              selectedDesign.id === design.id
                ? "border-primary shadow-md"
                : "border-border/50 hover:border-primary/50"
            )}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className="w-full h-16 rounded-md mb-2 overflow-hidden"
              style={{ background: design.background }}
            >
              {design.pattern === "glass" && (
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-full blur-sm" />
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-foreground">
              {design.name}
            </span>
            
            <AnimatePresence>
              {selectedDesign.id === design.id && (
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default IDCard; 