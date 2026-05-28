import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import RealtimeMonitor from './pages/RealtimeMonitor';
import ProductionManager from './pages/ProductionManager';
import ProcessManager from './pages/ProcessManager';
import QualityManager from './pages/QualityManager';
import EquipmentManager from './pages/EquipmentManager';
import MaterialManager from './pages/MaterialManager';
import LotTracker from './pages/LotTracker';
import Reports from './pages/Reports';
import SystemSettings from './pages/SystemSettings';
import ProcessDetail from './pages/ProcessDetail';
import { fetchAllData, runSimulationStepThunk } from './store/slices/mesSlice';

function App() {
  const dispatch = useDispatch();
  const simulationActive = useSelector(state => state.mes.simulationActive);

  // Fetch all initial data from DB on load
  useEffect(() => {
    dispatch(fetchAllData());
  }, [dispatch]);

  // Simulation step timer
  useEffect(() => {
    let intervalId = null;
    if (simulationActive) {
      intervalId = setInterval(() => {
        dispatch(runSimulationStepThunk());
      }, 3000); // 3 seconds interval
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [simulationActive, dispatch]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F1F5F9] text-[#1E293B]">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Right Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Content Screens */}
        <main className="flex-1 overflow-y-auto p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/realtime" element={<RealtimeMonitor />} />
            <Route path="/production" element={<ProductionManager />} />
            <Route path="/process" element={<ProcessManager />} />
            <Route path="/quality" element={<QualityManager />} />
            <Route path="/equipment" element={<EquipmentManager />} />
            <Route path="/material" element={<MaterialManager />} />
            <Route path="/tracking" element={<LotTracker />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<SystemSettings />} />
            <Route path="/process-detail/:processType" element={<ProcessDetail />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
