import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import router from '@/router'
import '@/index.css'
import { AuthProvider } from '@/AuthContext';
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
   
      <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme-v2'>
          <AuthProvider>
            <RouterProvider router={router}/>
            <Toaster />
          </AuthProvider>
                
      </ThemeProvider>
      
  </React.StrictMode>
)
