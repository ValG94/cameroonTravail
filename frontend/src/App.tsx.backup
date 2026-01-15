import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import JobSearch from './pages/JobSearch';
import JobDetails from './pages/JobDetails';
import Profile from './pages/Profile';
import CVUpload from './pages/CVUpload';
import Login from './pages/Login';
import Register from './pages/Register';
import Professional from './pages/Professional';
import ProfessionalRegister from './pages/ProfessionalRegister';
import JobAlerts from './pages/JobAlerts';
import Blog from './pages/Blog';
import AdminLogin from './pages/AdminLogin';
import NotFound from './pages/NotFound';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/recherche" element={<JobSearch />} />
              <Route path="/search" element={<JobSearch />} />
              <Route path="/emploi/:id" element={<JobDetails />} />
              <Route path="/job/:id" element={<JobDetails />} />
              <Route path="/profil" element={<Profile />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/cv" element={<CVUpload />} />
              <Route path="/connexion" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/inscription" element={<Register />} />
              <Route path="/register" element={<Register />} />
              <Route path="/professionnel" element={<Professional />} />
              <Route path="/professionnel/inscription" element={<ProfessionalRegister />} />
              <Route path="/alertes" element={<JobAlerts />} />
              <Route path="/alerts" element={<JobAlerts />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;