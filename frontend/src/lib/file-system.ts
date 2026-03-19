export function getFileName(filePath: string) {
  const normalizedPath = filePath.replaceAll('\\', '/')
  return normalizedPath.split('/').pop() ?? filePath
}

export function toFileSource(filePath: string | null | undefined) {
  if (!filePath) {
    return undefined
  }

  if (
    filePath.startsWith('blob:') ||
    filePath.startsWith('data:') ||
    filePath.startsWith('http://') ||
    filePath.startsWith('https://') ||
    filePath.startsWith('file://')
  ) {
    return filePath
  }

  const normalizedPath = filePath.replaceAll('\\', '/')

  if (/^[a-zA-Z]:\//.test(normalizedPath)) {
    return encodeURI(`file:///${normalizedPath}`)
  }

  if (normalizedPath.startsWith('/')) {
    return encodeURI(`file://${normalizedPath}`)
  }

  return encodeURI(normalizedPath)
}
