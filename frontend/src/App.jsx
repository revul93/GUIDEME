import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./i18n/config.js";

import { ThemeProvider } from "./context/ThemeContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <Router></Router>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
