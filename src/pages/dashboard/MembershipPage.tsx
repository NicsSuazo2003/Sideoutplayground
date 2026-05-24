import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMembershipStore } from '../../stores/membershipStore';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function MembershipPage() {
  const { plans, currentPlan, isLoading, upgradeModalOpen, fetchPlans, fetchCurrentPlan, upgradePlan, setUpgradeModalOpen } = useMembershipStore();
  const { user } = useAuthStore();

  useEffect(() => { fetchPlans(); fetchCurrentPlan(); }, []);

  const handleUpgrade = async (planId: string) => {
    try {
      await upgradePlan(planId);
      toast.success('Membership upgraded successfully!');
    } catch {
      toast.error('Failed to upgrade membership');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Membership</h1>
        <p className="text-white/50 text-sm mt-1">Manage your Side Out Playground membership</p>
      </div>

      {currentPlan && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-[#7CFC00]/20">
          <div className="flex items-center gap-3 mb-3">
            <Crown size={20} style={{ color: currentPlan.color }} />
            <span className="text-white font-bold">Current Plan: {currentPlan.name}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentPlan.benefits.map(b => (
              <span key={b} className="flex items-center gap-1.5 text-xs text-white/60 bg-white/5 rounded-full px-3 py-1">
                <Check size={11} className="text-[#7CFC00]" /> {b}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {user?.membershipTier === 'free' && (
        <div className="glass-card p-5 border-yellow-600/20">
          <div className="flex items-center gap-3">
            <Zap size={18} className="text-yellow-400" />
            <p className="text-white/70 text-sm">You're on the Free tier. Upgrade to unlock discounts and premium features!</p>
            <Button variant="neon" size="sm" className="ml-auto whitespace-nowrap" onClick={() => setUpgradeModalOpen(true)}>
              Upgrade Now
            </Button>
          </div>
        </div>
      )}

      {isLoading && !plans.length ? <LoadingSpinner /> : (
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan, i) => {
            const isCurrent = user?.membershipTier === plan.tier;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.01 }}
                className={`glass-card p-6 ${isCurrent ? 'border-[#7CFC00]/40' : ''} ${plan.tier === 'gold' && !isCurrent ? 'border-[#FF1493]/30' : ''}`}
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold uppercase tracking-wider" style={{ color: plan.color }}>{plan.name}</span>
                    {isCurrent && <span className="text-[10px] bg-[#7CFC00]/20 text-[#7CFC00] px-2 py-0.5 rounded-full font-bold">CURRENT</span>}
                  </div>
                  <div className="text-4xl font-black text-white">${plan.price}<span className="text-base font-normal text-white/40">/mo</span></div>
                  <div className="text-xs text-white/40 mt-1">{plan.discountPercent}% booking discount</div>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.benefits.map(b => (
                    <li key={b} className="flex items-start gap-2 text-sm text-white/70">
                      <Check size={13} className="text-[#7CFC00] shrink-0 mt-0.5" /> {b}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={isCurrent ? 'outline' : plan.tier === 'gold' ? 'pink' : 'neon'}
                  className="w-full"
                  disabled={isCurrent}
                  onClick={() => handleUpgrade(plan.id)}
                  loading={isLoading}
                >
                  {isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal open={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} title="Choose Your Membership" size="xl">
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map(plan => (
            <div key={plan.id} className={`glass rounded-xl p-4 ${plan.tier === 'gold' ? 'border-[#FF1493]/30' : ''}`}>
              <div className="font-bold mb-1" style={{ color: plan.color }}>{plan.name}</div>
              <div className="text-2xl font-black text-white mb-3">${plan.price}<span className="text-sm font-normal text-white/40">/mo</span></div>
              <ul className="space-y-1.5 mb-4">
                {plan.benefits.slice(0, 4).map(b => (
                  <li key={b} className="flex items-start gap-1.5 text-xs text-white/60">
                    <Check size={11} className="text-[#7CFC00] mt-0.5 shrink-0" /> {b}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.tier === 'gold' ? 'pink' : 'neon'}
                size="sm"
                className="w-full"
                onClick={() => handleUpgrade(plan.id)}
                loading={isLoading}
              >
                Select {plan.name}
              </Button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
