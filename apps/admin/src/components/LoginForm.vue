<script setup lang="ts">
import { ref } from 'vue';
import { LockKeyhole } from 'lucide-vue-next';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/composables/useAuth';
import { trpc } from '@/lib/trpc';

const { setToken } = useAuth();

const password = ref('');
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    const { token } = await trpc.admin.login.mutate({ password: password.value });
    setToken(token);
  } catch (e) {
    error.value = 'Incorrect password.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <Card class="w-full max-w-sm">
      <CardHeader class="text-center">
        <div class="bg-muted mx-auto mb-2 flex size-10 items-center justify-center rounded-full">
          <LockKeyhole class="size-5" />
        </div>
        <CardTitle>MHD Run — Admin</CardTitle>
        <CardDescription>Enter the admin password to manage content.</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="flex flex-col gap-4" @submit.prevent="submit">
          <div class="flex flex-col gap-2">
            <Label for="password">Password</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              autofocus
            />
          </div>
          <p v-if="error" class="text-destructive text-sm">{{ error }}</p>
          <Button type="submit" :disabled="loading || !password">
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
