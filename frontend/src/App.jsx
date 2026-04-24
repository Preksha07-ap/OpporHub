import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/common/Layout';
import Homepage from './pages/student/Homepage';
import Conferences from './pages/student/Conferences';
import Events from './pages/student/Events';
import Workshops from './pages/student/Workshops';
import Contributions from './pages/student/Contributions';
import Internships from './pages/student/Internships';
import GlobalSearch from './pages/student/GlobalSearch';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import CreateOpportunity from './pages/organizer/CreateOpportunity';
import Dashboard from './pages/student/Dashboard';
import OrganizerDashboard from './pages/organizer/Dashboard';
import MyEvents from './pages/organizer/MyEvents';
import Analytics from './pages/organizer/Analytics';
import OrganizerProfile from './pages/organizer/OrganizerProfile';
import PostEvent from './pages/organizer/PostEvent';
import AdminDashboard from './pages/admin/AdminDashboard';
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // Or a loading spinner

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Homepage />} />
            <Route path="conferences" element={<Conferences />} />
            <Route path="events" element={<Events />} />
            <Route path="workshops" element={<Workshops />} />
            <Route path="contributions" element={<Contributions />} />
            <Route path="internships" element={<Internships />} />
            <Route path="search" element={<GlobalSearch />} />
            <Route path="signin" element={<SignIn />} />
            <Route path="signup" element={<SignUp />} />
            
            {/* Protected Student Routes */}
            <Route path="dashboard" element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* Protected Organizer Routes */}
            <Route path="post" element={
              <ProtectedRoute allowedRoles={['ORGANIZER']}>
                <PostEvent />
              </ProtectedRoute>
            } />
            <Route path="org-dashboard" element={
              <ProtectedRoute allowedRoles={['ORGANIZER']}>
                <OrganizerDashboard />
              </ProtectedRoute>
            } />
            <Route path="my-events" element={
              <ProtectedRoute allowedRoles={['ORGANIZER']}>
                <MyEvents />
              </ProtectedRoute>
            } />
            <Route path="analytics" element={
              <ProtectedRoute allowedRoles={['ORGANIZER']}>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="profile-settings" element={
              <ProtectedRoute allowedRoles={['ORGANIZER']}>
                <OrganizerProfile />
              </ProtectedRoute>
            } />

            {/* Protected Admin Routes */}
            <Route path="admin-dashboard" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
