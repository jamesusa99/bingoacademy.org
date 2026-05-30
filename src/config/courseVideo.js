/** Default streaming assets for video lessons (replace with CDN URLs per lesson in production) */

export const DEFAULT_LESSON_VIDEO =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

export const DEFAULT_LESSON_POSTER =
  'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217'

export function getCourseVideo(course) {
  return {
    url: course?.videoUrl || DEFAULT_LESSON_VIDEO,
    poster: course?.videoPoster || DEFAULT_LESSON_POSTER,
    previewSeconds: course?.previewSeconds ?? 90,
  }
}
