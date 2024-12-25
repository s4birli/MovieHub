import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MovieList from "./pages/MovieList";
import MovieDetail from './pages/MovieDetail';
import PrivateRoute from "./components/PrivateRoute";
import DefaultRoute from "./components/DefaultRoute";

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

        {/* Catch-all Route */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
