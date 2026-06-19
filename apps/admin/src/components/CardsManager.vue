<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Pencil, Plus, Trash2 } from 'lucide-vue-next';

import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import type { AdminCard, CardForm } from '@/types';

const selectClass =
  'border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';

const items = ref<AdminCard[]>([]);
const loading = ref(true);
const dialogOpen = ref(false);
const editingId = ref<number | null>(null);
const saving = ref(false);
const error = ref('');

function emptyForm(): CardForm {
  return {
    titleCs: '',
    titleEn: '',
    descriptionCs: '',
    descriptionEn: '',
    rewardCoins: 0,
    rewardGems: 0,
    type: 'task',
    timerMinutes: null,
  };
}

const form = reactive<CardForm>(emptyForm());

async function load() {
  loading.value = true;
  items.value = (await trpc.admin.cards.list.query()) as AdminCard[];
  loading.value = false;
}

function openCreate() {
  Object.assign(form, emptyForm());
  editingId.value = null;
  error.value = '';
  dialogOpen.value = true;
}

function openEdit(row: AdminCard) {
  Object.assign(form, {
    titleCs: row.titleCs,
    titleEn: row.titleEn ?? '',
    descriptionCs: row.descriptionCs ?? '',
    descriptionEn: row.descriptionEn ?? '',
    rewardCoins: row.rewardCoins,
    rewardGems: row.rewardGems,
    type: row.type,
    timerMinutes: row.timerMinutes,
  });
  editingId.value = row.id;
  error.value = '';
  dialogOpen.value = true;
}

function nullable(value: string | null): string | null {
  const v = (value ?? '').trim();
  return v.length ? v : null;
}

async function save() {
  error.value = '';
  if (!form.titleCs.trim()) {
    error.value = 'Czech title is required.';
    return;
  }
  saving.value = true;
  const payload = {
    titleCs: form.titleCs.trim(),
    titleEn: form.titleEn.trim(),
    descriptionCs: nullable(form.descriptionCs),
    descriptionEn: nullable(form.descriptionEn),
    rewardCoins: Number(form.rewardCoins) || 0,
    rewardGems: Number(form.rewardGems) || 0,
    type: form.type,
    timerMinutes:
      form.timerMinutes === null || Number.isNaN(Number(form.timerMinutes))
        ? null
        : Number(form.timerMinutes),
  };
  try {
    if (editingId.value === null) {
      await trpc.admin.cards.create.mutate(payload);
    } else {
      await trpc.admin.cards.update.mutate({ id: editingId.value, ...payload });
    }
    dialogOpen.value = false;
    await load();
  } catch (e) {
    error.value = 'Save failed.';
  } finally {
    saving.value = false;
  }
}

async function remove(row: AdminCard) {
  if (!confirm(`Delete "${row.titleCs}"?`)) return;
  await trpc.admin.cards.delete.mutate({ id: row.id });
  await load();
}

onMounted(load);
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <p class="text-muted-foreground text-sm">
        {{ items.length }} cards &amp; curses
      </p>
      <Button size="sm" @click="openCreate">
        <Plus /> Add card
      </Button>
    </div>

    <div class="overflow-x-auto rounded-lg border">
      <table class="w-full text-sm">
        <thead class="bg-muted/50 text-muted-foreground">
          <tr class="text-left">
            <th class="px-3 py-2 font-medium">ID</th>
            <th class="px-3 py-2 font-medium">Title (CS)</th>
            <th class="px-3 py-2 font-medium">Type</th>
            <th class="px-3 py-2 font-medium text-right">Coins</th>
            <th class="px-3 py-2 font-medium text-right">Gems</th>
            <th class="px-3 py-2 font-medium text-right">Timer</th>
            <th class="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="text-muted-foreground px-3 py-6 text-center">Loading…</td>
          </tr>
          <tr v-else-if="!items.length">
            <td colspan="7" class="text-muted-foreground px-3 py-6 text-center">No cards yet.</td>
          </tr>
          <tr v-for="row in items" :key="row.id" class="border-t">
            <td class="text-muted-foreground px-3 py-2 align-top">{{ row.id }}</td>
            <td class="max-w-xs px-3 py-2 align-top">
              <div class="font-medium">{{ row.titleCs }}</div>
              <p
                v-if="row.descriptionCs"
                class="text-muted-foreground line-clamp-2 text-xs"
              >
                {{ row.descriptionCs }}
              </p>
            </td>
            <td class="px-3 py-2 align-top">
              <span
                class="rounded-full px-2 py-0.5 text-xs"
                :class="row.type === 'curse' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'"
              >
                {{ row.type }}
              </span>
            </td>
            <td class="px-3 py-2 text-right align-top">{{ row.rewardCoins }}</td>
            <td class="px-3 py-2 text-right align-top">{{ row.rewardGems }}</td>
            <td class="px-3 py-2 text-right align-top">{{ row.timerMinutes ?? '—' }}</td>
            <td class="px-3 py-2 align-top">
              <div class="flex justify-end gap-1">
                <Button size="icon" variant="ghost" @click="openEdit(row)"><Pencil /></Button>
                <Button size="icon" variant="ghost" @click="remove(row)">
                  <Trash2 class="text-destructive" />
                </Button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Dialog
      v-model:open="dialogOpen"
      :title="editingId === null ? 'Add card' : 'Edit card'"
    >
      <form class="flex flex-col gap-4" @submit.prevent="save">
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-2">
            <Label>Title (CS)</Label>
            <Input v-model="form.titleCs" />
          </div>
          <div class="flex flex-col gap-2">
            <Label>Title (EN)</Label>
            <Input v-model="form.titleEn" placeholder="Defaults to Czech" />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <Label>Description (CS)</Label>
          <Textarea v-model="form.descriptionCs" />
        </div>
        <div class="flex flex-col gap-2">
          <Label>Description (EN)</Label>
          <Textarea v-model="form.descriptionEn" placeholder="Defaults to Czech" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-2">
            <Label>Type</Label>
            <select v-model="form.type" :class="selectClass">
              <option value="task">task</option>
              <option value="curse">curse</option>
            </select>
          </div>
          <div class="flex flex-col gap-2">
            <Label>Timer (min)</Label>
            <Input v-model.number="form.timerMinutes" type="number" placeholder="—" />
          </div>
          <div class="flex flex-col gap-2">
            <Label>Reward coins</Label>
            <Input v-model.number="form.rewardCoins" type="number" />
          </div>
          <div class="flex flex-col gap-2">
            <Label>Reward gems</Label>
            <Input v-model.number="form.rewardGems" type="number" />
          </div>
        </div>
        <p v-if="error" class="text-destructive text-sm">{{ error }}</p>
        <div class="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" @click="dialogOpen = false">Cancel</Button>
          <Button type="submit" :disabled="saving">{{ saving ? 'Saving…' : 'Save' }}</Button>
        </div>
      </form>
    </Dialog>
  </div>
</template>
