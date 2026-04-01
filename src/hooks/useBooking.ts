// ============================================================
// src/hooks/useBooking.ts
// State machine for the multi-step booking flow
// ============================================================

'use client';
import { useState, useCallback } from 'react';
import type { BookingFormState, BookingStep, Service, Specialist, Centro, TimeSlot } from '@/types';

const INITIAL_STATE: BookingFormState = {
  step: 'service',
  service: null,
  specialist: null,
  centro: null,
  location_type: 'centro',
  date: null,
  time_slot: null,
  client_name: '',
  client_email: '',
  client_phone: '',
  home_address: '',
  client_notes: '',
};

const STEPS: BookingStep[] = ['service', 'specialist', 'datetime', 'details', 'payment', 'confirmation'];

export function useBooking() {
  const [state, setState] = useState<BookingFormState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Navigation ---
  const currentStepIndex = STEPS.indexOf(state.step);

  const goNext = useCallback(() => {
    const next = STEPS[currentStepIndex + 1];
    if (next) setState(s => ({ ...s, step: next }));
  }, [currentStepIndex]);

  const goBack = useCallback(() => {
    const prev = STEPS[currentStepIndex - 1];
    if (prev) setState(s => ({ ...s, step: prev }));
  }, [currentStepIndex]);

  const goTo = useCallback((step: BookingStep) => {
    setState(s => ({ ...s, step }));
  }, []);

  // --- Step setters ---
  const selectService = useCallback((service: Service) => {
    setState(s => ({
      ...s,
      service,
      // Reset downstream selections when service changes
      specialist: null,
      centro: null,
      date: null,
      time_slot: null,
      step: 'specialist',
    }));
  }, []);

  const selectSpecialist = useCallback((specialist: Specialist) => {
    setState(s => ({
      ...s,
      specialist,
      // Reset downstream
      centro: null,
      date: null,
      time_slot: null,
      step: 'datetime',
    }));
  }, []);

  const selectCentro = useCallback((centro: Centro | null, locationType: 'centro' | 'home') => {
    setState(s => ({
      ...s,
      centro,
      location_type: locationType,
      date: null,
      time_slot: null,
    }));
  }, []);

  const selectDate = useCallback((date: string) => {
    setState(s => ({ ...s, date, time_slot: null }));
  }, []);

  const selectSlot = useCallback((slot: TimeSlot) => {
    setState(s => ({ ...s, time_slot: slot, step: 'details' }));
  }, []);

  const updateClientDetails = useCallback((details: Partial<Pick<BookingFormState,
    'client_name' | 'client_email' | 'client_phone' | 'home_address' | 'client_notes'
  >>) => {
    setState(s => ({ ...s, ...details }));
  }, []);

  // --- Submit booking ---
  const submitBooking = useCallback(async (): Promise<{ bookingId: string | null; checkoutUrl: string | null }> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id:     state.service?.id,
          specialist_id:  state.specialist?.id,
          centro_id:      state.centro?.id ?? null,
          location_type:  state.location_type,
          home_address:   state.home_address || null,
          starts_at:      state.time_slot?.slot_start,
          ends_at:        state.time_slot?.slot_end,
          client_name:    state.client_name,
          client_email:   state.client_email,
          client_phone:   state.client_phone || null,
          client_notes:   state.client_notes || null,
          price_eur:      state.service?.price_eur ?? null,
          deposit_eur:    state.service?.deposit_eur ?? null,
        }),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Error al crear la reserva');

      setState(s => ({ ...s, step: 'confirmation' }));
      return { bookingId: json.booking_id, checkoutUrl: json.checkout_url ?? null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(msg);
      return { bookingId: null, checkoutUrl: null };
    } finally {
      setLoading(false);
    }
  }, [state]);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    setError(null);
  }, []);

  // --- Validation per step ---
  const canProceed: Record<BookingStep, boolean> = {
    service:      !!state.service,
    specialist:   !!state.specialist,
    datetime:     !!state.date && !!state.time_slot,
    details:      !!state.client_name && !!state.client_email &&
                  (state.location_type === 'centro' || !!state.home_address),
    payment:      true,
    confirmation: true,
  };

  return {
    state,
    loading,
    error,
    currentStepIndex,
    steps: STEPS,
    canProceed,
    // Actions
    selectService,
    selectSpecialist,
    selectCentro,
    selectDate,
    selectSlot,
    updateClientDetails,
    submitBooking,
    goNext,
    goBack,
    goTo,
    reset,
  };
}
