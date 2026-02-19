import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">Reset Password</h1>
      <p className="text-gray-600 mb-8">Enter your registered phone number and we will send a verification code to help you reset your password</p>
      <div className="card p-6">
        <p className="text-gray-600 text-sm">Password reset requires SMS/email service integration.</p>
        <Link to="/login" className="mt-4 inline-block text-primary font-medium hover:underline">Back to Login</Link>
      </div>
    </div>
  )
}
