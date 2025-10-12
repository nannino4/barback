import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/features/auth/ProtectedRoute'
import { AuthRouter } from '@/components/features/auth/AuthRouter'
import { HomePage } from '@/pages/HomePage'
import { LandingPage } from '@/pages/LandingPage'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

function AppContent()
{
  return (
    <>
      <Routes>
        {/* AppLayout wraps ALL routes with consistent Navigation */}
        <Route element={<AppLayout />}>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Protected Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          
          {/* Auth routes - now also use AppLayout for consistent navigation */}
          <Route path="/auth/*" element={<AuthRouter />} />
        </Route>
      </Routes>
            
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'bg-card border border-border text-card-foreground font-body',
          duration: 4000,
        }}
      />
    </>
  );
}

function App()
{
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
