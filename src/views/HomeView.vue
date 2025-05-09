<script setup>
import { ref, onMounted, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Papa from 'papaparse'

// --- Configuration ---
const PUBLIC_CSV_URL = import.meta.env.VITE_PUBLIC_CSV_URL;

// --- Types (Interface-like for clarity) ---
// interface CardData {
//   id: string;
//   title: string;
//   description: string;
//   rewardCoins: string;
//   rewardPowerUp: string;
//   type: 'Prokletí' | 'Úkol';
// }

// --- State ---
const allCardsMasterList = ref([]); // Stores the master list of cards from Sheets, with unique IDs.
const deckOrder = ref([]); // Array of card IDs representing the deck's current order.
const handCardIds = ref([]); // Array of card IDs currently in the player's hand.
const completedCardIds = ref([]); // Array of card IDs that have been completed.

const isLoading = ref(true);
const error = ref(null);

// --- LocalStorage Keys ---
const LS_ALL_CARDS_KEY = 'mhdRun_allCardsMasterList';
const LS_DECK_ORDER_KEY = 'mhdRun_deckOrder';
const LS_HAND_IDS_KEY = 'mhdRun_handCardIds';
const LS_COMPLETED_IDS_KEY = 'mhdRun_completedCardIds';

// --- Helper Functions ---
const generateUniqueId = () => `card_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

const getCardDetails = (cardId) => {
  return allCardsMasterList.value.find(card => card.id === cardId);
};

const loadCardsFromPublishedCSV = async () => {
  isLoading.value = true;
  error.value = null;

  if (!PUBLIC_CSV_URL) {
    error.value = 'Chyba: URL adresa publikovaného CSV souboru není nastavena. Zkontrolujte konstantu PUBLIC_CSV_URL v HomeView.vue.';
    isLoading.value = false;
    allCardsMasterList.value = [];
    deckOrder.value = [];
    return;
  }

  try {
    const response = await fetch(PUBLIC_CSV_URL);
    if (!response.ok) {
      throw new Error(`Nepodařilo se načíst CSV: ${response.status} ${response.statusText}. Zkontrolujte, zda je URL správná a list publikován.`);
    }
    const csvText = await response.text();

    // Use papaparse to parse the CSV text
    const parseResult = Papa.parse(csvText, {
      skipEmptyLines: true,
      // header: false, // Set to true if your CSV has a header row and you want to use it
      // If true, papaparse will return objects with keys from the header.
      // If false (or omitted and no header detected), it returns arrays.
      // We will skip the header manually if it exists, so we process rows as arrays.
    });

    if (parseResult.errors.length > 0) {
      console.error('Chyby při parsování CSV:', parseResult.errors);
      throw new Error(`Chyba při parsování CSV: ${parseResult.errors[0].message}`);
    }

    let dataRows = parseResult.data;

    if (dataRows.length === 0) {
      error.value = 'Nenalezena žádná data v CSV souboru.';
      allCardsMasterList.value = [];
      deckOrder.value = [];
      isLoading.value = false;
      return;
    }

    // Assuming the first line of your *published CSV* is headers, and we skip it.
    // If your published CSV *doesn't* include headers (e.g., you published a specific range like A2:E),
    // then you can remove this .slice(1)
    if (dataRows.length > 0 && Array.isArray(dataRows[0]) && dataRows[0].length > 0) { // Basic check if first row looks like a header
        // Heuristic: if the first row's first cell looks like a typical header name (e.g., "Title", "Název")
        // This is a simple check; for more robust header detection, you might need more logic
        // or rely on papaparse's `header: true` if your CSV always has headers.
        // For now, we'll assume if there's more than one row, the first is a header to skip.
        if (dataRows.length > 1) { // Only slice if there's more than one row (potential data beyond header)
            console.log("Assuming first row is a header, skipping:", dataRows[0]);
            dataRows = dataRows.slice(1);
        }
    }


    if (dataRows.length === 0) {
        error.value = 'Nenalezena žádná data po případné hlavičce v CSV souboru.';
        allCardsMasterList.value = [];
        deckOrder.value = [];
        isLoading.value = false;
        return;
    }

    const parsedCards = dataRows.map((columns) => {
      // columns is now an array of values for the row, correctly parsed by papaparse
      if (!Array.isArray(columns) || columns.length < 5) {
        console.warn('Přeskakuji řádek s nedostatečným počtem sloupců:', columns);
        return null; // Skip malformed rows
      }
      return {
        id: generateUniqueId(),
        title: columns[0] || 'Neznámý titul',
        description: columns[1] || 'Žádný popis',
        rewardCoins: columns[2] || '0',
        rewardPowerUp: columns[3] || '0',
        type: columns[4] === 'Prokletí' ? 'Prokletí' : 'Úkol',
      };
    }).filter(card => card !== null); // Remove any null entries from skipped rows

    if (parsedCards.length === 0) {
        error.value = 'Po parsování nebyly nalezeny žádné platné karty. Zkontrolujte formát CSV.';
        allCardsMasterList.value = [];
        deckOrder.value = [];
        isLoading.value = false;
        return;
    }

    allCardsMasterList.value = parsedCards;
    deckOrder.value = allCardsMasterList.value.map(card => card.id);
    handCardIds.value = [];
    completedCardIds.value = [];
    shuffleDeck();
  } catch (err) {
    console.error('Chyba při načítání karet z CSV:', err);
    error.value = `Nepodařilo se načíst karty: ${err.message}. Zkontrolujte konzoli pro detaily a ujistěte se, že CSV URL je správná a veřejně dostupná.`;
    allCardsMasterList.value = [];
    deckOrder.value = [];
  } finally {
    isLoading.value = false;
  }
};
const shuffleDeck = () => {
  // Puts all cards (from hand and completed too) back into the deck and shuffles
  const allIdsToShuffle = allCardsMasterList.value.map(card => card.id);

  // Fisher-Yates shuffle
  for (let i = allIdsToShuffle.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allIdsToShuffle[i], allIdsToShuffle[j]] = [allIdsToShuffle[j], allIdsToShuffle[i]];
  }
  deckOrder.value = allIdsToShuffle;
  handCardIds.value = []; // Clear hand on shuffle
  completedCardIds.value = []; // Clear completed on shuffle
  console.log('Deck shuffled. Cards in deck:', deckOrder.value.length);
  saveState();
};

const drawCard = () => {
  if (deckOrder.value.length > 0) {
    const cardIdToDraw = deckOrder.value.shift(); // Removes from top (start of array)
    handCardIds.value.push(cardIdToDraw);
    console.log('Card drawn. Hand size:', handCardIds.value.length, 'Deck size:', deckOrder.value.length);
    saveState();
  } else {
    console.log('Deck is empty!');
    // Optionally, notify user or auto-shuffle
  }
};

const completeCard = (cardId) => {
  const cardIndexInHand = handCardIds.value.indexOf(cardId);
  if (cardIndexInHand > -1) {
    const [cardToCompleteId] = handCardIds.value.splice(cardIndexInHand, 1);
    completedCardIds.value.push(cardToCompleteId);
    console.log('Card completed. Completed size:', completedCardIds.value.length);
    saveState();
  }
};

// --- Persistence ---
const saveState = () => {
  try {
    localStorage.setItem(LS_ALL_CARDS_KEY, JSON.stringify(allCardsMasterList.value));
    localStorage.setItem(LS_DECK_ORDER_KEY, JSON.stringify(deckOrder.value));
    localStorage.setItem(LS_HAND_IDS_KEY, JSON.stringify(handCardIds.value));
    localStorage.setItem(LS_COMPLETED_IDS_KEY, JSON.stringify(completedCardIds.value));
    console.log('State saved to LocalStorage.');
  } catch (e) {
    console.error('Failed to save state to LocalStorage:', e);
  }
};

const loadState = () => {
  try {
    const storedAllCards = localStorage.getItem(LS_ALL_CARDS_KEY);
    const storedDeckOrder = localStorage.getItem(LS_DECK_ORDER_KEY);
    const storedHandIds = localStorage.getItem(LS_HAND_IDS_KEY);
    const storedCompletedIds = localStorage.getItem(LS_COMPLETED_IDS_KEY);

    if (storedAllCards && storedDeckOrder && storedHandIds && storedCompletedIds) {
      allCardsMasterList.value = JSON.parse(storedAllCards);
      deckOrder.value = JSON.parse(storedDeckOrder);
      handCardIds.value = JSON.parse(storedHandIds);
      completedCardIds.value = JSON.parse(storedCompletedIds);
      console.log('State loaded from LocalStorage.');
      // Ensure no undefined cards if master list changed somehow
      handCardIds.value = handCardIds.value.filter(id => getCardDetails(id));
      completedCardIds.value = completedCardIds.value.filter(id => getCardDetails(id));
      return true;
    }
  } catch (e) {
    console.error('Failed to load state from LocalStorage:', e);
    // Clear potentially corrupted storage
    localStorage.removeItem(LS_ALL_CARDS_KEY);
    localStorage.removeItem(LS_DECK_ORDER_KEY);
    localStorage.removeItem(LS_HAND_IDS_KEY);
    localStorage.removeItem(LS_COMPLETED_IDS_KEY);
  }
  return false;
};

// --- Lifecycle Hooks ---
onMounted(async () => {
  if (!loadState()) {
    console.log('No valid state in LocalStorage or error loading, fetching from Google Sheets...');
    await loadCardsFromPublishedCSV();
  } else {
    // If cards were loaded from local storage, we don't need to fetch from sheets
    isLoading.value = false;
  }
  // If after attempting to load from LS and Sheets, allCardsMasterList is empty, show error.
  if (allCardsMasterList.value.length === 0 && !isLoading.value && !error.value) {
      error.value = "No cards available. Check Google Sheet configuration or LocalStorage.";
  }
});

// --- Computed Properties for Display ---
const handCards = computed(() => handCardIds.value.map(getCardDetails).filter(Boolean));
const completedCards = computed(() => completedCardIds.value.map(getCardDetails).filter(Boolean));
const deckCardCount = computed(() => deckOrder.value.length);

</script>

<template>
  <div class="bg-white text-black p-4 w-screen flex flex-col " style="height: 100svh;">

    <div v-if="isLoading" class="text-slate-400 italic p-4 text-center w-full flex-1">Načítání karet...</div>
    <div v-if="error && !isLoading" class="text-slate-400 italic p-4 text-center w-full flex-1">
      <p class="font-semibold">Chyba při načítání karet:</p>
      <p class="text-sm">{{ error }}</p>
    </div>

    <div v-if="!isLoading && !error && allCardsMasterList.length === 0" class="text-slate-400 italic p-4 text-center w-full flex-1">
      Žádné karty nebyly nalezeny. Zkontrolujte prosím konfiguraci.
    </div>

    <div v-if="!isLoading && allCardsMasterList.length > 0" class="w-full h-full flex-1 overflow-y-auto">
      <div class="space-y-8">
        <!-- Hand Zone -->
        <section>
          <h2 class="text-2xl font-semibold mb-4 border-b-2 border-neutral-500">Ruka ({{ handCards.length }})</h2>
          <div v-if="handCards.length === 0" class="text-slate-400 italic p-4 text-center">V ruce nemáš žádné karty.</div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card v-for="card in handCards" :key="card.id" :class="[card.type === 'Prokletí' ? 'curse-glow' : '']">
              <CardHeader>
                <CardTitle class="uppercase text-base font-bold">{{ card.title }}</CardTitle>
                <CardDescription>{{ card.description }}</CardDescription>
                <div class="font-bold">
                  Odměna: {{ card.rewardCoins }} | {{ card.rewardPowerUp }}
                </div>
              </CardHeader>

              <CardFooter class="flex justify-end">
                <Button @click="completeCard(card.id)" variant="secondary" >Dokončit</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <!-- Completed Zone -->
        <section>
          <h2 class="text-2xl font-semibold mb-4 border-b-2 border-neutral-500">Dokončené ({{ completedCards.length }})</h2>
          <div v-if="completedCards.length === 0" class="text-slate-400 italic p-4 text-center">Zatím nemáš žádné dokončené karty.</div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card v-for="card in completedCards" :key="card.id" :class="[card.type === 'Prokletí' ? 'curse-glow' : '']">
              <CardHeader>
                <CardTitle class="uppercase text-base font-bold">{{ card.title }}</CardTitle>
                <CardDescription>{{ card.description }}</CardDescription>
                <div class="font-bold">
                  Odměna: {{ card.rewardCoins }} | {{ card.rewardPowerUp }}
                </div>
              </CardHeader>

              <CardFooter class="flex justify-end">
                <Button @click="completeCard(card.id)" variant="secondary" disabled >Dokončit</Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </div>
    </div>

    <div class="bg-white p-2 pb-4 flex flex-col gap-2 z-10">
      <Button @click="drawCard" :disabled="deckCardCount === 0">
        Líznout kartu ({{ deckCardCount }})
      </Button>
      <div class="grid grid-cols-2 gap-2">
        <Button @click="shuffleDeck" variant="outline" >
          Zamíchat balíček
        </Button>
        <Button @click="loadCardsFromPublishedCSV" variant="outline" >
          Fetch data
        </Button>
      </div>
    </div>
  </div>
</template>