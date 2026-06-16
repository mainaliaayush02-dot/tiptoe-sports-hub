import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { GiSoccerBall } from 'react-icons/gi'
import { FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    try {
      await login(email, password)
      navigate('/admin', { replace: true })
    } catch (e) {
      const msg = e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password'
        ? 'Invalid email or password.'
        : 'Login failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-[#1e3680] to-green flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <GiSoccerBall className="text-5xl text-gold mx-auto mb-3" />
          <h1 className="font-black text-2xl text-white">Tiptoe Sports Hub</h1>
          <p className="text-white/60 text-sm mt-1">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="font-black text-xl text-navy mb-6">Sign In</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('email', { required: 'Email is required' })}
                  type="email"
                  className={`input-field pl-10 ${errors.email ? 'border-red-400' : ''}`}
                  placeholder="admin@example.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('password', { required: 'Password is required' })}
                  type="password"
                  className={`input-field pl-10 ${errors.password ? 'border-red-400' : ''}`}
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  autoComplete="current-password"
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </span>
              ) : (
                <>Sign In <FaArrowRight /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          Tiptoe Sports Hub Admin Panel â€” Authorized Access Only
        </p>
      </div>
    </div>
  )
}
