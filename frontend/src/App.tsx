import { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { DashboardPage } from './pages/DashboardPage';
import { MaterialsPage } from './pages/MaterialsPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { CNMCRegistryPage } from './pages/CNMCRegistryPage';
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

interface HealthResponse {
  status: string;
}

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('Dashboard');
  const [selectedCpse, setSelectedCpse] = useState<string>('ALL');
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [pendingReviewsCount, setPendingReviewsCount] = useState<number>(0);

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await fetch(`${API_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data: HealthResponse = await res.json();
        setBackendOnline(data.status === 'ok');
      } else {
        setBackendOnline(false);
      }
    } catch {
      setBackendOnline(false);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const fetchPendingReviewsCount = async () => {
    try {
      const res = await fetch(`${API_URL}/api/review?status=pending`);
      if (res.ok) {
        const data = await res.json();
        setPendingReviewsCount(Array.isArray(data) ? data.length : 0);
      }
    } catch {
      // Ignore background count failure
    }
  };

  useEffect(() => {
    checkHealth();
    fetchPendingReviewsCount();
    const interval = setInterval(() => {
      checkHealth();
      fetchPendingReviewsCount();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = (tab: NavTab): string => {
    switch (tab) {
      case 'Dashboard':
        return 'Dashboard';
      case 'Materials':
        return 'Materials';
      case 'Review':
        return 'Review Queue';
      case 'Registry':
        return 'CNMC Registry';
      default:
        return tab;
    }
  };

  const [isResettingDemo, setIsResettingDemo] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleResetDemoData = async () => {
    setIsResettingDemo(true);
    try {
      const res = await fetch(`${API_URL}/api/demo/reset`, {
        method: 'POST',
      });
      if (res.ok) {
        await checkHealth();
        await fetchPendingReviewsCount();
        setRefreshKey((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Failed to reset demo data', err);
    } finally {
      setIsResettingDemo(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar: exactly 4 items (Dashboard, Materials, Review, Registry) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        backendOnline={backendOnline}
        pendingReviewsCount={pendingReviewsCount}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          currentTab={getPageTitle(activeTab)}
          selectedCpse={selectedCpse}
          onSelectCpse={setSelectedCpse}
          onRefreshHealth={checkHealth}
          isCheckingHealth={isCheckingHealth}
          onResetDemoData={handleResetDemoData}
          isResettingDemo={isResettingDemo}
        />

        {/* 4 Pages Content Body */}
        <main className="flex-1 overflow-y-auto p-6" key={refreshKey}>
          {activeTab === 'Dashboard' && (
            <DashboardPage
              onNavigateTab={(tab) => setActiveTab(tab)}
              onResetDemoData={handleResetDemoData}
              isResettingDemo={isResettingDemo}
            />
          )}
          {activeTab === 'Materials' && <MaterialsPage />}
          {activeTab === 'Review' && <ReviewQueuePage />}
          {activeTab === 'Registry' && <CNMCRegistryPage />}
        </main>
      </div>
    </div>
  );
}

export default App;
