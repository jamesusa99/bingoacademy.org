import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const ROLES = [
  { value: 'student', label: 'Student/Parent' },
  { value: 'teacher', label: 'Teacher/Institution' },
  { value: 'enterprise', label: 'Enterprise' },
]

export default function Login() {
  const navigate = useNavigate()
  const [role, setRole] = useState('student')
  const [loginType, setLoginType] = useState('code') // 'code' | 'password'
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')

  const handleWechatLogin = () => {
    // TODO: WeChat OAuth / H5 auth, exchange code for token
    navigate('/')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Call login API, verify code or password with role
    if (loginType === 'code') {
      if (phone && code) navigate('/')
    } else {
      if (phone && password) navigate('/')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">Login</h1>
      <p className="text-slate-600 mb-6">Log in to access courses, events, purchases, and referral promotions. Browse homepage without login.</p>

      <button
        type="button"
        onClick={handleWechatLogin}
        className="w-full py-3 rounded-xl bg-[#07c160] text-white font-medium mb-6 hover:opacity-90 transition"
      >
        WeChat Quick Login
      </button>

      <div className="flex items-center gap-3 mb-6">
        <span className="flex-1 h-px bg-slate-200" />
        <span className="text-slate-500 text-sm">or</span>
        <span className="flex-1 h-px bg-slate-200" />
      </div>

      <div className="mb-4">
        <span className="block text-sm font-medium text-slate-700 mb-2">Login as</span>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={`px-4 py-2 rounded-lg text-sm border transition ${
                role === r.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-slate-300 text-slate-600 hover:border-primary/50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => setLoginType('code')}
          className={`flex-1 py-2 rounded-lg text-sm border transition ${loginType === 'code' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-600'}`}
        >
          Code Login
        </button>
        <button
          type="button"
          onClick={() => setLoginType('password')}
          className={`flex-1 py-2 rounded-lg text-sm border transition ${loginType === 'password' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-600'}`}
        >
          Password Login
        </button>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
            required
          />
        </div>
        {loginType === 'code' ? (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Verification Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code"
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                required
              />
              <button type="button" className="shrink-0 px-4 py-2 rounded-lg border border-primary text-primary text-sm">
                Get Code
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
            <div className="flex justify-end mt-1">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
            </div>
          </div>
        )}
        <button type="submit" className="btn-primary w-full py-3">
          {loginType === 'code' ? 'Login with Code' : 'Login with Password'}
        </button>
      </form>

      <p className="mt-6 text-center text-slate-600 text-sm">
        No account? <Link to="/register" className="text-primary font-medium hover:underline">Register</Link>
      </p>
    </div>
  )
}
