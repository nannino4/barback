import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/ThemeProvider'
import { MainLayout } from '@/components/layout/MainLayout'
import { HomePage } from '@/pages/HomePage'
import { RegisterPage } from '@/pages/auth/RegisterPage'

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
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                </Route>
                {/* Auth routes outside MainLayout */}
                <Route path="/register" element={<RegisterPage />} />
                {/* Dashboard routes will be added here */}
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
