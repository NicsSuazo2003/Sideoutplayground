// src/hooks/usePendingBooking.ts
import { useEffect, useState } from 'react';
import * as bookingService from '../services/bookingService';
import type { Booking } from '../types';

const REF_KEY = 'pendingBookingRef';
const EMAIL_KEY = 'pendingBookingEmail';
const DISMISS_KEY = 'pendingBannerDismissed';

/** Fired whenever a pending booking is saved, cleared, or dismissed. */
export const PENDING_BOOKING_EVENT = 'pendingBookingUpdated';

export interface PendingRef {
  reference: string;
  email: string;
}

/** Read the stored pending booking ref+email, if any. */
export function getPendingBooking(): PendingRef | null {
  const reference = localStorage.getItem(REF_KEY);
  const email = localStorage.getItem(EMAIL_KEY);
  if (!reference) return null;
  return { reference, email: email ?? '' };
}

/** Save a freshly-created booking's ref+email to localStorage. */
export function savePendingBooking(reference: string, email: string): void {
  localStorage.setItem(REF_KEY, reference);
  localStorage.setItem(EMAIL_KEY, email);
  window.dispatchEvent(new Event(PENDING_BOOKING_EVENT));
}

/** Remove the pending booking ref (call after successful payment / release). */
export function clearPendingBooking(): void {
  localStorage.removeItem(REF_KEY);
  localStorage.removeItem(EMAIL_KEY);
  sessionStorage.removeItem(DISMISS_KEY);
  window.dispatchEvent(new Event(PENDING_BOOKING_EVENT));
}

/** Mark the pending-booking banner as dismissed for this session. */
export function dismissPendingBanner(): void {
  const ref = localStorage.getItem(REF_KEY);
  if (ref) sessionStorage.setItem(DISMISS_KEY, ref);
  window.dispatchEvent(new Event(PENDING_BOOKING_EVENT));
}

/** True if the current ref has been dismissed in this session. */
export function isPendingBannerDismissed(): boolean {
  const ref = localStorage.getItem(REF_KEY);
  if (!ref) return false;
  return sessionStorage.getItem(DISMISS_KEY) === ref;
}

/**
 * Hook that tracks whether a pending (unpaid) booking exists on this device.
 * Re-fetches whenever PENDING_BOOKING_EVENT fires (save, clear, dismiss).
 */
export function usePendingBooking() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState<boolean>(() => isPendingBannerDismissed());

 useEffect(() => {
  let cancelled = false;

  const load = async () => {
    const pending = getPendingBooking();
    if (!pending) {
      if (!cancelled) {
        setBooking(null);
        setDismissed(false);
      }
      return;
    }

    setDismissed(isPendingBannerDismissed());
    setLoading(true);
    try {
      const fetched = await bookingService.trackBooking(pending.reference, pending.email);
      if (cancelled) return;

      if (fetched.status === 'pending_payment') {
        setBooking(fetched);
      } else {
        clearPendingBooking();
        setBooking(null);
      }
    } catch {
      if (cancelled) return;
      clearPendingBooking();
      setBooking(null);
    } finally {
      if (!cancelled) setLoading(false);
    }
  };

  load();

  // Same-tab updates: our helper functions dispatch a custom event.
  const onUpdate = () => {
    setDismissed(isPendingBannerDismissed());
    load();
  };
  window.addEventListener(PENDING_BOOKING_EVENT, onUpdate);

  // 🔵 Cross-tab updates: the `storage` event fires only in *other* tabs
  // when localStorage changes. This makes the navbar dot / landing banner
  // disappear in tab 2 when the user pays in tab 1 (and vice versa).
  const onStorage = (e: StorageEvent) => {
    if (e.key === REF_KEY || e.key === EMAIL_KEY || e.key === null) {
      setDismissed(isPendingBannerDismissed());
      load();
    }
  };
  window.addEventListener('storage', onStorage);

  return () => {
    cancelled = true;
    window.removeEventListener(PENDING_BOOKING_EVENT, onUpdate);
    window.removeEventListener('storage', onStorage);
  };
}, []);

  return { booking, loading, dismissed };
}