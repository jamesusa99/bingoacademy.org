import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { adminInsert, adminUpdate, adminDelete } from '../../../lib/admin/db'
import AdminField from '../../../components/admin/AdminField'
import AdminAlert from '../../../components/admin/AdminAlert'
import { CrudTable, inputClass, textareaClass } from '../../../components/admin/community/CommunityAdminCrud'
import { useAdminCrud } from '../../../hooks/useAdminCrud'
import { fetchPlatformSetting, upsertPlatformSetting } from '../../../lib/platformSettings'
import {
  COMMUNITY_CHECKIN_TASKS,
  COMMUNITY_CHECKIN_REWARDS,
  COMMUNITY_CHECKIN_POINTS_GUIDE,
} from '../../../config/seed/communityContent'

const emptyTask = { slug: '', task_type: 'study', icon: '📖', title: '', description: '', pts: 5, scholar_pts: 1, exclusive: false, sort_order: 0 }
const emptyReward = { icon: '🎁', title: '', pts: 100, description: '', stock: 'Available', scholar_only: false, sort_order: 0 }
const emptyGuide = { title: '', pts: '', scholar_pts: '', streak_only: false, sort_order: 0 }

export default function CommunityCheckinEditor() {
  const c = useAdminCrud()
  const [panel, setPanel] = useState('tasks')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [tasks, setTasks] = useState([])
  const [rewards, setRewards] = useState([])
  const [pointsGuide, setPointsGuide] = useState([])

  const [editingTask, setEditingTask] = useState(null)
  const [editingReward, setEditingReward] = useState(null)
  const [editingGuide, setEditingGuide] = useState(null)

  const [formTask, setFormTask] = useState(emptyTask)
  const [formReward, setFormReward] = useState(emptyReward)
  const [formGuide, setFormGuide] = useState(emptyGuide)

  const reload = useCallback(async () => {
    setLoading(true)
    const [tasksRes, rewardsRes, guideSetting] = await Promise.all([
      supabase.from('community_checkin_tasks').select('*').order('sort_order'),
      supabase.from('community_checkin_rewards').select('*').order('sort_order'),
      fetchPlatformSetting('community_checkin_points_guide').catch(() => null),
    ])
    if (tasksRes.error) throw new Error(tasksRes.error.message)
    if (rewardsRes.error) throw new Error(rewardsRes.error.message)
    setTasks(tasksRes.data || [])
    setRewards(rewardsRes.data || [])
    setPointsGuide(Array.isArray(guideSetting) && guideSetting.length ? guideSetting : [...COMMUNITY_CHECKIN_POINTS_GUIDE])
    setLoading(false)
  }, [])

  useEffect(() => {
    reload().catch((e) => setError(e.message))
  }, [reload])

  const panelBtn = (id, label) => (
    <button
      type="button"
      onClick={() => setPanel(id)}
      className={`px-4 py-2 rounded-xl text-sm font-medium ${panel === id ? 'bg-primary text-white' : 'bg-slate-200 text-slate-700'}`}
    >
      {label}
    </button>
  )

  const flash = (msg) => {
    setError(null)
    setSuccess(msg)
  }

  const saveTask = async () => {
    setError(null)
    setSuccess(null)
    if (!formTask.title?.trim()) {
      setError(c.t('pages.community.taskTitleRequired'))
      return
    }
    const payload = {
      ...formTask,
      title: formTask.title.trim(),
      pts: parseInt(formTask.pts, 10) || 0,
      scholar_pts: parseInt(formTask.scholar_pts, 10) || 0,
      sort_order: parseInt(formTask.sort_order, 10) || 0,
    }
    setSaving(true)
    try {
      if (editingTask) {
        await adminUpdate('community_checkin_tasks', editingTask.id, payload)
        flash(c.t('pages.community.taskUpdated'))
      } else {
        await adminInsert('community_checkin_tasks', payload)
        flash(c.t('pages.community.taskAdded'))
      }
      setEditingTask(null)
      setFormTask(emptyTask)
      await reload()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const saveReward = async () => {
    setError(null)
    setSuccess(null)
    if (!formReward.title?.trim()) {
      setError(c.t('pages.community.rewardTitleRequired'))
      return
    }
    const payload = {
      ...formReward,
      title: formReward.title.trim(),
      pts: parseInt(formReward.pts, 10) || 0,
      sort_order: parseInt(formReward.sort_order, 10) || 0,
    }
    setSaving(true)
    try {
      if (editingReward) {
        await adminUpdate('community_checkin_rewards', editingReward.id, payload)
        flash(c.t('pages.community.rewardUpdated'))
      } else {
        await adminInsert('community_checkin_rewards', payload)
        flash(c.t('pages.community.rewardAdded'))
      }
      setEditingReward(null)
      setFormReward(emptyReward)
      await reload()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const saveGuide = async () => {
    setError(null)
    setSuccess(null)
    if (!formGuide.title?.trim()) {
      setError(c.t('pages.community.guideTitleRequired'))
      return
    }
    const payload = {
      title: formGuide.title.trim(),
      pts: formGuide.pts?.trim() || '',
      scholar_pts: formGuide.scholar_pts?.trim() || '',
      streak_only: Boolean(formGuide.streak_only),
      sort_order: parseInt(formGuide.sort_order, 10) || 0,
    }
    let next = [...pointsGuide]
    if (editingGuide !== null) {
      next = next.map((row, i) => (i === editingGuide ? payload : row))
    } else {
      next = [...next, payload]
    }
    next.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    setSaving(true)
    try {
      await upsertPlatformSetting('community_checkin_points_guide', next)
      flash(editingGuide !== null ? c.t('pages.community.guideUpdated') : c.t('pages.community.guideAdded'))
      setEditingGuide(null)
      setFormGuide(emptyGuide)
      await reload()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const removeRow = async (table, id, confirmKey, onClearEdit) => {
    if (!confirm(c.t(confirmKey))) return
    setError(null)
    setSuccess(null)
    try {
      await adminDelete(table, id)
      onClearEdit?.()
      flash(c.t('pages.community.itemDeleted'))
      await reload()
    } catch (e) {
      setError(e.message)
    }
  }

  const removeGuide = async (index) => {
    if (!confirm(c.t('pages.community.confirmDeleteGuide'))) return
    setError(null)
    setSuccess(null)
    const next = pointsGuide.filter((_, i) => i !== index)
    setSaving(true)
    try {
      await upsertPlatformSetting('community_checkin_points_guide', next)
      if (editingGuide === index) {
        setEditingGuide(null)
        setFormGuide(emptyGuide)
      }
      flash(c.t('pages.community.guideDeleted'))
      await reload()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const importDefaults = async (kind) => {
    const map = {
      tasks: { rows: COMMUNITY_CHECKIN_TASKS, table: 'community_checkin_tasks', confirm: 'pages.community.confirmImportTasks', msg: 'pages.community.tasksImported' },
      rewards: { rows: COMMUNITY_CHECKIN_REWARDS, table: 'community_checkin_rewards', confirm: 'pages.community.confirmImportRewards', msg: 'pages.community.rewardsImported' },
      guide: { rows: COMMUNITY_CHECKIN_POINTS_GUIDE, confirm: 'pages.community.confirmImportGuide', msg: 'pages.community.guideImported' },
    }
    const cfg = map[kind]
    if (!confirm(c.t(cfg.confirm))) return
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      if (kind === 'guide') {
        await upsertPlatformSetting('community_checkin_points_guide', cfg.rows)
      } else {
        for (const row of cfg.rows) {
          await adminInsert(cfg.table, row)
        }
      }
      flash(c.t(cfg.msg, { count: cfg.rows.length }))
      await reload()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const guideRows = pointsGuide.map((row, index) => ({ ...row, id: index }))

  return (
    <div className="space-y-6">
      {error ? <AdminAlert type="error">{error}</AdminAlert> : null}
      {success ? <AdminAlert type="success">{success}</AdminAlert> : null}

      <div className="flex flex-wrap gap-2">
        {panelBtn('tasks', c.t('pages.community.checkinPanelTasks'))}
        {panelBtn('rewards', c.t('pages.community.checkinPanelRewards'))}
        {panelBtn('guide', c.t('pages.community.checkinPanelGuide'))}
      </div>

      {panel === 'tasks' ? (
        <>
          <div className="card p-6">
            <h2 className="font-semibold mb-1">{editingTask ? c.editItem(c.t('pages.community.taskItem')) : c.addItem(c.t('pages.community.taskItem'))}</h2>
            <p className="text-xs text-slate-500 mb-4">{c.t('pages.community.taskFormHint')}</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <AdminField label={c.title} required>
                <input className={inputClass} value={formTask.title} onChange={(e) => setFormTask((f) => ({ ...f, title: e.target.value }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.slug')}>
                <input className={inputClass} value={formTask.slug} onChange={(e) => setFormTask((f) => ({ ...f, slug: e.target.value }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.icon')}>
                <input className={inputClass} value={formTask.icon} onChange={(e) => setFormTask((f) => ({ ...f, icon: e.target.value }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.taskType')}>
                <input className={inputClass} value={formTask.task_type} onChange={(e) => setFormTask((f) => ({ ...f, task_type: e.target.value }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.pts')}>
                <input type="number" className={inputClass} value={formTask.pts} onChange={(e) => setFormTask((f) => ({ ...f, pts: parseInt(e.target.value, 10) || 0 }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.scholarPts')}>
                <input type="number" className={inputClass} value={formTask.scholar_pts} onChange={(e) => setFormTask((f) => ({ ...f, scholar_pts: parseInt(e.target.value, 10) || 0 }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.sortOrder')}>
                <input type="number" className={inputClass} value={formTask.sort_order} onChange={(e) => setFormTask((f) => ({ ...f, sort_order: parseInt(e.target.value, 10) || 0 }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.scholarOnly')} className="flex items-end">
                <label className="flex items-center gap-2 text-sm pb-2">
                  <input type="checkbox" checked={formTask.exclusive} onChange={(e) => setFormTask((f) => ({ ...f, exclusive: e.target.checked }))} />
                  {c.t('pages.community.exclusiveTask')}
                </label>
              </AdminField>
              <AdminField label={c.t('pages.community.description')} className="sm:col-span-2">
                <textarea className={textareaClass} value={formTask.description} onChange={(e) => setFormTask((f) => ({ ...f, description: e.target.value }))} />
              </AdminField>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={saveTask} disabled={saving} className="btn-primary px-5 py-2 rounded-xl text-sm disabled:opacity-60">{saving ? c.saving : c.save}</button>
              {editingTask ? <button type="button" onClick={() => { setEditingTask(null); setFormTask(emptyTask) }} className="px-5 py-2 border rounded-xl text-sm">{c.cancel}</button> : null}
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="p-4 border-b flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-semibold">{c.t('pages.community.tasksList')}</div>
                <p className="text-xs text-slate-500">{c.t('pages.community.tasksListHint')}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">{c.t('pages.community.itemsCount', { count: tasks.length })}</span>
                {!loading && tasks.length === 0 ? (
                  <button type="button" onClick={() => importDefaults('tasks')} disabled={saving} className="text-xs px-3 py-1.5 rounded-lg border border-primary/30 text-primary">{c.t('pages.community.importDefaultTasks')}</button>
                ) : null}
              </div>
            </div>
            {loading ? <div className="p-8 text-center text-slate-500">{c.loading}</div> : (
              <CrudTable
                columns={[
                  { key: 'title', label: c.title, render: (row) => <span>{row.icon} {row.title}</span> },
                  { key: 'pts', label: c.t('pages.community.pts') },
                  { key: 'scholar_pts', label: c.t('pages.community.scholarPts') },
                  { key: 'sort_order', label: c.t('pages.community.sortOrder') },
                ]}
                rows={tasks}
                onEdit={(row) => { setEditingTask(row); setFormTask({ ...row, pts: row.pts ?? 0, scholar_pts: row.scholar_pts ?? 0, sort_order: row.sort_order ?? 0 }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                onDelete={(id) => removeRow('community_checkin_tasks', id, 'pages.community.confirmDeleteTask', () => { if (editingTask?.id === id) { setEditingTask(null); setFormTask(emptyTask) } })}
                editLabel={c.edit}
                deleteLabel={c.delete}
                empty={c.t('pages.community.noTasks')}
              />
            )}
          </div>
        </>
      ) : null}

      {panel === 'rewards' ? (
        <>
          <div className="card p-6">
            <h2 className="font-semibold mb-1">{editingReward ? c.editItem(c.t('pages.community.rewardItem')) : c.addItem(c.t('pages.community.rewardItem'))}</h2>
            <p className="text-xs text-slate-500 mb-4">{c.t('pages.community.rewardFormHint')}</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <AdminField label={c.title} required>
                <input className={inputClass} value={formReward.title} onChange={(e) => setFormReward((f) => ({ ...f, title: e.target.value }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.icon')}>
                <input className={inputClass} value={formReward.icon} onChange={(e) => setFormReward((f) => ({ ...f, icon: e.target.value }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.pts')}>
                <input type="number" className={inputClass} value={formReward.pts} onChange={(e) => setFormReward((f) => ({ ...f, pts: parseInt(e.target.value, 10) || 0 }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.stock')}>
                <input className={inputClass} value={formReward.stock} onChange={(e) => setFormReward((f) => ({ ...f, stock: e.target.value }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.sortOrder')}>
                <input type="number" className={inputClass} value={formReward.sort_order} onChange={(e) => setFormReward((f) => ({ ...f, sort_order: parseInt(e.target.value, 10) || 0 }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.scholarOnly')} className="flex items-end">
                <label className="flex items-center gap-2 text-sm pb-2">
                  <input type="checkbox" checked={formReward.scholar_only} onChange={(e) => setFormReward((f) => ({ ...f, scholar_only: e.target.checked }))} />
                  {c.t('pages.community.scholarOnlyHint')}
                </label>
              </AdminField>
              <AdminField label={c.t('pages.community.description')} className="sm:col-span-2">
                <textarea className={textareaClass} value={formReward.description} onChange={(e) => setFormReward((f) => ({ ...f, description: e.target.value }))} />
              </AdminField>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={saveReward} disabled={saving} className="btn-primary px-5 py-2 rounded-xl text-sm disabled:opacity-60">{saving ? c.saving : c.save}</button>
              {editingReward ? <button type="button" onClick={() => { setEditingReward(null); setFormReward(emptyReward) }} className="px-5 py-2 border rounded-xl text-sm">{c.cancel}</button> : null}
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="p-4 border-b flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-semibold">{c.t('pages.community.rewardsList')}</div>
                <p className="text-xs text-slate-500">{c.t('pages.community.rewardsListHint')}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">{c.t('pages.community.itemsCount', { count: rewards.length })}</span>
                {!loading && rewards.length === 0 ? (
                  <button type="button" onClick={() => importDefaults('rewards')} disabled={saving} className="text-xs px-3 py-1.5 rounded-lg border border-primary/30 text-primary">{c.t('pages.community.importDefaultRewards')}</button>
                ) : null}
              </div>
            </div>
            {loading ? <div className="p-8 text-center text-slate-500">{c.loading}</div> : (
              <CrudTable
                columns={[
                  { key: 'title', label: c.title, render: (row) => <span>{row.icon} {row.title}</span> },
                  { key: 'pts', label: c.t('pages.community.pts') },
                  { key: 'stock', label: c.t('pages.community.stock') },
                  { key: 'sort_order', label: c.t('pages.community.sortOrder') },
                ]}
                rows={rewards}
                onEdit={(row) => { setEditingReward(row); setFormReward({ ...row, pts: row.pts ?? 0, sort_order: row.sort_order ?? 0 }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                onDelete={(id) => removeRow('community_checkin_rewards', id, 'pages.community.confirmDeleteReward', () => { if (editingReward?.id === id) { setEditingReward(null); setFormReward(emptyReward) } })}
                editLabel={c.edit}
                deleteLabel={c.delete}
                empty={c.t('pages.community.noRewards')}
              />
            )}
          </div>
        </>
      ) : null}

      {panel === 'guide' ? (
        <>
          <div className="card p-6">
            <h2 className="font-semibold mb-1">{editingGuide !== null ? c.editItem(c.t('pages.community.guideItem')) : c.addItem(c.t('pages.community.guideItem'))}</h2>
            <p className="text-xs text-slate-500 mb-4">{c.t('pages.community.guideFormHint')}</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <AdminField label={c.title} required>
                <input className={inputClass} value={formGuide.title} onChange={(e) => setFormGuide((f) => ({ ...f, title: e.target.value }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.sortOrder')}>
                <input type="number" className={inputClass} value={formGuide.sort_order} onChange={(e) => setFormGuide((f) => ({ ...f, sort_order: parseInt(e.target.value, 10) || 0 }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.guidePtsLabel')}>
                <input className={inputClass} value={formGuide.pts} onChange={(e) => setFormGuide((f) => ({ ...f, pts: e.target.value }))} placeholder="+5 pts" />
              </AdminField>
              <AdminField label={c.t('pages.community.guideScholarPtsLabel')}>
                <input className={inputClass} value={formGuide.scholar_pts} onChange={(e) => setFormGuide((f) => ({ ...f, scholar_pts: e.target.value }))} placeholder="+1 scholar pt" />
              </AdminField>
              <AdminField label={c.t('pages.community.guideStreakOnly')} className="flex items-end sm:col-span-2">
                <label className="flex items-center gap-2 text-sm pb-2">
                  <input type="checkbox" checked={formGuide.streak_only} onChange={(e) => setFormGuide((f) => ({ ...f, streak_only: e.target.checked }))} />
                  {c.t('pages.community.guideStreakOnlyHint')}
                </label>
              </AdminField>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={saveGuide} disabled={saving} className="btn-primary px-5 py-2 rounded-xl text-sm disabled:opacity-60">{saving ? c.saving : c.save}</button>
              {editingGuide !== null ? <button type="button" onClick={() => { setEditingGuide(null); setFormGuide(emptyGuide) }} className="px-5 py-2 border rounded-xl text-sm">{c.cancel}</button> : null}
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="p-4 border-b flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-semibold">{c.t('pages.community.guideList')}</div>
                <p className="text-xs text-slate-500">{c.t('pages.community.guideListHint')}</p>
              </div>
              <button type="button" onClick={() => importDefaults('guide')} disabled={saving} className="text-xs px-3 py-1.5 rounded-lg border border-primary/30 text-primary">{c.t('pages.community.importDefaultGuide')}</button>
            </div>
            {loading ? <div className="p-8 text-center text-slate-500">{c.loading}</div> : (
              <CrudTable
                columns={[
                  { key: 'title', label: c.title },
                  { key: 'pts', label: c.t('pages.community.guidePtsLabel') },
                  { key: 'scholar_pts', label: c.t('pages.community.guideScholarPtsLabel') },
                  { key: 'sort_order', label: c.t('pages.community.sortOrder') },
                ]}
                rows={guideRows}
                onEdit={(row) => { setEditingGuide(row.id); setFormGuide({ ...pointsGuide[row.id], sort_order: pointsGuide[row.id].sort_order ?? 0 }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                onDelete={(id) => removeGuide(id)}
                editLabel={c.edit}
                deleteLabel={c.delete}
                empty={c.t('pages.community.noGuide')}
              />
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
