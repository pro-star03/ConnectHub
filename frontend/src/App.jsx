import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import PostDetails from './pages/PostDetails';
import SavedPosts from './pages/SavedPosts';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Search from './pages/Search';
import Suggestions from './pages/Suggestions';
import CreatePost from './pages/CreatePost';
import CreateStory from './pages/CreateStory';
import CreateOptions from './pages/CreateOptions';
import Settings from './pages/Settings';
import ChangePassword from './pages/ChangePassword';

// Admin imports
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPosts from './pages/admin/AdminPosts';
import AdminReports from './pages/admin/AdminReports';
import AdminSuspiciousUsers from './pages/admin/AdminSuspiciousUsers';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin Login Route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Protected Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="posts" element={<AdminPosts />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="suspicious-users" element={<AdminSuspiciousUsers />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:id" element={<Profile />} />
          <Route path="post/:id" element={<PostDetails />} />
          <Route path="saved" element={<SavedPosts />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:userId" element={<Messages />} />
          <Route path="create" element={<CreateOptions />} />
          <Route path="create-post" element={<CreatePost />} />
          <Route path="create-story" element={<CreateStory />} />

          <Route path="settings" element={<Settings />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="suggestions" element={<Suggestions />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
