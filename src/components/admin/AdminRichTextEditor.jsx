import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Bold,
  Code,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Sigma,
  Underline,
} from 'lucide-react'
import { uploadAdminImageFile } from '../../lib/admin/mediaUpload'
import 'katex/dist/katex.min.css'

const toolbarBtn =
  'p-1.5 rounded-md text-slate-600 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-40'

function exec(command, value = null) {
  document.execCommand(command, false, value)
}

export default function AdminRichTextEditor({
  value = '',
  onChange,
  placeholder = '',
  minHeight = 96,
  uploadFolder = 'questions',
  labels = {},
}) {
  const editorRef = useRef(null)
  const fileRef = useRef(null)
  const [sourceMode, setSourceMode] = useState(false)
  const [sourceText, setSourceText] = useState(value || '')
  const [uploading, setUploading] = useState(false)

  const syncFromValue = useCallback(() => {
    const el = editorRef.current
    if (!el || sourceMode) return
    const html = value || ''
    if (el.innerHTML !== html) el.innerHTML = html
  }, [sourceMode, value])

  useEffect(() => {
    syncFromValue()
  }, [syncFromValue])

  const emitChange = () => {
    const html = editorRef.current?.innerHTML || ''
    onChange?.(html)
  }

  const handleSourceChange = (text) => {
    setSourceText(text)
    onChange?.(text)
  }

  const toggleSource = () => {
    if (sourceMode) {
      onChange?.(sourceText)
      setSourceMode(false)
    } else {
      setSourceText(value || editorRef.current?.innerHTML || '')
      setSourceMode(true)
    }
  }

  const insertHtml = (html) => {
    editorRef.current?.focus()
    exec('insertHTML', html)
    emitChange()
  }

  const addLink = () => {
    const url = window.prompt(labels.linkPrompt || '输入链接 URL')
    if (!url) return
    exec('createLink', url)
    emitChange()
  }

  const addFormula = () => {
    const latex = window.prompt(labels.formulaPrompt || '输入 LaTeX 公式，如 x^2 + y^2 = r^2')
    if (!latex) return
    const encoded = latex.replace(/"/g, '&quot;')
    const block = window.confirm(labels.formulaBlockPrompt || '块级公式？（取消 = 行内公式）')
    insertHtml(
      block
        ? `<div class="ioai-math-block" data-latex="${encoded}"></div>`
        : `<span class="ioai-math" data-latex="${encoded}"></span>`
    )
  }

  const handleImagePick = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadAdminImageFile(file, { folder: uploadFolder })
      insertHtml(`<img src="${url}" alt="" class="max-w-full rounded-lg my-2" />`)
    } catch (e) {
      window.alert(e.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50">
        {!sourceMode ? (
          <>
            <button type="button" className={toolbarBtn} onClick={() => { exec('bold'); emitChange() }} title={labels.bold || 'Bold'}>
              <Bold className="w-4 h-4" />
            </button>
            <button type="button" className={toolbarBtn} onClick={() => { exec('italic'); emitChange() }} title={labels.italic || 'Italic'}>
              <Italic className="w-4 h-4" />
            </button>
            <button type="button" className={toolbarBtn} onClick={() => { exec('underline'); emitChange() }} title={labels.underline || 'Underline'}>
              <Underline className="w-4 h-4" />
            </button>
            <span className="w-px h-5 bg-slate-300 mx-1" />
            <button type="button" className={toolbarBtn} onClick={() => { exec('insertUnorderedList'); emitChange() }} title={labels.bulletList || 'Bullet list'}>
              <List className="w-4 h-4" />
            </button>
            <button type="button" className={toolbarBtn} onClick={() => { exec('insertOrderedList'); emitChange() }} title={labels.numberedList || 'Numbered list'}>
              <ListOrdered className="w-4 h-4" />
            </button>
            <span className="w-px h-5 bg-slate-300 mx-1" />
            <button type="button" className={toolbarBtn} onClick={addLink} title={labels.link || 'Link'}>
              <LinkIcon className="w-4 h-4" />
            </button>
            <button type="button" className={toolbarBtn} disabled={uploading} onClick={() => fileRef.current?.click()} title={labels.image || 'Image'}>
              <ImageIcon className="w-4 h-4" />
            </button>
            <button type="button" className={toolbarBtn} onClick={addFormula} title={labels.formula || 'Formula'}>
              <Sigma className="w-4 h-4" />
            </button>
            <button type="button" className={toolbarBtn} onClick={() => { exec('formatBlock', 'pre'); emitChange() }} title={labels.code || 'Code'}>
              <Code className="w-4 h-4" />
            </button>
          </>
        ) : null}
        <button
          type="button"
          className={`ml-auto text-xs px-2 py-1 rounded-md ${sourceMode ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-200'}`}
          onClick={toggleSource}
        >
          {sourceMode ? labels.visualMode || '可视化' : labels.sourceMode || 'HTML'}
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleImagePick(e.target.files?.[0])}
      />

      {sourceMode ? (
        <textarea
          value={sourceText}
          onChange={(e) => handleSourceChange(e.target.value)}
          rows={Math.max(4, Math.ceil(minHeight / 24))}
          className="w-full px-3 py-2 text-sm font-mono text-slate-700 border-0 focus:ring-0 resize-y"
          placeholder={placeholder}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onBlur={emitChange}
          data-placeholder={placeholder}
          className="admin-rich-editor px-3 py-2 text-sm text-slate-800 outline-none prose prose-sm max-w-none min-h-[var(--editor-min-h)] empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400"
          style={{ '--editor-min-h': `${minHeight}px` }}
        />
      )}

      {uploading ? (
        <p className="text-xs text-slate-500 px-3 py-1 border-t border-slate-100">{labels.uploading || '上传图片中…'}</p>
      ) : null}
    </div>
  )
}
