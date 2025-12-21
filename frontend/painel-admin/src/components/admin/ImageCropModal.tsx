'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { motion } from 'motion/react'
import { X, Check, RotateCw } from 'lucide-react'

interface ImageCropModalProps {
  image: string
  isOpen: boolean
  onClose: () => void
  onCropComplete: (croppedImage: string) => void
  aspect?: number
  cropShape?: 'rect' | 'round'
  size?: { width: number; height: number }
}

export function ImageCropModal({
  image,
  isOpen,
  onClose,
  onCropComplete,
  aspect = 1,
  cropShape = 'round',
  size = { width: 200, height: 200 },
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop)
  }, [])

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom)
  }, [])

  const onRotationChange = useCallback((rotation: number) => {
    setRotation(rotation)
  }, [])

  const onCropCompleteCallback = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.setAttribute('crossOrigin', 'anonymous')
      image.src = url
    })

  const getRadianAngle = (degreeValue: number) => {
    return (degreeValue * Math.PI) / 180
  }

  const rotateSize = (width: number, height: number, rotation: number) => {
    const rotRad = getRadianAngle(rotation)
    return {
      width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    }
  }

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: any,
    rotation = 0,
    flip = { horizontal: false, vertical: false }
  ): Promise<string> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    const rotRad = getRadianAngle(rotation)

    // calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
      image.width,
      image.height,
      rotation
    )

    // set canvas size to match the bounding box
    canvas.width = bBoxWidth
    canvas.height = bBoxHeight

    // translate canvas context to a central location to allow rotating and flipping around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
    ctx.rotate(rotRad)
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
    ctx.translate(-image.width / 2, -image.height / 2)

    // draw rotated image
    ctx.drawImage(image, 0, 0)

    const croppedCanvas = document.createElement('canvas')
    const croppedCtx = croppedCanvas.getContext('2d')

    if (!croppedCtx) {
      throw new Error('No 2d context')
    }

    // Set the size of the cropped canvas
    croppedCanvas.width = size.width
    croppedCanvas.height = size.height

    // Draw the cropped image onto the new canvas
    croppedCtx.drawImage(
      canvas,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      size.width,
      size.height
    )

    // As a blob
    return new Promise((resolve, reject) => {
      croppedCanvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'))
          return
        }
        const url = URL.createObjectURL(blob)
        resolve(url)
      }, 'image/jpeg')
    })
  }

  const handleSave = async () => {
    if (!croppedAreaPixels) return

    setIsProcessing(true)
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation)
      onCropComplete(croppedImage)
      onClose()
    } catch (error) {
      console.error('Erro ao processar imagem:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-900 border border-amber-500/20 rounded-lg w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl h-[90vh] sm:h-[85vh] md:h-[80vh] overflow-hidden flex flex-col mx-2 sm:mx-4"
      >
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-zinc-800 flex-shrink-0">
              <h2 className="text-base sm:text-lg font-bold text-white">Ajustar Foto</h2>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Cropper Container */}
            <div className="relative flex-1 min-h-0 bg-zinc-950 overflow-hidden" style={{ position: 'relative', width: '100%' }}>
              {image ? (
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={aspect}
                  cropShape={cropShape}
                  onCropChange={onCropChange}
                  onZoomChange={onZoomChange}
                  onRotationChange={onRotationChange}
                  onCropComplete={onCropCompleteCallback}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Carregando imagem...
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-3 sm:p-4 border-t border-zinc-800 space-y-2 sm:space-y-2.5 flex-shrink-0 overflow-y-auto max-h-[180px] sm:max-h-[200px]">
              {/* Zoom */}
              <div className="flex-shrink-0">
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                  Zoom: {Math.round(zoom * 100)}%
                </label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1.5 sm:h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Rotation */}
              <div className="flex-shrink-0">
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 flex items-center gap-1.5 sm:gap-2">
                  <RotateCw className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">Rotação: {rotation}°</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full h-1.5 sm:h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 sm:gap-3 pt-1 flex-shrink-0">
                <button
                  onClick={onClose}
                  className="flex-1 px-3 sm:px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isProcessing}
                  className="flex-1 px-3 sm:px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                      <span className="hidden sm:inline">Processando...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                      Aplicar
                    </>
                  )}
                </button>
              </div>
            </div>
      </motion.div>
    </motion.div>
  )
}

