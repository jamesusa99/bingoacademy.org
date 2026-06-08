import { resolveModuleCoverUrl } from '../../config/moduleCover'

export default function ModuleCoverImage({ coverUrl, alt = '', className = '' }) {
  return (
    <img
      src={resolveModuleCoverUrl(coverUrl)}
      alt={alt}
      className={className}
      loading="lazy"
    />
  )
}
