import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Page Imports
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import UserList from './pages/UserList.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Production from './pages/Production.jsx';
import QC from './pages/QC.jsx';
import Materials from './pages/Materials.jsx';
import Inventory from './pages/Inventory.jsx';
import AIChat from './pages/AIChat.jsx';
import Intelligence from './pages/Intelligence.jsx';
import Maintenance from './pages/Maintenance.jsx';
import Dispatch from './pages/Dispatch.jsx';

/* ============================
   ROLE NORMALIZATION
   ============================ */
const normalizeRole = (role) => {
  if (!role) return 'Operator';
  return role
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

/* ============================
   AUTH GUARD
   ============================ */
const PrivateRoute = ({ children }) => {
  const auth = localStorage.getItem('isAuthenticated');
  return auth === 'true' ? children : <Navigate to="/" replace />;
};

/* ============================
   ROLE GUARD
   ============================ */
const RoleRoute = ({ children, allowedRoles }) => {
  const auth = localStorage.getItem('isAuthenticated');
  const rawRole = localStorage.getItem('userRole');

  if (auth !== 'true') return <Navigate to="/" replace />;

  const userRole = normalizeRole(rawRole);
  const hasAccess = allowedRoles.some(
    (role) => role.toLowerCase() === userRole.toLowerCase()
  );

  if (!hasAccess) {
    console.warn(`Access Denied: Role "${userRole}" lacks permissions.`);
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/* ============================
   APP ROUTES
   ============================ */
function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<Login />} />

        {/* Universal Private Routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        
        {/* SECURE OPERATIONS ROUTES (Updated with RoleRoute) */}
        <Route 
          path="/ai" 
          element={
            <RoleRoute allowedRoles={['Admin', 'Plant Manager', 'Supervisor', 'Operator']}>
              <AIChat />
            </RoleRoute>
          } 
        />
        
        <Route 
          path="/inventory" 
          element={
            <RoleRoute allowedRoles={['Admin', 'Plant Manager', 'Supervisor', 'Operator']}>
              <Inventory />
            </RoleRoute>
          } 
        />
        
        <Route 
          path="/dispatch" 
          element={
            <RoleRoute allowedRoles={['Admin', 'Plant Manager', 'Logistics']}>
              <Dispatch />
            </RoleRoute>
          } 
        />

        {/* Admin Specific (Personnel Management) */}
        <Route 
          path="/register" 
          element={
            <RoleRoute allowedRoles={['Admin']}>
              <Register />
            </RoleRoute>
          } 
        />
        <Route 
          path="/users" 
          element={
            <RoleRoute allowedRoles={['Admin']}>
              <UserList />
            </RoleRoute>
          } 
        />

        {/* Management & Operations */}
        <Route 
          path="/intelligence" 
          element={
            <RoleRoute allowedRoles={['Admin', 'Plant Manager']}>
              <Intelligence />
            </RoleRoute>
          } 
        />
        
        <Route 
          path="/materials" 
          element={
            <RoleRoute allowedRoles={['Admin', 'Plant Manager', 'Supervisor']}>
              <Materials />
            </RoleRoute>
          } 
        />
        
        <Route 
          path="/maintenance" 
          element={
            <RoleRoute allowedRoles={['Admin', 'Plant Manager', 'Supervisor']}>
              <Maintenance />
            </RoleRoute>
          } 
        />
        
        <Route 
          path="/production" 
          element={
            <RoleRoute allowedRoles={['Admin', 'Plant Manager', 'Supervisor', 'Operator']}>
              <Production />
            </RoleRoute>
          } 
        />
        
        <Route 
          path="/qc" 
          element={
            <RoleRoute allowedRoles={['Admin', 'Plant Manager', 'QC Incharge', 'Operator']}>
              <QC />
            </RoleRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;