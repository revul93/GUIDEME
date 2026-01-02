import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./i18n/config.js";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { CaseProvider } from "./context/CaseContext.jsx";

import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import MyCases from "./pages/MyCases.jsx";
import SubmitCase from "./pages/SubmitCase.jsx";
import ViewCase from "./pages/ViewCase.jsx";
import Profile from "./pages/Profile.jsx";

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <Router>
          <NotificationProvider>
            <AuthProvider>
              <CaseProvider>
                <div className="flex flex-col min-h-screen bg-light dark:bg-dark transition-colors duration-300">
                  <Header />
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route
                        path="/dashboard/mycases"
                        element={
                          <ProtectedRoute allowedRoles={["client"]}>
                            <MyCases />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/submitcase"
                        element={
                          <ProtectedRoute allowedRoles={["client"]}>
                            <SubmitCase />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/cases/:id"
                        element={
                          <ProtectedRoute allowedRoles={["client"]}>
                            <ViewCase />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/profile"
                        element={
                          <ProtectedRoute allowedRoles={["client"]}>
                            <Profile />
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </CaseProvider>
            </AuthProvider>
          </NotificationProvider>
        </Router>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
