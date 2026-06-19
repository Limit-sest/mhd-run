<script setup lang="ts">
import { onMounted } from 'vue';
import { LogOut } from 'lucide-vue-next';

import CardsManager from '@/components/CardsManager.vue';
import LoginForm from '@/components/LoginForm.vue';
import ShopManager from '@/components/ShopManager.vue';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/composables/useAuth';
import { isUnauthorized, trpc } from '@/lib/trpc';

const { isAuthed, clearToken } = useAuth();

// If a stored token is stale (e.g. password changed), drop it on load.
onMounted(async () => {
  if (!isAuthed.value) return;
  try {
    await trpc.admin.session.query();
  } catch (e) {
    if (isUnauthorized(e)) clearToken();
  }
});
</script>

<template>
  <LoginForm v-if="!isAuthed" />

  <div v-else class="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 p-4 md:p-8">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">MHD Run — Admin</h1>
        <p class="text-muted-foreground text-sm">Content management</p>
      </div>
      <Button variant="outline" size="sm" @click="clearToken">
        <LogOut /> Sign out
      </Button>
    </header>

    <Tabs default-value="cards">
      <TabsList>
        <TabsTrigger value="cards">Cards &amp; curses</TabsTrigger>
        <TabsTrigger value="shop">Shop</TabsTrigger>
      </TabsList>
      <TabsContent value="cards" class="pt-4">
        <CardsManager />
      </TabsContent>
      <TabsContent value="shop" class="pt-4">
        <ShopManager />
      </TabsContent>
    </Tabs>
  </div>
</template>
