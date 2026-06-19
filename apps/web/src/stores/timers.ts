import { defineStore } from 'pinia';
import type { Timer } from '@mhd/shared';
import { dateSerializer } from './_serializers';
import { formatDuration } from '@mhd/shared';

export const useTimersStore = defineStore('timersStore', {
  state: () => ({
    veto: {} as Timer,
    powerups: [] as Timer[],
    currentTime: new Date().getTime(),
  }),
  getters: {
    vetoTimeRemaining: (state) => {
      if (!state.veto.start || !state.veto.end) return null;
      return formatDuration(state.veto.end.getTime() - state.currentTime);
    },
    vetoProgress: (state) => {
      if (!state.veto.start || !state.veto.end) return 0;

      const total = state.veto.end.getTime() - state.veto.start.getTime();
      const elapsed = state.currentTime - state.veto.start.getTime();

      if (elapsed < 0) return 0;
      if (elapsed >= total) return 100;

      return (elapsed / total) * 100;
    },
    isVetoActive: (state) => {
      if (!state.veto.start || !state.veto.end) return false;
      return state.currentTime < state.veto.end.getTime();
    },
    powerupTimeRemaining: (state) => (powerupId: number) => {
      const timer = state.powerups.find((t) => t.powerupId === powerupId);
      if (!timer || !timer.start || !timer.end) return null;
      return formatDuration(timer.end.getTime() - state.currentTime);
    },
    powerupProgress: (state) => (powerupId: number) => {
      const timer = state.powerups.find((t) => t.powerupId === powerupId);
      if (!timer || !timer.start || !timer.end) return 0;

      const total = timer.end.getTime() - timer.start.getTime();
      const elapsed = state.currentTime - timer.start.getTime();

      if (elapsed < 0) return 0;
      if (elapsed >= total) return 100;

      return (elapsed / total) * 100;
    },
    isPowerupActive: (state) => (powerupId: number) => {
      const timer = state.powerups.find((t) => t.powerupId === powerupId);
      if (!timer || !timer.start || !timer.end) return false;
      return state.currentTime < timer.end.getTime();
    },
    activePowerups: (state) => {
      return state.powerups.filter(
        (timer) =>
          timer.start && timer.end && state.currentTime < timer.end.getTime()
      );
    },
  },
  actions: {
    set(
      type: 'veto' | 'powerup',
      duration: number,
      powerupId: number | null = null
    ): void {
      switch (type) {
        case 'veto':
          this.veto.start = new Date();
          this.veto.end = new Date(
            this.veto.start.getTime() + duration * 60000
          );
          return;
        case 'powerup': {
          const timer = {} as Timer;
          timer.start = new Date();
          timer.end = new Date(timer.start.getTime() + duration * 60000);
          timer.powerupId = powerupId;
          this.powerups.push(timer);
          return;
        }
      }
    },
    updateCurrentTime() {
      this.currentTime = new Date().getTime();
      this.cleanupExpiredTimers();
    },
    cleanupExpiredTimers() {
      this.powerups = this.powerups.filter(
        (timer) => timer.end && this.currentTime < timer.end.getTime()
      );

      if (this.veto.end && this.currentTime >= this.veto.end.getTime()) {
        this.veto = {} as Timer;
      }
    },
    startTimerUpdates() {
      this.updateCurrentTime();
      setInterval(() => {
        this.updateCurrentTime();
      }, 1000);
    },
  },
  persist: {
    pick: ['veto', 'powerups'],
    serializer: dateSerializer,
  },
});
