import { Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Login from './pages/login';
import Signup from './pages/signup';
import Profile from './pages/profile';
import Posts from './pages/posts';
import Navbar from './components/Navbar';
import ProtectedRoutes from './AuthContext/ProtectedRoutes';
import './index.css';

function App() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/posts" element={<Posts />} />
          </Route>
        </Routes>
      </main>
    </>
  );
}

export default App;