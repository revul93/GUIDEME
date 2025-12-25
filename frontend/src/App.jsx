import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./i18n/config.js";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";

import Home from "./pages/Home.jsx";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import MyCases from "./components/dashboard/MyCases.jsx";
import NewCase from "./components/dashboard/NewCase.jsx";
import ViewCase from "./components/dashboard/ViewCase.jsx";

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-light dark:bg-dark transition-colors duration-300 ">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard/cases" element={<MyCases />} />
                <Route path="/dashboard/newcase" element={<NewCase />} />
                <Route path="/dashboard/cases/:id" element={<ViewCase />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
