'use client'

import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChatbotProvider } from '@/components/chatbot';

const RegisterPage = () => {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!agree) {
      setError('Please accept the Terms & Privacy Policy.');
      return;
    }
    if (password.length < 8) {
      setError('Password should be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('https://nvccz-pi.vercel.app/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          phone,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (data?.success) {
        setSuccess('Account created successfully. Redirecting…');
        setTimeout(() => router.push('/auth/login'), 900);
      } else {
        setError(data?.message || 'Registration failed.');
      }
    } catch {
      setError('An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChatbotProvider position="bottom-left">
      <div className="relative min-h-screen overflow-hidden font-poppins">
        {/* ===== Background Image ===== */}
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0 -z-10"
        >
          <Image
            src="/login/bg-register.png"
            alt="Background"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>

        {/* Overlay for contrast */}
        <motion.div
          aria-hidden
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          transition={{ duration: 0.8 }}
          style={{
            background:
              'linear-gradient(135deg, rgba(0,86,164,0.5), rgba(203,213,225,0.5))',
          }}
        />

        {/* Floating light patterns */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none animate-slow-shift"
          style={{
            background:
              'radial-gradient(1200px 600px at 80% 20%, rgba(0,86,164,0.18), transparent 60%), radial-gradient(1000px 500px at 10% 90%, rgba(148,163,184,0.22), transparent 60%)',
          }}
        />

        {/* ===== Content ===== */}
        <div className="flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full max-w-xl"
          >
            <div
              className="p-8 md:p-10 rounded-2xl shadow-xl backdrop-blur-md"
              style={{
                backgroundColor: 'rgba(255,255,255,0.92)',
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <div className="text-center mb-8">
                <h1 className="text-4xl font-light text-black mb-2 tracking-wide">
                  Create your account
                </h1>
                <p className="text-lg text-gray-700">Join NVCCZ and get started</p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-gray-200 text-gray-800 rounded-lg text-base"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-gray-100 text-gray-800 border border-gray-300 rounded-lg text-base"
                >
                  {success}
                </motion.div>
              )}

              {/* ===== Form ===== */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Full Name */}
                <motion.div>
                  <label className="block text-lg font-light text-black mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="text"
                      required
                      className="block w-full pl-10 pr-3 py-3 rounded-lg bg-gray-100 border border-gray-400 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0056A4] transition"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </motion.div>

                {/* Phone */}
                <motion.div>
                  <label className="block text-lg font-light text-black mb-1">
                    Phone (optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="tel"
                      className="block w-full pl-10 pr-3 py-3 rounded-lg bg-gray-100 border border-gray-400 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0056A4] transition"
                      placeholder="+263 7x xxx xxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </motion.div>

                {/* Email */}
                <motion.div>
                  <label className="block text-lg font-light text-black mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="email"
                      required
                      className="block w-full pl-10 pr-3 py-3 rounded-lg bg-gray-100 border border-gray-400 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0056A4] transition"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div>
                  <label className="block text-lg font-light text-black mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="password"
                      required
                      className="block w-full pl-10 pr-3 py-3 rounded-lg bg-gray-100 border border-gray-400 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0056A4] transition"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </motion.div>

                {/* Confirm Password */}
                <motion.div>
                  <label className="block text-lg font-light text-black mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="password"
                      required
                      className="block w-full pl-10 pr-3 py-3 rounded-lg bg-gray-100 border border-gray-400 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0056A4] transition"
                      placeholder="••••••••"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                    />
                  </div>
                </motion.div>

                {/* Terms */}
                <motion.div className="flex items-start gap-2">
                  <input
                    id="agree"
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded bg-gray-200 border-gray-500 text-[#0056A4] focus:ring-[#0056A4]"
                  />
                  <label htmlFor="agree" className="text-base text-gray-700">
                    I agree to the{' '}
                    <Link href="/terms" className="text-[#0056A4] hover:underline">Terms</Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-[#0056A4] hover:underline">Privacy Policy</Link>.
                  </label>
                </motion.div>

                {/* Submit */}
                <motion.div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-3 px-4 rounded-lg shadow-md text-lg font-semibold text-white bg-[#0056A4] hover:bg-[#064f94] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0056A4] transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Creating account…' : 'Create account'}
                  </button>
                </motion.div>
              </form>

              {/* Sign in link */}
              <motion.div className="mt-6 text-center">
                <p className="text-lg text-gray-700">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="font-medium text-[#0056A4] hover:underline">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Background subtle motion */}
        <style jsx>{`
          @keyframes slowShift {
            0% { transform: translate3d(0,0,0); }
            50% { transform: translate3d(-1.5%, -1.5%, 0); }
            100% { transform: translate3d(0,0,0); }
          }
          .animate-slow-shift {
            animation: slowShift 18s ease-in-out infinite;
          }
        `}</style>
      </div>
    </ChatbotProvider>
  );
};

export default RegisterPage;

