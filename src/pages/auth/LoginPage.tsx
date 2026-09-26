import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Zap, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = 'Enter a valid email address';
    }

    if (!password) {
      e.password = 'Password is required';
    } else if (password.length < 6) {
      e.password = 'Password must be at least 6 characters';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await login(email.trim(), password);
      toast.success('Welcome back!');

      const user = useAuthStore.getState().user;
      if (user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid email or password');
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center px-4 pt-20 pb-12 bg-slate-50 overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl"
      >
        {/* Brand Icon & Heading */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/20">
            <Zap size={24} className="fill-current" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Welcome Back
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Sign in to manage your court reservations and profile
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            leftIcon={<Mail size={16} />}
            autoComplete="email"
          />

          <div className="space-y-1">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              leftIcon={<Lock size={16} />}
              rightIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              onRightIconClick={() => setShowPassword((prev) => !prev)}
              autoComplete="current-password"
            />

            <div className="flex justify-end pt-1">
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline transition-colors py-1"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <Button
            variant="neon"
            size="lg"
            type="submit"
            loading={isLoading}
            className="w-full font-bold shadow-md mt-2"
            rightIcon={<ArrowRight size={16} />}
          >
            Sign In
          </Button>
        </form>

        {/* Register Footer Link */}
        <p className="mt-6 text-center text-xs sm:text-sm text-slate-500">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-bold text-teal-600 hover:text-teal-700 hover:underline transition-colors"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}