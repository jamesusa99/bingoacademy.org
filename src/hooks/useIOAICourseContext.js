import { useCallback, useMemo } from 'react'
import { useCourseCatalog } from './useCourseCatalog'
import { useProgramCurriculum } from './useProgramCurriculum'
import { buildProgramCurriculum, getProgramCurriculumSummary } from '../lib/ioaiCourseStructure'

/** Catalog + curriculum tree for a product line — aligned with admin DB */
export function useProgramCourseContext(productLine = 'ioai') {
  const { courses, loading: catalogLoading, source: catalogSource, error: catalogError, reload: reloadCatalog } =
    useCourseCatalog()
  const { tree, loading: treeLoading, source: treeSource, error: treeError, reload: reloadTree } =
    useProgramCurriculum(productLine)

  const curriculum = useMemo(() => buildProgramCurriculum(courses, tree, productLine), [courses, tree, productLine])
  const summary = useMemo(() => getProgramCurriculumSummary(tree, productLine), [tree, productLine])

  const reload = useCallback(async () => {
    await Promise.all([reloadCatalog(), reloadTree()])
  }, [reloadCatalog, reloadTree])

  return {
    productLine,
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

/** @deprecated use useProgramCourseContext('ioai') */
export function useIOAICourseContext() {
  return useProgramCourseContext('ioai')
}
