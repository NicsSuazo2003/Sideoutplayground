import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle2, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { forgotPassword } from '../../services/authService';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#7CFC00]/5 rounded-full blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 w-full max-w-md relative z-10"
      >
        {sent ? (
          <div className="text-center py-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-16 h-16 rounded-full bg-[#7CFC00]/20 flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle2 size={32} className="text-[#7CFC00]" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
            <p className="text-white/50 text-sm mb-6">
              We've sent a password reset link to <span className="text-white">{email}</span>.
              Check your inbox and follow the instructions.
            </p>
            <Link to="/login">
              <Button variant="neon" className="w-full">Back to Sign In</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[#7CFC00] flex items-center justify-center glow-green mx-auto mb-4">
                <Zap size={28} className="text-black fill-black" />
              </div>
              <h1 className="text-2xl font-black text-white">Forgot Password?</h1>
              <p className="text-white/50 text-sm mt-1">Enter your email to receive a reset link</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                leftIcon={<Mail size={16} />}
              />
              <Button variant="neon" size="lg" loading={loading} className="w-full">
                Send Reset Link
              </Button>
            </form>

            <p className="text-center text-sm text-white/40 mt-6">
              Remember your password?{' '}
              <Link to="/login" className="text-[#7CFC00] hover:text-[#7CFC00]/80 font-medium">Sign in</Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
