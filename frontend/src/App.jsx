import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import CreatePost from "./pages/CreatePost";
import EditProfile from "./pages/EditProfile";
import Explore from "./pages/Explore";
import FollowersList from "./pages/FollowersList";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import PostDetail from "./pages/PostDetail";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import SavedPosts from "./pages/SavedPosts";

const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route path="/" element={<Home />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/create" element={<CreatePost />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/saved" element={<SavedPosts />} />
      <Route path="/post/:id" element={<PostDetail />} />
      <Route path="/profile/edit" element={<EditProfile />} />
      <Route path="/:username" element={<Profile />} />
      <Route path="/:username/followers" element={<FollowersList type="followers" />} />
      <Route path="/:username/following" element={<FollowersList type="following" />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
