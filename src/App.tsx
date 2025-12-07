import { Routes, Route } from "react-router-dom"
import { HelmetProvider } from "react-helmet-async"
import { AuthProvider } from "./contexts/AuthContext.tsx"
import ProtectedRoute from "./components/ProtectedRoute.tsx"
import Layout from "./components/Layout.tsx"
import Landing from "./pages/Landing.tsx"
import Studio from "./pages/Studio.tsx"
import StudioRequest from "./pages/StudioRequest.tsx"
import MyProjects from "./pages/MyProjects.tsx"
import Dashboard from "./pages/Dashboard.tsx"
import LabelSubmissions from "./pages/admin/LabelSubmissions.tsx"
import Login from "./pages/Login.tsx"
import Signup from "./pages/Signup.tsx"
import Artists from "./pages/Artists.tsx"
import ArtistProfile from "./pages/ArtistProfile.tsx"
import Releases from "./pages/Releases.tsx"
import About from "./pages/About.tsx"
import NotFound from "./pages/NotFound.tsx"

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Routes>
          {/* Landing page without Layout (fullscreen) */}
          <Route path="/" element={<Landing />} />

          {/* Auth pages without Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* All other pages with Layout */}
          <Route element={<Layout />}>
            <Route path="/studio" element={<Studio />} />

            {/* Protected Studio Routes */}
            <Route
              path="/studio/request"
              element={
                <ProtectedRoute>
                  <StudioRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/studio/my-projects"
              element={
                <ProtectedRoute>
                  <MyProjects />
                </ProtectedRoute>
              }
            />

            {/* Dashboard Route */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/submissions"
              element={
                <ProtectedRoute requireAdmin>
                  <LabelSubmissions />
                </ProtectedRoute>
              }
            />

            <Route path="/artists" element={<Artists />} />
            <Route path="/artists/:slug" element={<ArtistProfile />} />
            <Route path="/releases" element={<Releases />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App
