import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Layout from './components/layout/Layout';
import CreateTripPage from './pages/CreateTripPage';
import BudgetPlannerPage from './pages/BudgetPlannerPage';
import ProfilePage from './pages/ProfilePage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<CreateTripPage />} />
            <Route path="create-trip" element={<CreateTripPage />} />
            <Route path="budget-planner" element={<BudgetPlannerPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;