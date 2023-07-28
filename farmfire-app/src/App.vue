<script>
import { RouterView } from 'vue-router'
import HeaderComponent from './components/HeaderComponent.vue'
import FooterComponent from './components/FooterComponent.vue'

export default {
  components: {
    RouterView,
    HeaderComponent,
    FooterComponent
  },
  data() {
    return {
      isDark: false,
      session: '',
      mainServer: 'http://localhost:3000',
      warning: true
    }
  },
  methods: {
    onThemeChange(newValue) {
      this.isDark = newValue;
    },
    onUpdateSession(newSession) {
      this.session = newSession
    },
    warningClose() {
      this.warning = !this.warning;
    }
  }
}
</script>

<template>
  <div :class="{
    'darkTheme': isDark,
    'lightTheme': !isDark
  }" class="">
    <header-component :isDark="isDark" @update-value="onThemeChange" @update-session="onUpdateSession"></header-component>
    <router-view :session="session" :mainServer="mainServer" :warning="warning" @warning-close="warningClose" class="longerComponent"></router-view>
    <footer-component :mainServer="mainServer"></footer-component>
  </div>
</template>

<style>
.longerComponent {
  min-height: 100vh;
}
</style>
