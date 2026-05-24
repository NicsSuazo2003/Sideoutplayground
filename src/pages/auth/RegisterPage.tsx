import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone) e.phone = 'Phone is required';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    if (!agreed) e.terms = 'You must accept the terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      toast.success('Account created! Welcome to Side Out!');
      navigate('/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-[#7CFC00]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-[#FF1493]/5 rounded-full blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#7CFC00] flex items-center justify-center glow-green mx-auto mb-4">
            <Zap size={28} className="text-black fill-black" />
          </div>
          <h1 className="text-2xl font-black text-white">Create Account</h1>
          <p className="text-white/50 text-sm mt-1">Join Side Out Playground today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" placeholder="Alex Rivera" value={form.name} onChange={set('name')} error={errors.name} leftIcon={<User size={16} />} />
          <Input label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} leftIcon={<Mail size={16} />} />
          <Input label="Phone Number" type="tel" placeholder="+1 555-0000" value={form.phone} onChange={set('phone')} error={errors.phone} leftIcon={<Phone size={16} />} />
          <Input label="Password" type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} error={errors.password} leftIcon={<Lock size={16} />} />
          <Input label="Confirm Password" type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} leftIcon={<Lock size={16} />} />

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-[#7CFC00]"
            />
            <span className="text-xs text-white/50">
              I agree to the{' '}
              <a href="#" className="text-[#7CFC00] hover:underline">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="text-[#7CFC00] hover:underline">Privacy Policy</a>
            </span>
          </label>
          {errors.terms && <p className="text-xs text-red-400">{errors.terms}</p>}

          <Button variant="neon" size="lg" loading={isLoading} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-white/40 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#7CFC00] hover:text-[#7CFC00]/80 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
