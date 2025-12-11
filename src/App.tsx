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
import ProjectDetail from "./pages/ProjectDetail.tsx"
import LabelSubmissions from "./pages/admin/LabelSubmissions.tsx"
import StudioRequests from "./pages/admin/StudioRequests.tsx"
import UserManagement from "./pages/admin/UserManagement.tsx"
import MyDrive from "./pages/admin/MyDrive.tsx"
import SharedDownload from "./pages/SharedDownload.tsx"
import Login from "./pages/Login.tsx"
import Signup from "./pages/Signup.tsx"
import Artists from "./pages/Artists.tsx"
import ArtistProfile from "./pages/ArtistProfile.tsx"
import Releases from "./pages/Releases.tsx"
import About from "./pages/About.tsx"
import InstagramGenerator from "./pages/InstagramGenerator.tsx"
import CatalogueManager from "./pages/admin/CatalogueManager.tsx"
import NotFound from "./pages/NotFound.tsx"

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Routes>
          {/* Landing page without Layout (fullscreen) */}
          <Route path="/" element={<Landing />} />

          {/* Public shared file download page (no layout) */}
          <Route path="/shared/:token" element={<SharedDownload />} />

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

            {/* Project Detail Route */}
            <Route
              path="/studio/project/:projectId"
              element={
                <ProtectedRoute>
                  <ProjectDetail />
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
            <Route
              path="/admin/studio-requests"
              element={
                <ProtectedRoute requireAdmin>
                  <StudioRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requireAdmin>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/my-drive"
              element={
                <ProtectedRoute requireAdmin>
                  <MyDrive />
                </ProtectedRoute>
              }
            />

            <Route path="/artists" element={<Artists />} />
            <Route path="/artists/:slug" element={<ArtistProfile />} />
            <Route path="/releases" element={<Releases />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/admin/instagram-generator"
              element={
                <ProtectedRoute requireAdmin>
                  <InstagramGenerator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/catalogue"
              element={
                <ProtectedRoute requireAdmin>
                  <CatalogueManager />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App
