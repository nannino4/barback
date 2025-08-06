import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/ThemeProvider'
import { MainLayout } from '@/components/layout/MainLayout'
import { ProtectedRoute } from '@/components/features/auth/ProtectedRoute'
import { HomePage } from '@/pages/HomePage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage'
import { GoogleCallbackPage } from '@/pages/auth/GoogleCallbackPage'
import { EmailVerificationHandler } from '@/pages/auth/EmailVerificationHandler'

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
                {/* Protected Home Route */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<HomePage />} />
                </Route>
                
                {/* Auth routes outside MainLayout */}
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
                <Route path="/auth/verify-email/:token" element={<EmailVerificationHandler />} />
                <Route path="/auth/oauth/google/callback" element={<GoogleCallbackPage />} />
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
