import { defineStore } from 'pinia';
import { getDistance } from '../utils';
import type { Location } from '@mhd/shared';
import { useGameSettingsStore } from './settings';

export const useLocationsStore = defineStore('locations', {
  state: () => ({
    currentLocation: undefined as Location | undefined,
    radiusSetting: { min: 4.5, max: 6 } as { min: number; max: number },
    allLocations: [] as Location[],
    latestGps: undefined as GeolocationPosition | undefined,
  }),
  actions: {
    drawLocation(gpsLat: number, gpsLon: number) {
      const gameSettings = useGameSettingsStore();
      const radiusMultiplier = gameSettings.radiusAffectedByMultiplier ? gameSettings.multiplier : 1;
      const minRadius = this.radiusSetting.min * radiusMultiplier;
      const maxRadius = this.radiusSetting.max * radiusMultiplier;

      const validLocations: Location[] = this.allLocations.filter(
        (location: Location) => {
          const distance = getDistance(
            gpsLat,
            gpsLon,
            location.latitude,
            location.longitude
          );
          return (
            distance >= minRadius &&
            distance <= maxRadius
          );
        }
      );

      if (validLocations.length > 0) {
        // If we found locations within the radius, pick one randomly
        this.currentLocation =
          validLocations[Math.floor(Math.random() * validLocations.length)];
      } else {
        // Fallback: find the location closest to the radius boundaries
        if (this.allLocations.length > 0) {
          let bestLocation = this.allLocations[0];
          let bestDistance = getDistance(
            gpsLat,
            gpsLon,
            bestLocation.latitude,
            bestLocation.longitude
          );
          let bestDistanceFromBoundary = Math.min(
            Math.abs(bestDistance - minRadius),
            Math.abs(bestDistance - maxRadius)
          );

          for (const location of this.allLocations) {
            const distance = getDistance(
              gpsLat,
              gpsLon,
              location.latitude,
              location.longitude
            );

            const distanceFromMinBoundary = Math.abs(
              distance - minRadius
            );
            const distanceFromMaxBoundary = Math.abs(
              distance - maxRadius
            );
            const distanceFromBoundary = Math.min(
              distanceFromMinBoundary,
              distanceFromMaxBoundary
            );

            if (distanceFromBoundary < bestDistanceFromBoundary) {
              bestDistanceFromBoundary = distanceFromBoundary;
              bestLocation = location;
            }
          }

          this.currentLocation = bestLocation;
        } else {
          this.currentLocation = undefined;
        }
      }
    },
    setAllLocations(locations: Location[]) {
      this.allLocations = locations;
    },
    resetLocation() {
      this.currentLocation = undefined;
    },
    setRadiusSetting(min: number, max: number) {
      this.radiusSetting = { min, max };
    },
    setLatestGps(gps: GeolocationPosition) {
      this.latestGps = gps;
    },
  },
  persist: {
    pick: ['radiusSetting', 'allLocations'],
  },
});
