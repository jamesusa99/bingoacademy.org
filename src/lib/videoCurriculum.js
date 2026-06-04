function sortRows(rows) {
  return [...(rows || [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

/** Flatten curriculum tree into lesson options for video ↔ lesson assignment */
export function buildCurriculumLessonOptions(levels) {
  /** @type {Array<{ slug: string, name: string, label: string, lessonId: string }>} */
  const options = []
  for (const level of sortRows(levels)) {
    for (const theme of sortRows(level.themes)) {
      const categoryLabel = theme.category_label || theme.title
      for (const mod of sortRows(theme.modules)) {
        for (const lesson of sortRows(mod.lessons)) {
          const slug = lesson.catalog_slug || lesson.slug
          if (!slug) continue
          options.push({
            slug,
            name: lesson.title,
            lessonId: lesson.id,
            label: `${level.title} · ${categoryLabel} · ${mod.title} · ${lesson.title}`,
          })
        }
      }
    }
  }
  return options
}

/** @param {Record<string, object[]>} levelsByLine */
export function buildLessonOptionsByLine(levelsByLine) {
  return Object.fromEntries(
    Object.entries(levelsByLine || {}).map(([line, levels]) => [line, buildCurriculumLessonOptions(levels)])
  )
}

/** Group video assets by curriculum path for admin library display */

export function videoCurriculumPath(asset) {
  if (!asset?.product_line) return null
  return {
    line: asset.product_line,
    stage: asset.stage_title || asset.stage_slug || '—',
    stageSlug: asset.stage_slug,
    category: asset.category_label || asset.category_slug || '—',
    categorySlug: asset.category_slug,
    module: asset.module_title || asset.module_slug || '—',
    moduleSlug: asset.module_slug,
  }
}

export function formatVideoAssetLabel(asset) {
  const path = videoCurriculumPath(asset)
  if (path) {
    return `${path.stage} · ${path.category} · ${path.module} · ${asset.title}`
  }
  if (asset.catalog_slug) return `${asset.catalog_slug} · ${asset.title}`
  return asset.title
}

export function groupVideosByCurriculum(videos) {
  /** @type {Map<string, { line: string, stage: string, categories: Map<string, { category: string, modules: Map<string, { module: string, items: object[] }> }> }>} */
  const byLine = new Map()
  const unclassified = []

  for (const video of videos) {
    const path = videoCurriculumPath(video)
    if (!path) {
      unclassified.push(video)
      continue
    }

    if (!byLine.has(path.line)) {
      byLine.set(path.line, { line: path.line, stages: new Map() })
    }
    const lineGroup = byLine.get(path.line)

    const stageKey = path.stageSlug || path.stage
    if (!lineGroup.stages.has(stageKey)) {
      lineGroup.stages.set(stageKey, { stage: path.stage, stageSlug: path.stageSlug, categories: new Map() })
    }
    const stageGroup = lineGroup.stages.get(stageKey)

    const catKey = path.categorySlug || path.category
    if (!stageGroup.categories.has(catKey)) {
      stageGroup.categories.set(catKey, { category: path.category, modules: new Map() })
    }
    const catGroup = stageGroup.categories.get(catKey)

    const modKey = path.moduleSlug || path.module
    if (!catGroup.modules.has(modKey)) {
      catGroup.modules.set(modKey, { module: path.module, items: [] })
    }
    catGroup.modules.get(modKey).items.push(video)
  }

  return { byLine, unclassified }
}

/** Resolve curriculum labels from admin levels tree + picker state */
export function resolveCurriculumLabels(levels, pickerState) {
  const { stageChoice, themeChoice, moduleChoice, newStage, newTheme, newModule } = pickerState
  const NEW = '__new__'

  let stage_slug = null
  let stage_title = null
  let category_slug = null
  let category_label = null
  let module_slug = null
  let module_title = null

  if (stageChoice === NEW) {
    stage_slug = newStage.slug?.trim() || null
    stage_title = newStage.title?.trim() || null
  } else {
    const level = levels.find((l) => l.id === stageChoice)
    if (level) {
      stage_slug = level.slug
      stage_title = level.title
    }
  }

  if (themeChoice === NEW) {
    category_slug = newTheme.slug?.trim() || null
    category_label = newTheme.category_label?.trim() || newTheme.title?.trim() || null
  } else if (stageChoice !== NEW) {
    const level = levels.find((l) => l.id === stageChoice)
    const theme = level?.themes?.find((t) => t.id === themeChoice)
    if (theme) {
      category_slug = theme.slug
      category_label = theme.category_label || theme.title
    }
  }

  if (moduleChoice === NEW) {
    module_slug = newModule.slug?.trim() || null
    module_title = newModule.title?.trim() || null
  } else if (themeChoice !== NEW && stageChoice !== NEW) {
    const level = levels.find((l) => l.id === stageChoice)
    const theme = level?.themes?.find((t) => t.id === themeChoice)
    const mod = theme?.modules?.find((m) => m.id === moduleChoice)
    if (mod) {
      module_slug = mod.slug
      module_title = mod.title
    }
  }

  return {
    stage_slug,
    stage_title,
    category_slug,
    category_label,
    module_slug,
    module_title,
  }
}
