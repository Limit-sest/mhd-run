<script setup lang="ts">
  import { Button } from '@/components/ui/button';
  import { useLocationsStore } from '@/stores';
  import { getCurrentLocation } from '@/utils';
  import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardTitle,
    CardHeader,
  } from '@/components/ui/card';
  import { ExternalLink } from 'lucide-vue-next';
  import { getDistance } from '@/utils';

  const locationsStore = useLocationsStore();

  async function getNewLocation() {
    const gps = await getCurrentLocation();
    locationsStore.setLatestGps(gps);
    locationsStore.drawLocation(gps.coords.latitude, gps.coords.longitude);
  }
</script>
<template>
  <div class="flex flex-col gap-3 m-4">
    <span
      v-if="locationsStore.currentLocation === undefined"
      class="text-slate-600 italic text-center py-4"
      >{{ $t('goal.no-goal') }}</span
    >
    <Card v-else>
      <CardHeader>
        <CardTitle>{{ locationsStore.currentLocation.title }}</CardTitle>
        <CardDescription>{{
          locationsStore.currentLocation.description
        }}</CardDescription>
      </CardHeader>
      <CardContent>
        <CardDescription
          >{{
            $t('goal.distance', {
              distance: getDistance(
                locationsStore.latestGps.coords.latitude,
                locationsStore.latestGps.coords.longitude,
                locationsStore.currentLocation.latitude,
                locationsStore.currentLocation.longitude
              ).toFixed(2),
            })
          }}
        </CardDescription>
      </CardContent>
      <CardFooter>
        <Button class="w-full" as-child>
          <a :href="locationsStore.currentLocation?.url" target="_blank"
            ><ExternalLink class="w-4 h-4 mr-2" /> {{ $t('goal.open') }}</a
          >
        </Button>
      </CardFooter>
    </Card>
    <div class="mt-auto">
      <Button
        @click="getNewLocation"
        class="w-full"
        :disabled="locationsStore.allLocations.length === 0"
      >
        {{ $t('goal.draw') }}
      </Button>
    </div>
  </div>
</template>
