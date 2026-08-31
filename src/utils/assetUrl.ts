export function assetUrl(path: string): string {
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path
  }

  const base = import.meta.env.BASE_URL
  if (path.startsWith(base)) return path

  return `${base}${path.replace(/^\/+/, '')}`
}
