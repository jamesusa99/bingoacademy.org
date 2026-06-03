/**
 * IOAI curriculum type definitions (JSDoc).
 * Hierarchy: CourseLevel → Theme → Module → Lesson
 */

/** @typedef {{ id: string, title: string }} Lesson */

/** @typedef {{ id: string, title: string, lessons: Lesson[] }} Module */

/** @typedef {{ id: string, title: string, modules: Module[] }} Theme */

/** @typedef {{ id: string, title: string, emoji?: string, themes: Theme[] }} CourseLevel */

/** @typedef {{ id: string, title: string, lessonNum: string, catalog: object | null }} ResolvedLesson */

/** @typedef {{ id: string, title: string, lessons: ResolvedLesson[] }} ResolvedModule */

/** @typedef {{ id: string, title: string, modules: ResolvedModule[] }} ResolvedTheme */

/** @typedef {{ id: string, title: string, emoji?: string, themes: ResolvedTheme[] }} ResolvedCourseLevel */

export {}
