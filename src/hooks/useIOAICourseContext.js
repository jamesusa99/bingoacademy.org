import { useCallback, useMemo } from 'react'
import { useCourseCatalog } from './useCourseCatalog'
import { useIOAICurriculum } from './useIOAICurriculum'
import { buildIOAICurriculum, getIOAICurriculumSummary } from '../lib/ioaiCourseStructure'

/** IOAI catalog + curriculum tree — single source aligned with admin DB */
export function useIOAICourseContext() {
  const { courses, loading: catalogLoading, source: catalogSource, error: catalogError, reload: reloadCatalog } =
    useCourseCatalog()
  const { tree, loading: treeLoading, source: treeSource, error: treeError, reload: reloadTree } =
    useIOAICurriculum()

  const curriculum = useMemo(() => buildIOAICurriculum(courses, tree), [courses, tree])
  const summary = useMemo(() => getIOAICurriculumSummary(tree), [tree])

  const reload = useCallback(async () => {
    await Promise.all([reloadCatalog(), reloadTree()])
  }, [reloadCatalog, reloadTree])

  return {
    courses,
    tree,
    curriculum,
    summary,
    loading: catalogLoading || treeLoading,
    catalogSource,
    treeSource,
    error: catalogError || treeError,
    reload,
  }
}
