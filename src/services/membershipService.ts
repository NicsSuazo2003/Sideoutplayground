import { delay } from './api';
import type { MembershipPlan, MembershipTier } from '../types';
import { mockMembershipPlans } from '../mocks/membershipPlans';
import { mockUsers } from '../mocks/users';

// Replace with real API call: axios.get('/api/membership/plans')
export async function getPlans(): Promise<MembershipPlan[]> {
  await delay(300);
  return [...mockMembershipPlans];
}

// Replace with real API call: axios.get('/api/membership/user')
export async function getUserMembership(userId: string): Promise<MembershipPlan | null> {
  await delay(300);
  const user = mockUsers.find(u => u.id === userId);
  if (!user || user.membershipTier === 'free') return null;
  return mockMembershipPlans.find(p => p.tier === user.membershipTier) || null;
}

// Replace with real API call: axios.post('/api/membership/upgrade', { planId })
export async function upgradePlan(userId: string, planId: string): Promise<MembershipTier> {
  await delay(800);
  const plan = mockMembershipPlans.find(p => p.id === planId);
  if (!plan) throw new Error('Plan not found');
  const userIdx = mockUsers.findIndex(u => u.id === userId);
  if (userIdx === -1) throw new Error('User not found');
  mockUsers[userIdx].membershipTier = plan.tier;
  return plan.tier;
}
