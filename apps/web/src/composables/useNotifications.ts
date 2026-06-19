import { watch, computed } from 'vue';
import {
  useTimersStore,
  useHandCardsStore,
  useAllCardsStore,
} from '@/stores';
import { completeCard } from '@/utils';
import { i18n } from '@/i18n';

const notifiedCardTimers = new Set<number>();
const notifiedVeto = { lastEnd: 0 };
const notifiedPowerups = new Set<string>();

function send(title: string, body?: string) {
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, {
      body,
      icon: '/pwa-192x192.png',
      tag: `${title}-${Date.now()}`,
    });
  } catch {
    // Notification constructor can fail on some mobile browsers
  }
}

export function requestNotificationPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export function useNotifications() {
  if (!('Notification' in window)) return;

  const timers = useTimersStore();
  const handCards = useHandCardsStore();
  const allCards = useAllCardsStore();

  // Watch card timers globally — catches expiry even if PlayingCard is unmounted
  const expiredCardIds = computed(() => {
    const now = timers.currentTime;
    return handCards.cards.filter((cardId) => {
      const card = allCards.getCardDetails(cardId);
      return card?.timerEnd && card.timerEnd.getTime() <= now;
    });
  });

  watch(expiredCardIds, (ids, oldIds) => {
    const oldSet = new Set(oldIds ?? []);
    for (const cardId of ids) {
      if (oldSet.has(cardId) || notifiedCardTimers.has(cardId)) continue;
      notifiedCardTimers.add(cardId);
      const card = allCards.getCardDetails(cardId);
      send(
        i18n.global.locale === 'cs' ? 'Časovač vypršel!' : 'Timer finished!',
        card?.title,
      );
      completeCard(cardId);
    }
  }, { immediate: true });

  // Watch veto timer expiry
  watch(
    () => timers.isVetoActive,
    (active, wasActive) => {
      if (wasActive && !active) {
        const endTime = notifiedVeto.lastEnd;
        const vetoEnd = timers.veto?.end?.getTime?.() ?? 0;
        if (vetoEnd !== 0 && vetoEnd === endTime) return;
        send(
          i18n.global.locale === 'cs' ? 'Veto skončilo!' : 'Veto ended!',
          i18n.global.locale === 'cs'
            ? 'Můžeš znovu líznout kartu.'
            : 'You can draw cards again.',
        );
      }
    },
  );

  watch(
    () => timers.veto?.end,
    (end) => {
      if (end) notifiedVeto.lastEnd = end.getTime();
    },
    { immediate: true },
  );

  // Watch powerup timer expiry
  watch(
    () => timers.activePowerups.map((p) => `${p.powerupId}-${p.end?.getTime()}`),
    (current, previous) => {
      if (!previous) return;
      const currentSet = new Set(current);
      for (const key of previous) {
        if (!currentSet.has(key) && !notifiedPowerups.has(key)) {
          notifiedPowerups.add(key);
          send(
            i18n.global.locale === 'cs'
              ? 'Powerup vypršel!'
              : 'Powerup expired!',
          );
        }
      }
    },
  );
}
