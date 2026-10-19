import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext.tsx"
import ProtectedRoute from "./components/ProtectedRoute.tsx"
import Layout from "./components/Layout.tsx"
import Home from "./pages/Home.tsx"
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
import ForgotPassword from "./pages/ForgotPassword.tsx"
import ResetPassword from "./pages/ResetPassword.tsx"
import AuthCallback from "./pages/AuthCallback.tsx"
import Artists from "./pages/Artists.tsx"
import ArtistPage from "./pages/ArtistPage.tsx"
import Releases from "./pages/Releases.tsx"
import Label from "./pages/Label.tsx"
import Contact from "./pages/Contact.tsx"
import InstagramGenerator from "./pages/InstagramGenerator.tsx"
import CatalogueManager from "./pages/admin/CatalogueManager.tsx"
import NotFound from "./pages/NotFound.tsx"
import { FEATURE_AUTH, FEATURE_STUDIO } from "./config/features.ts"
import ScrollToTop from "./components/site/ScrollToTop.tsx"

function App() {
  return (
    <AuthProvider>
        <ScrollToTop />
        <Routes>
          {/* Home renders its own nav and footer (fullscreen intro) */}
          <Route path="/" element={<Home />} />

          {FEATURE_AUTH && (
            <>
              {/* Public shared file download page (no layout) */}
              <Route path="/shared/:token" element={<SharedDownload />} />

              {/* Auth pages without Layout */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </>
          )}

          {/* All other pages with Layout */}
          <Route element={<Layout />}>
            {FEATURE_STUDIO && (
              <>
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

                {/* Project Detail Route */}
                <Route
                  path="/studio/project/:projectId"
                  element={
                    <ProtectedRoute>
                      <ProjectDetail />
                    </ProtectedRoute>
                  }
                />
              </>
            )}

            {FEATURE_AUTH && (
              <>
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
              </>
            )}

            <Route path="/artists" element={<Artists />} />
            <Route path="/artists/:slug" element={<ArtistPage />} />
            <Route path="/releases" element={<Releases />} />
            <Route path="/label" element={<Label />} />
            <Route path="/contact" element={<Contact />} />
            {/* v1 URL */}
            <Route path="/about" element={<Navigate to="/label" replace />} />
            {FEATURE_AUTH && (
              <>
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
              </>
            )}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
    </AuthProvider>
  )
}

export default App
