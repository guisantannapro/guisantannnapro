import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import MinhaArea from "./pages/MinhaArea";
import Protocolo from "./pages/Protocolo";
import Dashboard from "./pages/Dashboard";
import AuthGuard from "./components/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/area-do-cliente" 
            element={
              <AuthGuard>
                <MinhaArea />
              </AuthGuard>
            } 
          />
          <Route 
            path="/protocolo/:id" 
            element={
              <AuthGuard>
                <Protocolo />
              </AuthGuard>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <AuthGuard adminOnly>
                <Dashboard />
              </AuthGuard>
            } 
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
