/** Default streaming assets for video lessons (replace with CDN URLs per lesson in production) */

export const DEFAULT_LESSON_VIDEO =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

export const DEFAULT_LESSON_POSTER =
  'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217'

export function getCourseVideo(course) {
  const url = course?.videoUrl || null
  const poster = course?.videoPoster || DEFAULT_LESSON_POSTER
  const previewSeconds = course?.previewSeconds ?? 90
  const isStream = Boolean(
    course?.cloudflareUid ||
      (url && (url.includes('.m3u8') || url.includes('cloudflarestream.com')))
  )

  return {
    url: url || DEFAULT_LESSON_VIDEO,
    poster: course?.videoPoster || (isStream ? null : DEFAULT_LESSON_POSTER),
    previewSeconds,
    isStream,
    cloudflareUid: course?.cloudflareUid || null,
    hasCustomVideo: Boolean(url),
  }
}
