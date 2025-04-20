import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ViewResults from '../views/ViewResults.vue'
import Documents from '../views/Documents.vue'
import DocumentView from '../views/DocumentView.vue'
import Statistics from '../views/Statistics.vue'
import PlagiarismCheck from '../views/PlagiarismCheck.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Setting from '../views/Setting.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/view-results', name: 'ViewResults', component: ViewResults },
  { path: '/documents', name: 'Documents', component: Documents },
  { path: '/documents/:id', name: 'DocumentView', component: DocumentView },
  { path: '/statistics', name: 'Statistics', component: Statistics },
  { path: '/plagiarism-check', name: 'PlagiarismCheck', component: PlagiarismCheck },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/settings', name: 'Settings', component: Setting },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
