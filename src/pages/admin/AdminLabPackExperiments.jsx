import { useParams, Link } from 'react-router-dom'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminLabPackHierarchyEditor from '../../components/admin/AdminLabPackHierarchyEditor'
import { useAdminCrud } from '../../hooks/useAdminCrud'

export default function AdminLabPackExperiments() {
  const { packSlug } = useParams()
  const c = useAdminCrud()
  const t = c.t
  const L = (key) => t(`pages.coursesCatalog.${key}`)

  const hierarchyLabels = {
    savePackFirst: L('savePackFirst'),
    level2Title: L('level2Title'),
    level2Desc: L('level2Desc'),
    level3Title: L('level3Title'),
    level3Desc: L('level3Desc'),
    experimentList: L('experimentList'),
    addExperiment: L('addExperiment'),
    noExperiments: L('noExperiments'),
    editExperiment: L('editExperiment'),
    newExperiment: L('newExperiment'),
    expSlugPh: L('expSlugPh'),
    expNamePh: L('expNamePh'),
    expContentPh: L('expContentPh'),
    expPurposePh: L('expPurposePh'),
    expMaterialsLabel: L('expMaterialsLabel'),
    saveExperiment: L('saveExperiment'),
    experimentSaved: L('experimentSaved'),
    confirmDeleteExperiment: L('confirmDeleteExperiment'),
    selectExperimentFirst: L('selectExperimentFirst'),
    stepSaved: L('stepSaved'),
    confirmDeleteStep: L('confirmDeleteStep'),
    selectExperimentHint: L('selectExperimentHint'),
    editingStepsFor: L('editingStepsFor'),
    editStep: L('editStep'),
    newStep: L('newStep'),
    stepTitlePh: L('stepTitlePh'),
    stepBodyPh: L('stepBodyPh'),
    videoUrlPh: L('videoUrlPh'),
    cloudflarePh: L('cloudflarePh'),
    pptUrlPh: L('pptUrlPh'),
    linkUrlPh: L('linkUrlPh'),
    downloadUrlPh: L('downloadUrlPh'),
    downloadLabelPh: L('downloadLabelPh'),
    programmingLabPh: L('programmingLabPh'),
    saveStep: L('saveStep'),
    stepCount: (n) => L('stepCount').replace('{{count}}', String(n)),
    materialsJsonInvalid: L('materialsJsonInvalid'),
    tabSteps: L('tabSteps'),
    tabRuntime: L('tabRuntime'),
    runtimeConfigured: L('runtimeConfigured'),
    runtimeTitle: L('runtimeTitle'),
    runtimeDesc: L('runtimeDesc'),
    runtimeTypeLabel: L('runtimeTypeLabel'),
    runtimeUrlLabel: L('runtimeUrlLabel'),
    runtimeUrlPh: L('runtimeUrlPh'),
    runtimeUploadHint: L('runtimeUploadHint'),
    uploadAsset: L('uploadAsset'),
    uploadPackage: L('uploadPackage'),
    uploading: L('uploading'),
    runtimeInternalPathLabel: L('runtimeInternalPathLabel'),
    runtimeUrlOptional: L('runtimeUrlOptional'),
    embedHeightLabel: L('embedHeightLabel'),
    openInNewTab: L('openInNewTab'),
    runtimeStepsOnlyHint: L('runtimeStepsOnlyHint'),
    saveRuntime: L('saveRuntime'),
    saveExperimentBeforeRuntime: L('saveExperimentBeforeRuntime'),
    loading: 'Loading…',
    saving: c.saving,
    delete: c.delete,
  }

  return (
    <div>
      <AdminPageHeader titleKey="pages.coursesCatalog.title" descriptionKey="pages.coursesCatalog.sectionLevel23" />
      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <Link to="/admin/labs-materials" className="text-primary hover:underline">
          ← {L('title')}
        </Link>
        <Link to={`/labs/pack/${encodeURIComponent(packSlug)}`} className="text-slate-600 hover:underline" target="_blank" rel="noreferrer">
          View on site →
        </Link>
      </div>
      <div className="card p-6">
        <p className="text-sm font-mono text-slate-500 mb-4">{packSlug}</p>
        <AdminLabPackHierarchyEditor packSlug={packSlug} labels={hierarchyLabels} />
      </div>
    </div>
  )
}
