import { create } from 'zustand';
import type { MembershipPlan } from '../types';
import * as membershipService from '../services/membershipService';
import { useAuthStore } from './authStore';

interface MembershipState {
  plans: MembershipPlan[];
  currentPlan: MembershipPlan | null;
  upgradeModalOpen: boolean;
  isLoading: boolean;
  fetchPlans: () => Promise<void>;
  fetchCurrentPlan: () => Promise<void>;
  upgradePlan: (planId: string) => Promise<void>;
  setUpgradeModalOpen: (open: boolean) => void;
}

export const useMembershipStore = create<MembershipState>((set) => ({
  plans: [],
  currentPlan: null,
  upgradeModalOpen: false,
  isLoading: false,

  fetchPlans: async () => {
    set({ isLoading: true });
    const plans = await membershipService.getPlans();
    set({ plans, isLoading: false });
  },

  fetchCurrentPlan: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    set({ isLoading: true });
    const plan = await membershipService.getUserMembership(userId);
    set({ currentPlan: plan, isLoading: false });
  },

  upgradePlan: async (planId) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    set({ isLoading: true });
    const tier = await membershipService.upgradePlan(userId, planId);
    useAuthStore.setState(state => ({
      user: state.user ? { ...state.user, membershipTier: tier } : null
    }));
    const plans = await membershipService.getPlans();
    const plan = plans.find(p => p.id === planId) || null;
    set({ currentPlan: plan, isLoading: false, upgradeModalOpen: false });
  },

  setUpgradeModalOpen: (open) => set({ upgradeModalOpen: open }),
}));
