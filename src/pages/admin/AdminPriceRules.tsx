import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Save, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getPriceRules, createPriceRule, updatePriceRule, deletePriceRule, type PriceRule } from '../../services/courtService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const DAYS = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Weekday', 'Weekend'];

export function AdminPriceRules() {
  const [rules, setRules] = useState<PriceRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', dayOfWeek: 'All', startTime: '', endTime: '', pricePerHour: '', priority: '0' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchRules(); }, []);

  const fetchRules = async () => {
    setLoading(true);
    try { const data = await getPriceRules(); setRules(data); }
    catch { toast.error('Failed to load price rules'); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ name: '', dayOfWeek: 'All', startTime: '', endTime: '', pricePerHour: '', priority: '0' });
    setEditingId(null); setShowForm(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.startTime || !form.endTime || !form.pricePerHour) { toast.error('Fill all required fields'); return; }
    setSaving(true);
    try {
      if (editingId) {
        await updatePriceRule(editingId, { name: form.name, dayOfWeek: form.dayOfWeek, startTime: form.startTime, endTime: form.endTime, pricePerHour: parseFloat(form.pricePerHour), priority: parseInt(form.priority) });
        toast.success('Rule updated');
      } else {
        await createPriceRule({ name: form.name, dayOfWeek: form.dayOfWeek, startTime: form.startTime, endTime: form.endTime, pricePerHour: parseFloat(form.pricePerHour), priority: parseInt(form.priority) });
        toast.success('Rule added');
      }
      resetForm(); fetchRules();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this rule?')) return;
    try { await deletePriceRule(id); toast.success('Rule deleted'); fetchRules(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleEdit = (rule: PriceRule) => {
    setForm({ name: rule.name, dayOfWeek: rule.dayOfWeek, startTime: rule.startTime, endTime: rule.endTime, pricePerHour: String(rule.pricePerHour), priority: String(rule.priority) });
    setEditingId(rule.id); setShowForm(true);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Price Rules</h1>
          <p className="text-slate-500 text-sm mt-1">Peak pricing for specific days and times</p>
        </div>
        <Button variant="neon" size="sm" onClick={() => { resetForm(); setShowForm(true); }}><Plus size={14} /> Add Rule</Button>
      </div>

      {showForm && (
        <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-800 font-bold">{editingId ? 'Edit Rule' : 'New Rule'}</h3>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="Rule Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Weekend Peak" />
            <div>
              <label className="text-sm text-slate-600 block mb-1.5">Day</label>
              <select value={form.dayOfWeek} onChange={e => setForm(f => ({ ...f, dayOfWeek: e.target.value }))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700">
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <Input label="Start Time" type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
            <Input label="End Time" type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
            <Input label="Price (₱)" type="number" value={form.pricePerHour} onChange={e => setForm(f => ({ ...f, pricePerHour: e.target.value }))} />
            <Input label="Priority (higher = overrides)" type="number" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} />
          </div>
          <Button variant="neon" size="sm" type="submit" loading={saving}><Save size={14} /> Save Rule</Button>
        </motion.form>
      )}

      <div className="space-y-3">
        {rules.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center text-slate-400 text-sm">No price rules yet. Base court price applies to all slots.</div>
        ) : (
          rules.map(rule => (
            <div key={rule.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex items-center justify-between">
              <div>
                <div className="text-slate-800 font-semibold text-sm">{rule.name}</div>
                <div className="text-slate-400 text-xs">{rule.dayOfWeek} · {rule.startTime}–{rule.endTime} · ₱{rule.pricePerHour}/hr · Priority {rule.priority}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(rule)} className="text-xs text-teal-600 hover:underline">Edit</button>
                <button onClick={() => handleDelete(rule.id)} className="text-red-500 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}