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
import { DocumentList } from './components/documents/DocumentList';
import { TemplateLibrary } from './components/templates/TemplateLibrary';
import { TemplateFill } from './components/templates/TemplateFill';
import { Navbar } from './components/layout/Navbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthProvider>
            <div data-testid="app-container" className="min-h-screen bg-gray-100">
              <Navbar />
              <div className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<ProtectedRoute><DocumentList /></ProtectedRoute>} />
                  <Route path="/editor/:id" element={<ProtectedRoute><PDFEditorPage /></ProtectedRoute>} />
                  <Route path="/templates" element={<ProtectedRoute><TemplateLibrary /></ProtectedRoute>} />
                  <Route path="/template/:id/fill" element={<ProtectedRoute><TemplateFill /></ProtectedRoute>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                </Routes>
              </div>
            </div>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;