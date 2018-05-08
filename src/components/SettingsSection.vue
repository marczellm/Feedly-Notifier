<template>
    <div class="fn-settings-section">
        <h2 class="fn-settings-section-title">{{title}}</h2>
        <md-content class="md-elevation-3 fn-settings-section-content">
            <slot></slot>
        </md-content>
    </div>
    
</template>

<script lang="ts">
import Vue from "vue";
import {
    Component,
    Prop
 } from "vue-property-decorator";

@Component
export default class SettingsSection extends Vue {
    
    @Prop({
        type: String
    })
    title: string | undefined
}
</script>

<style scoped>
    .fn-settings-section {
        margin: 0 3px;
    }

    .fn-settings-section-title {
        font-size: 100%;
        font-weight: 500;

        color: #616161;

        margin: 21px 0 12px;
    }

    .fn-settings-section-content {
        border-radius: 2px;
    }
</style>