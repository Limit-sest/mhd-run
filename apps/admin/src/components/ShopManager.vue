<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Pencil, Plus, Trash2 } from 'lucide-vue-next';

import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import type { AdminShopItem, ShopForm } from '@/types';

const selectClass =
  'border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';

const items = ref<AdminShopItem[]>([]);
const loading = ref(true);
const dialogOpen = ref(false);
const editingId = ref<number | null>(null);
const saving = ref(false);
const error = ref('');

function emptyForm(): ShopForm {
  return {
    titleCs: '',
    titleEn: '',
    descriptionCs: '',
    descriptionEn: '',
    price: 0,
    type: 'transit',
    currency: 'coin',
    icon: '',
    shareDescriptionCs: '',
    shareDescriptionEn: '',
    timerMinutes: null,
  };
}

const form = reactive<ShopForm>(emptyForm());

async function load() {
  loading.value = true;
  items.value = (await trpc.admin.shop.list.query()) as AdminShopItem[];
  loading.value = false;
}

function openCreate() {
  Object.assign(form, emptyForm());
  editingId.value = null;
  error.value = '';
  dialogOpen.value = true;
}

function openEdit(row: AdminShopItem) {
  Object.assign(form, {
    titleCs: row.titleCs,
    titleEn: row.titleEn ?? '',
    descriptionCs: row.descriptionCs ?? '',
    descriptionEn: row.descriptionEn ?? '',
    price: row.price,
    type: row.type,
    currency: row.currency,
    icon: row.icon,
    shareDescriptionCs: row.shareDescriptionCs ?? '',
    shareDescriptionEn: row.shareDescriptionEn ?? '',
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
    price: Number(form.price) || 0,
    type: form.type,
    currency: form.currency,
    icon: form.icon.trim(),
    shareDescriptionCs: nullable(form.shareDescriptionCs),
    shareDescriptionEn: nullable(form.shareDescriptionEn),
    timerMinutes:
      form.timerMinutes === null || Number.isNaN(Number(form.timerMinutes))
        ? null
        : Number(form.timerMinutes),
  };
  try {
    if (editingId.value === null) {
      await trpc.admin.shop.create.mutate(payload);
    } else {
      await trpc.admin.shop.update.mutate({ id: editingId.value, ...payload });
    }
    dialogOpen.value = false;
    await load();
  } catch (e) {
    error.value = 'Save failed.';
  } finally {
    saving.value = false;
  }
}

async function remove(row: AdminShopItem) {
  if (!confirm(`Delete "${row.titleCs}"?`)) return;
  await trpc.admin.shop.delete.mutate({ id: row.id });
  await load();
}

onMounted(load);
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <p class="text-muted-foreground text-sm">{{ items.length }} shop items</p>
      <Button size="sm" @click="openCreate">
        <Plus /> Add item
      </Button>
    </div>

    <div class="overflow-x-auto rounded-lg border">
      <table class="w-full text-sm">
        <thead class="bg-muted/50 text-muted-foreground">
          <tr class="text-left">
            <th class="px-3 py-2 font-medium">ID</th>
            <th class="px-3 py-2 font-medium">Title (CS)</th>
            <th class="px-3 py-2 font-medium">Type</th>
            <th class="px-3 py-2 font-medium text-right">Price</th>
            <th class="px-3 py-2 font-medium">Currency</th>
            <th class="px-3 py-2 font-medium text-right">Timer</th>
            <th class="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="text-muted-foreground px-3 py-6 text-center">Loading…</td>
          </tr>
          <tr v-else-if="!items.length">
            <td colspan="7" class="text-muted-foreground px-3 py-6 text-center">No items yet.</td>
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
            <td class="px-3 py-2 align-top">{{ row.type }}</td>
            <td class="px-3 py-2 text-right align-top">{{ row.price }}</td>
            <td class="px-3 py-2 align-top">{{ row.currency }}</td>
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
      :title="editingId === null ? 'Add shop item' : 'Edit shop item'"
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
              <option value="transit">transit</option>
              <option value="powerup">powerup</option>
            </select>
          </div>
          <div class="flex flex-col gap-2">
            <Label>Currency</Label>
            <select v-model="form.currency" :class="selectClass">
              <option value="coin">coin</option>
              <option value="gem">gem</option>
            </select>
          </div>
          <div class="flex flex-col gap-2">
            <Label>Price</Label>
            <Input v-model.number="form.price" type="number" />
          </div>
          <div class="flex flex-col gap-2">
            <Label>Timer (min)</Label>
            <Input v-model.number="form.timerMinutes" type="number" placeholder="—" />
          </div>
          <div class="col-span-2 flex flex-col gap-2">
            <Label>Icon (lucide name)</Label>
            <Input v-model="form.icon" placeholder="e.g. TramFront" />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <Label>Share description (CS)</Label>
          <Textarea v-model="form.shareDescriptionCs" />
        </div>
        <div class="flex flex-col gap-2">
          <Label>Share description (EN)</Label>
          <Textarea v-model="form.shareDescriptionEn" placeholder="Defaults to Czech" />
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
