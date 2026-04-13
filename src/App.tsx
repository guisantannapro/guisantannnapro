import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

// Lazy-loaded routes for faster initial load
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess.tsx"));
const Formulario = lazy(() => import("./pages/Formulario.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const MinhaArea = lazy(() => import("./pages/MinhaArea.tsx"));
const Protocolo = lazy(() => import("./pages/Protocolo.tsx"));
const CheckoutUSD = lazy(() => import("./pages/CheckoutUSD.tsx"));

// Minimal fallback while lazy chunks load
const LazyFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LazyFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/checkout-usd" element={<CheckoutUSD />} />
            <Route path="/pagamento-sucesso" element={<PaymentSuccess />} />
            <Route path="/formulario" element={<Formulario />} />
            <Route path="/login" element={<Login />} />
            <Route path="/area-do-cliente" element={<MinhaArea />} />
            <Route path="/protocolo/:id" element={<Protocolo />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
