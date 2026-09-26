import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  Save,
  Trash2,
  Edit2,
  Clock,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  getPriceRules,
  createPriceRule,
  updatePriceRule,
  deletePriceRule,
  type PriceRule,
} from '../../services/courtService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const DAYS = [
  'All',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
  'Weekday',
  'Weekend',
];

function format12h(time?: string): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function AdminPriceRules() {
  const [rules, setRules] = useState<PriceRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    dayOfWeek: 'All',
    startTime: '',
    endTime: '',
    pricePerHour: '',
    priority: '0',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await getPriceRules();
      setRules(data);
    } catch {
      toast.error('Failed to load price rules');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      dayOfWeek: 'All',
      startTime: '',
      endTime: '',
      pricePerHour: '',
      priority: '0',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.startTime || !form.endTime || !form.pricePerHour) {
      toast.error('Fill all required fields');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updatePriceRule(editingId, {
          name: form.name,
          dayOfWeek: form.dayOfWeek,
          startTime: form.startTime,
          endTime: form.endTime,
          pricePerHour: parseFloat(form.pricePerHour),
          priority: parseInt(form.priority, 10),
        });
        toast.success('Price rule updated');
      } else {
        await createPriceRule({
          name: form.name,
          dayOfWeek: form.dayOfWeek,
          startTime: form.startTime,
          endTime: form.endTime,
          pricePerHour: parseFloat(form.pricePerHour),
          priority: parseInt(form.priority, 10),
        });
        toast.success('New rule added');
      }
      resetForm();
      fetchRules();
    } catch {
      toast.error('Failed to save price rule');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing rule?')) return;
    try {
      await deletePriceRule(id);
      toast.success('Rule deleted');
      fetchRules();
    } catch {
      toast.error('Failed to delete rule');
    }
  };

  const handleEdit = (rule: PriceRule) => {
    setForm({
      name: rule.name,
      dayOfWeek: rule.dayOfWeek,
      startTime: rule.startTime,
      endTime: rule.endTime,
      pricePerHour: String(rule.pricePerHour),
      priority: String(rule.priority),
    });
    setEditingId(rule.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl pb-24 sm:pb-12">
      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Dynamic Pricing Rules
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure peak hour surcharges and weekend pricing schedules.
          </p>
        </div>

        {!showForm && (
          <Button
            variant="neon"
            size="sm"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            leftIcon={<Plus size={15} />}
            className="font-bold text-xs shadow-xs self-start sm:self-auto"
          >
            Add New Rule
          </Button>
        )}
      </div>

      {/* Pricing Rule Form Drawer / Card */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            onSubmit={handleSave}
            className="rounded-2xl border border-teal-200/80 bg-white p-4 sm:p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Tag size={15} />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  {editingId ? 'Edit Pricing Rule' : 'Create Pricing Rule'}
                </h2>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="p-1.5 text-slate-400 hover:text-slate-700 active:scale-95 transition rounded-lg hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Rule Label *"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Weekend Evening Peak"
              />

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Active Day(s) *
                </label>
                <select
                  value={form.dayOfWeek}
                  onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="From Time *"
                type="time"
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              />

              <Input
                label="Until Time *"
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
              />

              <Input
                label="Applied Rate (₱/hr) *"
                type="number"
                value={form.pricePerHour}
                onChange={(e) => setForm((f) => ({ ...f, pricePerHour: e.target.value }))}
                placeholder="250"
              />

              <Input
                label="Rule Priority (Higher overrides)"
                type="number"
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                variant="neon"
                size="sm"
                type="submit"
                loading={saving}
                leftIcon={<Save size={14} />}
                className="font-bold shadow-xs"
              >
                {editingId ? 'Update Rule' : 'Save Rule'}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Rules List */}
      <div className="space-y-3">
        {rules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-400 text-xs sm:text-sm">
            <Tag className="mx-auto mb-2 h-7 w-7 opacity-30 text-teal-600" />
            <p className="font-medium text-slate-600">No dynamic rules active</p>
            <p className="mt-0.5 text-xs text-slate-400">
              The court base rate applies to all available operating hours.
            </p>
          </div>
        ) : (
          rules.map((rule) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition hover:border-slate-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                      {rule.name}
                    </h3>
                    <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 uppercase">
                      {rule.dayOfWeek}
                    </span>
                    {rule.priority > 0 && (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        Priority {rule.priority}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-teal-600 shrink-0" />
                      <span>
                        {format12h(rule.startTime)} – {format12h(rule.endTime)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 font-semibold text-teal-700">
                      <span>₱{rule.pricePerHour}</span>
                      <span className="text-[10px] text-slate-400 font-normal">/ hour</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0 justify-end">
                  <button
                    onClick={() => handleEdit(rule)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 transition active:scale-95 shadow-2xs"
                  >
                    <Edit2 size={12} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition active:scale-95"
                    aria-label="Delete rule"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}