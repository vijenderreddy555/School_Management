import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import StudentDirectoryPage from './pages/StudentDirectoryPage';
import AdmissionFormPage from './pages/AdmissionFormPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <PrimeReactProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <Layout>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route
                    path="/students"
                    element={
                      <ProtectedRoute>
                        <StudentDirectoryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/students/new"
                    element={
                      <ProtectedRoute>
                        <AdmissionFormPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/students" replace />} />
                </Routes>
              </Layout>
            </AuthProvider>
          </BrowserRouter>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </PrimeReactProvider>
    </ErrorBoundary>
  );
}

export default App;

