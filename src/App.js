import { HashRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import { Provider } from 'react-redux';
import { store, persistor } from './app/store';
import ProtectedRoute from './components/ProtectedRoute';
import { Navigate } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import Dashboard from './pages/Dashboard';
import { SidebarProvider } from './context/SidebarContext';

function App() {
  return (
 <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SidebarProvider> 
          <HashRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </HashRouter>
        </SidebarProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;