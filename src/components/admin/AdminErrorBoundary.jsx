import { Component } from 'react'

export default class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 space-y-3">
        <h2 className="text-lg font-semibold text-red-800">页面加载出错</h2>
        <p className="text-sm text-red-700">
          请刷新页面重试。若仍失败，请打开浏览器开发者工具 (Console) 查看错误信息。
        </p>
        <pre className="text-xs text-red-900/80 whitespace-pre-wrap break-words bg-white/70 rounded-lg p-3 border border-red-100">
          {error.message}
        </pre>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-sm text-primary hover:underline"
        >
          刷新页面
        </button>
      </div>
    )
  }
}
