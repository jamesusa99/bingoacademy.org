import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const ROLES = [
  { value: 'student', label: 'Student/Parent' },
  { value: 'teacher', label: 'Teacher/Institution' },
  { value: 'enterprise', label: 'Enterprise' },
]

export default function Register() {
  const navigate = useNavigate()
  const [role, setRole] = useState('student')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Call registration API, send verification code, include role
    if (phone && password && agree) {
      navigate('/login')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">Register</h1>
      <p className="text-slate-600 mb-8">Register for newcomer benefits, courses, events, and referral commissions</p>

      <div className="mb-4">
        <span className="block text-sm font-medium text-slate-700 mb-2">Register as</span>
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
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Verification Code</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button type="button" className="shrink-0 px-4 py-2 rounded-lg border border-primary text-primary text-sm whitespace-nowrap">
              Get Code
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Set Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6+ letters or numbers"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
            required
            minLength={6}
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-1 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <span>I have read and agree to <a href="/#/agreement" className="text-primary hover:underline">Terms of Service</a> and <a href="/#/privacy" className="text-primary hover:underline">Privacy Policy</a></span>
        </label>
        <button type="submit" className="btn-primary w-full py-3" disabled={!agree}>
          Register
        </button>
      </form>

      <p className="mt-6 text-center text-slate-600 text-sm">
        Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
      </p>
    </div>
  )
}
