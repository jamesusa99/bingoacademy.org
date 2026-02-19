import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">Reset Password</h1>
      <p className="text-gray-600 mb-8">Enter your registered email and we will send a link to help you reset your password</p>
      <div className="card p-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary mb-4"
        />
        <button type="button" className="btn-primary w-full py-2.5">Send Reset Link</button>
        <Link to="/login" className="mt-4 inline-block text-primary text-sm font-medium hover:underline">Back to Login</Link>
      </div>
    </div>
  )
}
