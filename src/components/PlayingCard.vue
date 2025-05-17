<script setup>
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { defineProps } from 'vue';
import { Button } from '@/components/ui/button'


const props = defineProps({
    card: {
        type: Object,
        required: true
    },
    disabled: {
        type: Boolean,
        default: false
    }
})

</script>

<template>
    <Card :class="[card.type === 'Prokletí' ? 'curse-glow' : '']">
        <CardHeader>
            <CardTitle class="uppercase text-base font-bold">{{ card.title }}</CardTitle>
            <CardDescription>{{ card.description }}</CardDescription>
            <div class="font-bold tabular-nums">
                Odměna: {{ card.rewardCoins }} {{ card.rewardPowerUp }}
            </div>
        </CardHeader>
        <CardFooter class="flex justify-end">
            <Button @click="completeCard(card.id)" variant="secondary" :disabled="disabled" >Dokončit</Button>
        </CardFooter>
    </Card>
</template>