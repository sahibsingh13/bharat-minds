"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { Globe, Paperclip, Send, Loader2, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

interface UseAutoResizeTextareaProps {
  minHeight: number
  maxHeight?: number
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return

      if (reset) {
        textarea.style.height = `${minHeight}px`
        return
      }

      textarea.style.height = `${minHeight}px`
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      )

      textarea.style.height = `${newHeight}px`
    },
    [minHeight, maxHeight]
  )

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = `${minHeight}px`
    }
  }, [minHeight])

  useEffect(() => {
    const handleResize = () => adjustHeight()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [adjustHeight])

  return { textareaRef, adjustHeight }
}

const MIN_HEIGHT = 40
const MAX_HEIGHT = 120

const AnimatedPlaceholder = ({ showSearch }: { showSearch: boolean }) => (
  <AnimatePresence mode="wait">
    <motion.p
      key={showSearch ? "search" : "ask"}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.1 }}
      className="pointer-events-none w-[150px] text-xs absolute text-gray-500"
    >
      {showSearch ? "Search the web..." : "Ask Anything..."}
    </motion.p>
  </AnimatePresence>
)

export function AiInput({ onSubmit, loading = false }: { onSubmit: (text: string, imageDataUrl?: string, webSearch?: boolean) => void; loading?: boolean }) {
  const [value, setValue] = useState("")
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: MIN_HEIGHT,
    maxHeight: MAX_HEIGHT,
  })
  const [showSearch, setShowSearch] = useState(true)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handelClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (fileInputRef.current) {
      fileInputRef.current.value = "" // Reset file input
    }
    setImagePreview(null) // Use null instead of empty string
  }

  const handelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async () => {
    let dataUrl: string | undefined
    if (imageFile) {
      dataUrl = await new Promise<string>((resolve) => {
        const fr = new FileReader()
        fr.onload = () => resolve(String(fr.result))
        fr.readAsDataURL(imageFile)
      })
    }
    onSubmit(value.trim(), dataUrl, showSearch)
    setValue("")
    setImageFile(null)
    setImagePreview(null)
    adjustHeight(true)
  }

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])
  return (
    <div className="w-full py-4">
      <div className="relative max-w-xl border rounded-[22px] border-gray-200 p-1 w-full mx-auto">
        <div className="relative rounded-2xl border border-gray-200 bg-gray-50 flex flex-col">
          <div className="overflow-y-auto" style={{ maxHeight: `${MAX_HEIGHT}px` }}>
            {imagePreview ? (
              <div className="grid grid-cols-[96px_1fr] gap-3 p-3 pr-4">
                <div className="relative h-[96px] w-[96px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  <Image
                    className="object-cover h-full w-full"
                    src={imagePreview}
                    height={240}
                    width={240}
                    alt="attached image"
                  />
                  <button
                    onClick={handelClose}
                    className="absolute top-1.5 right-1.5 inline-flex items-center justify-center h-6 w-6 rounded-full bg-black/70 text-white hover:bg-black/80 border border-white/20"
                    aria-label="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="relative rounded-xl bg-gray-100 border border-gray-200">
                  <Textarea
                    id="ai-input-04"
                    value={value}
                    placeholder=""
                    className="w-full rounded-xl px-4 py-3 bg-transparent border-none text-gray-800 text-xs resize-none focus-visible:ring-0 leading-[1.2]"
                    ref={textareaRef}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit()
                      }
                    }}
                    onChange={(e) => {
                      setValue(e.target.value)
                      adjustHeight()
                    }}
                  />
                  {!value && (
                    <div className="absolute left-4 top-3">
                      <AnimatedPlaceholder showSearch={showSearch} />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative">
                <Textarea
                  id="ai-input-04"
                  value={value}
                  placeholder=""
                  className="w-full rounded-2xl rounded-b-none px-4 py-3 bg-gray-100 border-none text-gray-800 text-xs resize-none focus-visible:ring-0 leading-[1.2]"
                  ref={textareaRef}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit()
                    }
                  }}
                  onChange={(e) => {
                    setValue(e.target.value)
                    adjustHeight()
                  }}
                />
                {!value && (
                  <div className="absolute left-4 top-3">
                    <AnimatedPlaceholder showSearch={showSearch} />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="h-10 bg-gray-100 rounded-b-xl">
            <div className="absolute left-3 bottom-2 flex items-center gap-2">
              <label
                className={cn(
                  "cursor-pointer relative rounded-full p-2 bg-gray-200",
                  imagePreview
                    ? "bg-blue-500/15 border border-blue-500 text-blue-400"
                    : "text-gray-600 hover:text-gray-800"
                )}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handelChange}
                  className="hidden"
                />
                <Paperclip
                  className={cn("w-3 h-3 transition-colors", imagePreview ? "text-blue-400" : "text-gray-600 hover:text-gray-800")}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowSearch(!showSearch)
                }}
                className={cn(
                  "rounded-full transition-all flex items-center gap-2 px-1.5 py-1 border h-6",
                  showSearch
                    ? "bg-blue-500/15 border-blue-400 text-blue-400"
                    : "bg-gray-200 border-transparent text-gray-600 hover:text-gray-800"
                )}
              >
                <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                  <motion.div
                    animate={{
                      rotate: showSearch ? 180 : 0,
                      scale: showSearch ? 1.1 : 1,
                    }}
                    whileHover={{
                      rotate: showSearch ? 180 : 15,
                      scale: 1.1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 10,
                      },
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 25,
                    }}
                  >
                    <Globe
                      className={cn(
                        "w-3 h-3",
                        showSearch ? "text-blue-400" : "text-inherit"
                      )}
                    />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {showSearch && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{
                        width: "auto",
                        opacity: 1,
                      }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs overflow-hidden whitespace-nowrap text-blue-400 flex-shrink-0"
                    >
                      Search
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
            <div className="absolute right-3 bottom-2">
              <button
                type="button"
                onClick={handleSubmit}
                className={cn(
                  "rounded-full p-2 transition-colors",
                  loading
                    ? "bg-blue-500/20 text-blue-400 cursor-not-allowed"
                  : value
                    ? "bg-blue-500/15 text-blue-400"
                    : "bg-gray-200 text-gray-600 hover:text-gray-800"
                )}
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
