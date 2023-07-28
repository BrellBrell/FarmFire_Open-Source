import { createRouter, createWebHistory } from 'vue-router'

import HomePage from './views/HomePage.vue'
import FireApp from './views/FireApp.vue'
import ChatApp from './views/ChatApp.vue'
import UserApp from './views/UserApp.vue'

export default createRouter({
    history: createWebHistory(),

    routes: [
        {
            name: 'home',
            path: '/',
            component: HomePage
        },
        {
            name: 'fire',
            path: '/fire',
            component: FireApp
        },
        {
            name: 'chat',
            path: '/chat',
            component: ChatApp
        },
        {
            name: 'user',
            path: '/user',
            component: UserApp
        }
    ]
});