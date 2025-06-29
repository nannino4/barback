import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/ThemeProvider'
import { MainLayout } from '@/components/layout/MainLayout'
import { HomePage } from '@/pages/HomePage'

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
        },
    },
})

function App() 
{
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<MainLayout />}>
                            <Route index element={<HomePage />} />
                            {/* Auth routes will be added here */}
                            {/* Dashboard routes will be added here */}
                        </Route>
                    </Routes>
                </BrowserRouter>
                
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        className: 'bg-background-secondary border border-border text-text-primary',
                        duration: 4000,
                    }}
                />
            </ThemeProvider>
        </QueryClientProvider>
    )
}

export default App
