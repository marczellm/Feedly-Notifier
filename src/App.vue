<template>
  <Settings>
  </Settings>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

import Settings from "./components/Settings.vue";

@Component({
  components: {
    'Settings': Settings
  }
})
export default class App extends Vue {
}
</script>

<style lang="scss">
  @import "~vue-material/dist/theme/engine"; // Import the theme engine

  @include md-register-theme("default", (
    primary: #388E3C, // #2bb24c, // The primary color of your application
    accent: #2bb24c // The accent or secondary color
  ));

  @import "~vue-material/dist/theme/all"; // Apply the theme

  body {
    font-size: 13px;
    background-color: #f1f1f1;

    letter-spacing: 0;
  }

  .md-toolbar {
    min-height: 56px;
  }

  .md-switch .md-switch-container {
    width: 32px;
    min-width: 32px;
    
    height: 12px;
  }

  .md-switch .md-switch-thumb {
    width: 16px;
    height: 16px;
  }

  .md-switch .md-switch-thumb .md-ripple {
    width: 40px!important;
    height: 40px!important;
  }

  .md-checkbox .md-checkbox-container {
    width: 16px;
    min-width: 16px;
    height: 16px;
  }

  .md-checkbox .md-checkbox-container:after {
    top: -2px;
    left: 3px;
  }

  .md-checkbox .md-checkbox-container .md-ripple {
    width: 40px!important;
    height: 40px!important;
  }

  .md-list-item-container {
    font-size: 13px; 
  }

  .md-app {
    min-height: 100vh;
    max-height: 100vh;
  }

  .md-app .md-app-content.md-content.md-theme-default {
    background-color: transparent;
    padding: 0px;
  }

  .md-app:not(.md-overlap).md-theme-default {
    background-color: transparent;
  }
</style>