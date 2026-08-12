import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Roles from './pages/Roles';
import RoleDetail from './pages/RoleDetail';
import Permissions from './pages/Permissions';
import PermissionDetail from './pages/PermissionDetail';
import Profile from './pages/Profile';

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserDetail />} />

          <Route path="/roles" element={<Roles />} />
          <Route path="/roles/:id" element={<RoleDetail />} />

          <Route path="/permissions" element={<Permissions />} />
          <Route path="/permissions/:id" element={<PermissionDetail />} />

          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
