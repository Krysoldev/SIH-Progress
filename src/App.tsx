import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { NotificationProvider } from './context/NotificationContext';
import { AurumShell } from './components/layout/AurumShell';

import { ScreenId } from './components/layout/AurumSidebar';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { AlertsPage } from './pages/AlertsPage';
import { AICopilotPage } from './pages/AICopilotPage';
import { MapPage } from './pages/MapPage';
import { ReportsPage } from './pages/ReportsPage';
import { SimulationPage } from './pages/SimulationPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(() => {
    // Read from hash if present
    const hash = window.location.hash.replace('#', '') as ScreenId;
    const validScreens: ScreenId[] = [
      'overview',
      'projects',
      'details',
      'analytics',
      'risk',
      'alerts',
      'copilot',
      'map',
      'reports',
      'simulation',
      'settings',
    ];
    return validScreens.includes(hash) ? hash : 'overview';
  });

  // Sync screen with URL hash for easy bookmarking and browser back navigation
  const handleNavigate = (screen: ScreenId) => {
    setCurrentScreen(screen);
    window.location.hash = screen;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as ScreenId;
      if (hash) setCurrentScreen(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => handleNavigate('overview')} />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'overview':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'projects':
        return <ProjectsPage onNavigate={handleNavigate} />;
      case 'details':
        return <ProjectDetailPage onNavigate={handleNavigate} />;
      case 'analytics':
        return <AnalyticsPage onNavigate={handleNavigate} />;
      case 'risk':
        return <RiskAnalysisPage onNavigate={handleNavigate} />;
      case 'alerts':
        return <AlertsPage onNavigate={handleNavigate} />;
      case 'copilot':
        return <AICopilotPage onNavigate={handleNavigate} />;
      case 'map':
        return <MapPage onNavigate={handleNavigate} />;
      case 'reports':
        return <ReportsPage onNavigate={handleNavigate} />;
      case 'simulation':
        return <SimulationPage onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <AurumShell currentScreen={currentScreen} onNavigate={handleNavigate}>
      {renderScreen()}
    </AurumShell>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ProjectProvider>
          <AppContent />
        </ProjectProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

