import { FC } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { ContractEditor } from './pages/ContractEditor';
import { PDFEditorPage } from './pages/PDFEditorPage';

const queryClient = new QueryClient();

const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div data-testid="app-container" className="min-h-screen bg-gray-100">
            <header className="bg-blue-600 text-white p-4">
              <h1 className="text-2xl font-bold">Legal Contract System</h1>
            </header>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editor"
                element={
                  <ProtectedRoute>
                    <ContractEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pdf-editor"
                element={
                  <ProtectedRoute
                    requiredPermission={{ action: 'create', resource: 'documents' }}
                  >
                    <PDFEditorPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;