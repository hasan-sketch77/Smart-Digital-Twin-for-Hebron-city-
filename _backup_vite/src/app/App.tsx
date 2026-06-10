import { useState } from 'react';
import { Bell, Globe, ChevronDown, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { DashboardScreen } from './components/DashboardScreen';
import { SimulationsScreen } from './components/SimulationsScreen';
import { ScenariosScreen } from './components/ScenariosScreen';
import { ReportsScreen } from './components/ReportsScreen';
import { SettingsScreen } from './components/SettingsScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [mapLayers, setMapLayers] = useState({
    traffic: true,
    infrastructure: true,
    maintenance: false,
    lighting: true,
    pedestrian: false,
    heatmap: true
  });

  const tabs = [
    { id: 'Dashboard', label: 'Dashboard' },
    { id: 'Simulations', label: 'Simulations' },
    { id: 'Scenarios', label: 'Scenarios' },
    { id: 'Reports', label: 'Reports' },
    { id: 'Settings', label: 'Settings' }
  ];

  const toggleLayer = (key: string) => {
    setMapLayers(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardScreen mapLayers={mapLayers} toggleLayer={toggleLayer} />;
      case 'Simulations':
        return <SimulationsScreen />;
      case 'Scenarios':
        return <ScenariosScreen />;
      case 'Reports':
        return <ReportsScreen />;
      case 'Settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen mapLayers={mapLayers} toggleLayer={toggleLayer} />;
    }
  };

  return (
    <div className="size-full flex flex-col bg-[#f8f9fb] overflow-hidden">
      {/* Top Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm"
        dir="rtl"
      >
        {/* Right Section (in RTL, appears on right) */}
        <div className="flex items-center gap-4">
          {/* Palestinian Flag */}
          <div className="relative w-8 h-6 shadow-sm rounded-sm overflow-hidden border border-gray-200">
            <div className="absolute top-0 left-0 right-0 h-2 bg-black"></div>
            <div className="absolute top-2 left-0 right-0 h-2 bg-white"></div>
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#007A3D]"></div>
            <div className="absolute left-0 top-0 bottom-0 w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[12px] border-l-[#CE1126]"></div>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#00AEEF] tracking-tight">Hebron 2035</h1>
            <div className="h-6 w-px bg-gray-300"></div>
            <p className="text-sm text-gray-600 font-medium">التوأم الرقمي لإدارة السير والشوارع في الخليل</p>
          </div>
        </div>

        {/* Center Navigation */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-[#00AEEF] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Left Section (in RTL, appears on left) */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>19:42 | الثلاثاء 14 أبريل 2026</span>
          </div>

          <button className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors text-sm">
            <Globe className="w-4 h-4" />
            <span>عربي</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          <div className="relative">
            <Bell className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-900 transition-colors" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF6B6B] rounded-full text-white text-xs flex items-center justify-center font-medium">3</span>
          </div>

          <div className="flex items-center gap-2 pr-4 border-r border-gray-300">
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Hasan</p>
              <p className="text-xs text-gray-500">Municipality Planner</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00AEEF] to-[#0088CC] flex items-center justify-center text-white font-semibold">
              H
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content Area - Dynamic based on active tab */}
      {renderScreen()}

      {/* Bottom Comparison Bar - Only show on Dashboard */}
      {activeTab === 'Dashboard' && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="h-20 bg-gradient-to-r from-white via-gray-50 to-white border-t-2 border-gray-200 shadow-2xl"
          dir="rtl"
        >
          <div className="h-full px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00AEEF] to-[#0088CC] flex items-center justify-center shadow-lg shadow-blue-200">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">مقارنة المحاكاة</h3>
                <p className="text-xs text-gray-500">تحليل التأثير</p>
              </div>
            </div>

            <div className="flex items-center gap-12">
              {/* Before */}
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 border-2 border-gray-300 flex items-center justify-center mb-1">
                    <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">قبل</span>
                </div>
                <div className="flex items-center gap-5">
                  <div className="text-center px-3 py-2 rounded-lg bg-gray-50">
                    <p className="text-xl font-bold text-gray-900">47</p>
                    <p className="text-xs text-gray-500 font-medium">دقيقة</p>
                  </div>
                  <div className="text-center px-3 py-2 rounded-lg bg-gray-50">
                    <p className="text-xl font-bold text-gray-900">85</p>
                    <p className="text-xs text-gray-500 font-medium">CO₂</p>
                  </div>
                  <div className="text-center px-3 py-2 rounded-lg bg-gray-50">
                    <p className="text-xl font-bold text-gray-900">60</p>
                    <p className="text-xs text-gray-500 font-medium">فاشل</p>
                  </div>
                </div>
              </div>

              {/* Divider with Arrow */}
              <div className="flex flex-col items-center gap-1">
                <div className="h-10 w-px bg-gradient-to-b from-transparent via-gray-400 to-transparent"></div>
                <svg className="w-6 h-6 text-[#00AEEF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                <div className="h-10 w-px bg-gradient-to-b from-transparent via-gray-400 to-transparent"></div>
              </div>

              {/* After */}
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4CAF50] to-[#45a049] border-2 border-green-400 flex items-center justify-center mb-1 shadow-lg shadow-green-200">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-[#4CAF50] uppercase tracking-wide">بعد</span>
                </div>
                <div className="flex items-center gap-5">
                  <div className="text-center px-3 py-2 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-xl font-bold text-[#4CAF50]">19</p>
                    <p className="text-xs text-green-700 font-medium">دقيقة</p>
                  </div>
                  <div className="text-center px-3 py-2 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-xl font-bold text-[#4CAF50]">61</p>
                    <p className="text-xs text-green-700 font-medium">CO₂</p>
                  </div>
                  <div className="text-center px-3 py-2 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-xl font-bold text-[#4CAF50]">8</p>
                    <p className="text-xs text-green-700 font-medium">فاشل</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#4CAF50] animate-pulse"></div>
                <span className="text-xs font-bold text-[#4CAF50] uppercase tracking-wide">مباشر</span>
              </div>
              <span className="text-xs text-gray-500">محاكاة نشطة</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
