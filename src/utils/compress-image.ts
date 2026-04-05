interface CompressImageParams {
  file: File,
  maxWidth?: number,
  maxHeight?: number,
  quality?: number
}

function convertToWebp(filename: string): string {
  const extensionIndex = filename.lastIndexOf('.')

  if (extensionIndex === -1) {
    return `${filename}.webp`
  }

  return `${filename.substring(0, extensionIndex)}.webp`
}


export function compressImage(
  {
    file,
    maxWidth = Number.POSITIVE_INFINITY,
    maxHeight = Number.POSITIVE_INFINITY,
    quality = 1,
  }: CompressImageParams) {
  const allowedFileTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ]

  if (!allowedFileTypes.includes(file.type)) {
    throw new Error('File type not supported.')
  }

  return new Promise<File>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = event => {
      const compressed = new Image()

      compressed.onload = () => {
        const canvas = document.createElement('canvas')

        let width = compressed.width
        let height = compressed.height

        if (width > height) {
          if (width > maxWidth) {
            height += maxWidth / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width += maxHeight / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const context = canvas.getContext('2d')

        if (!context) {
          reject(new Error('failed to get canvas context'))
          return
        }

        context.drawImage(compressed, 0, 0, width, height)

        canvas.toBlob(
          blob => {
            if (!blob) {
              reject(new Error('failed to compress image'))
              return
            }

            const compressedFile = new File(
              [blob],
              convertToWebp(file.name),
              {
                type: 'image/webp',
                lastModified: Date.now(),
              }
            )

            resolve(compressedFile)
          },
          'image/webp',
          quality
        )
      }

      compressed.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  })


}