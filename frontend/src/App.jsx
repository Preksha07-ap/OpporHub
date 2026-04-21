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
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import CreateOpportunity from './pages/organizer/CreateOpportunity';
import Dashboard from './pages/student/Dashboard';
import OrganizerDashboard from './pages/organizer/Dashboard';
import MyEvents from './pages/organizer/MyEvents';
import Analytics from './pages/organizer/Analytics';
import OrganizerProfile from './pages/organizer/OrganizerProfile';
import PostEvent from './pages/organizer/PostEvent';

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
            <Route path="signin" element={<SignIn />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="post" element={<PostEvent />} />
            <Route path="create" element={<CreateOpportunity />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="org-dashboard" element={<OrganizerDashboard />} />
            <Route path="my-events" element={<MyEvents />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="profile-settings" element={<OrganizerProfile />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
