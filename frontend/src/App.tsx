import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MovieList from "./pages/MovieList";
import MovieDetail from './pages/MovieDetail';
import PrivateRoute from "./components/PrivateRoute";
import DefaultRoute from "./components/DefaultRoute";
import Profile from './pages/Profile';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/movies"
          element={
            <PrivateRoute>
              <MovieList />
            </PrivateRoute>
          }
        />
        <Route path="/movie/:id" element={<PrivateRoute><MovieDetail /></PrivateRoute>} />

        <Route path="/" element={<DefaultRoute />} />

        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
