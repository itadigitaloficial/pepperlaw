import { FC } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { ContractForm } from './components/ContractForm';
import { ContractEditor } from './pages/ContractEditor';

const queryClient = new QueryClient();

const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div data-testid="app-container" className="min-h-screen bg-gray-100">
          <header className="bg-blue-600 text-white p-4">
            <h1 className="text-2xl font-bold">Legal Contract System</h1>
          </header>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/contracts/new" element={<ContractForm />} />
            <Route path="/contracts/editor" element={<ContractEditor />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;