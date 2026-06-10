import { motion } from 'motion/react';
import { AlertTriangle, Clock, Activity, Leaf, TrendingDown, Play, Map, Layers, Construction, Lightbulb, Footprints, Plus, Edit3, Circle, MinusCircle } from 'lucide-react';

interface DashboardScreenProps {
  mapLayers: any;
  toggleLayer: (key: string) => void;
}

export function DashboardScreen({ mapLayers, toggleLayer }: DashboardScreenProps) {
  const kpiData = [
    {
      icon: Activity,
      label: 'حالة الطرق',
      primary: '87%',
      secondary: 'جيدة',
      tertiary: '13% تحتاج صيانة',
      color: '#4CAF50'
    },
    {
      icon: Clock,
      label: 'متوسط وقت التنقل',
      primary: '42',
      secondary: 'دقيقة',
      tertiary: '↓18% من الشهر الماضي',
      color: '#00AEEF',
      trend: 'down'
    },
    {
      icon: AlertTriangle,
      label: 'البلاغات المفتوحة',
      primary: '8',
      secondary: 'بلاغات',
      tertiary: '3 عاجلة',
      color: '#FF6B6B'
    },
    {
      icon: Leaf,
      label: 'CO₂ تم توفيره اليوم',
      primary: '18',
      secondary: 'طن',
      tertiary: 'الهدف: 22 طن/يوم',
      color: '#4CAF50'
    }
  ];

  const toolButtons = [
    { icon: Plus, label: 'إضافة شارع جديد' },
    { icon: Edit3, label: 'تعديل طريق' },
    { icon: Circle, label: 'إضافة دوار' },
    { icon: MinusCircle, label: 'حذف إشارة مرور' }
  ];

  const layerToggles = [
    { key: 'traffic', icon: Map, label: 'حركة المرور' },
    { key: 'infrastructure', icon: Layers, label: 'البنية التحتية' },
    { key: 'maintenance', icon: Construction, label: 'أعمال الصيانة' },
    { key: 'lighting', icon: Lightbulb, label: 'الإنارة الذكية' },
    { key: 'pedestrian', icon: Footprints, label: 'مناطق المشاة' },
    { key: 'heatmap', icon: Activity, label: 'Heatmap Overlay' }
  ];

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-72 bg-white border-l border-gray-200 flex flex-col shadow-sm"
        dir="rtl"
      >
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">طبقات الخريطة</h2>
          <div className="space-y-2">
            {layerToggles.map(({ key, icon: Icon, label }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
                <button
                  onClick={() => toggleLayer(key)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    mapLayers[key as keyof typeof mapLayers] ? 'bg-[#00AEEF]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                      mapLayers[key as keyof typeof mapLayers] ? 'translate-x-0.5' : '-translate-x-5'
                    }`}
                  ></span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">أدوات التفاعل</h3>
          <div className="space-y-2">
            {toolButtons.map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition-colors group"
              >
                <Icon className="w-4 h-4 text-gray-500 group-hover:text-[#00AEEF] transition-colors" />
                {label}
              </button>
            ))}
          </div>

          <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-[#00AEEF] to-[#0088CC] text-white font-semibold shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all">
            <Play className="w-5 h-5" />
            محاكاة التغييرات
          </button>
        </div>
      </motion.aside>

      {/* Central Map Area */}
      <motion.main
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 relative overflow-hidden"
      >
        {/* Map Background - 3D Digital Twin Visualization */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-blue-50/30 to-gray-50">
          {/* Simulated 3D Grid Map */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 174, 239, 0.15) 1.5px, transparent 1.5px),
              linear-gradient(90deg, rgba(0, 174, 239, 0.15) 1.5px, transparent 1.5px)
            `,
            backgroundSize: '50px 50px',
            transform: 'perspective(1000px) rotateX(65deg) scale(1.8)',
            transformOrigin: 'center bottom'
          }}></div>

          {/* Topographic Lines */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" className="absolute inset-0">
              <path d="M 100 200 Q 300 180, 500 220 T 900 200" stroke="#00AEEF" strokeWidth="1" fill="none" opacity="0.3"/>
              <path d="M 120 280 Q 320 260, 520 300 T 920 280" stroke="#00AEEF" strokeWidth="1" fill="none" opacity="0.3"/>
              <path d="M 80 360 Q 280 340, 480 380 T 880 360" stroke="#00AEEF" strokeWidth="1" fill="none" opacity="0.3"/>
            </svg>
          </div>

          {/* City Buildings & Landmarks */}
          <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2">
            <div className="relative w-48 h-32 opacity-15">
              <div className="absolute bottom-0 left-8 w-7 h-28 bg-gradient-to-t from-gray-600 to-gray-400 rounded-t-sm shadow-xl"></div>
              <div className="absolute bottom-0 left-16 w-10 h-36 bg-gradient-to-t from-gray-700 to-gray-500 rounded-t-sm shadow-xl"></div>
              <div className="absolute bottom-0 left-28 w-6 h-24 bg-gradient-to-t from-gray-500 to-gray-400 rounded-t-sm shadow-xl"></div>
              <div className="absolute bottom-0 left-36 w-8 h-32 bg-gradient-to-t from-gray-600 to-gray-400 rounded-t-sm shadow-xl"></div>
              <div className="absolute bottom-0 left-20 w-5 h-20 bg-gradient-to-t from-gray-500 to-gray-300 rounded-t-sm shadow-lg"></div>
            </div>
          </div>

          {/* Road Network Overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-25" preserveAspectRatio="none">
            <path d="M 200 100 L 600 150 L 800 300" stroke="#5f6368" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <path d="M 300 200 L 700 220 L 900 400" stroke="#5f6368" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <path d="M 100 300 Q 400 280, 600 350" stroke="#5f6368" strokeWidth="3" fill="none" strokeLinecap="round"/>
          </svg>

          {/* Heatmap Overlay - Bab Al-Zawiyeh */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="absolute top-1/3 left-1/2 transform -translate-x-1/2"
          >
            <div className="relative">
              <div className="absolute inset-0 w-56 h-56 -translate-x-1/2 -translate-y-1/2">
                <div className="absolute inset-0 rounded-full bg-gradient-radial from-red-500/50 via-orange-500/35 to-transparent blur-3xl animate-pulse"></div>
                <div className="absolute inset-4 rounded-full bg-gradient-radial from-red-600/40 via-orange-400/25 to-transparent blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute inset-8 rounded-full bg-gradient-radial from-red-500/30 to-transparent blur-xl"></div>
              </div>

              {/* Congestion Popup */}
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                className="absolute top-20 left-20 bg-white rounded-xl shadow-2xl p-4 w-72 border border-gray-200 backdrop-blur-sm"
                dir="rtl"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-200">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2">شارع باب الزاوية</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">الازدحام:</span>
                        <span className="font-bold text-red-600">68%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full w-[68%] bg-gradient-to-r from-orange-500 to-red-600 rounded-full"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">متوسط السرعة:</span>
                        <span className="font-bold text-gray-900">12 كم/س</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* New Street Drawing - Blue Dotted Line */}
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.8 }}
            className="absolute top-1/2 left-1/4"
          >
            <svg width="400" height="200" className="overflow-visible">
              <motion.path
                d="M 50 50 Q 150 20, 250 80 T 380 60"
                stroke="#00AEEF"
                strokeWidth="5"
                strokeDasharray="10 10"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, delay: 1 }}
                className="drop-shadow-lg"
              />
              <circle cx="50" cy="50" r="8" fill="#00AEEF" className="drop-shadow-lg">
                <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="380" cy="60" r="8" fill="#00AEEF" className="drop-shadow-lg">
                <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite" begin="1s"/>
              </circle>
              <g opacity="0.6">
                <line x1="50" y1="50" x2="50" y2="40" stroke="#00AEEF" strokeWidth="1"/>
                <line x1="150" y1="20" x2="150" y2="10" stroke="#00AEEF" strokeWidth="1"/>
                <line x1="250" y1="80" x2="250" y2="90" stroke="#00AEEF" strokeWidth="1"/>
                <line x1="380" y1="60" x2="380" y2="50" stroke="#00AEEF" strokeWidth="1"/>
              </g>
            </svg>

            {/* New Street Proposal Card */}
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.2 }}
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-4 bg-white rounded-xl shadow-2xl p-5 w-80 border-2 border-[#00AEEF]"
              dir="rtl"
            >
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00AEEF] animate-pulse"></div>
                شارع جديد مقترح
              </h3>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>الطول: <span className="font-semibold text-gray-900">420م</span></p>
                <p>نوع الطريق: <span className="font-semibold text-gray-900">شارع رئيسي</span></p>
              </div>
              <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#00AEEF] to-[#0088CC] text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                <Play className="w-4 h-4" />
                محاكاة
              </button>
            </motion.div>
          </motion.div>

          {/* Map Controls & Info Overlay */}
          <div className="absolute bottom-6 left-6 flex flex-col gap-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-gray-200 flex flex-col gap-1">
              <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
              <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
              <div className="w-full h-px bg-gray-200 my-1"></div>
              <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-gray-100 transition-colors">
                <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </button>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200" dir="rtl">
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500 font-medium">عرض:</span>
                  <span className="text-gray-900 font-mono">31.5326</span>
                </div>
                <div className="w-px h-3 bg-gray-300"></div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500 font-medium">طول:</span>
                  <span className="text-gray-900 font-mono">35.0998</span>
                </div>
              </div>
            </div>
          </div>

          {/* Digital Twin Watermark */}
          <div className="absolute bottom-6 right-6 flex flex-col items-end gap-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00AEEF] to-[#0088CC] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div className="text-right" dir="rtl">
                  <p className="text-xs font-bold text-gray-900">التوأم الرقمي</p>
                  <p className="text-xs text-gray-500">الخليل • فلسطين</p>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 bg-white/80 backdrop-blur-sm rounded px-2 py-1" dir="rtl">
              الوضع: <span className="font-semibold text-[#00AEEF]">رسم ومحاكاة</span>
            </div>
          </div>

          {/* Heatmap Legend */}
          <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200" dir="rtl">
            <h4 className="text-xs font-semibold text-gray-900 mb-2">ازدحام المرور</h4>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 rounded bg-gradient-to-r from-green-400 to-green-500"></div>
                <span className="text-xs text-gray-600">منخفض (0-30%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 rounded bg-gradient-to-r from-yellow-400 to-orange-400"></div>
                <span className="text-xs text-gray-600">متوسط (30-60%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 rounded bg-gradient-to-r from-orange-500 to-red-500"></div>
                <span className="text-xs text-gray-600">عالي (60-100%)</span>
              </div>
            </div>
          </div>

          {/* Scale Indicator */}
          <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200" dir="rtl">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-start">
                <div className="flex items-end gap-0.5 mb-1">
                  <div className="w-16 h-1 bg-gray-900"></div>
                </div>
                <span className="text-xs font-medium text-gray-900">500م</span>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-xs text-gray-600">
                <p className="font-semibold text-gray-900">مقياس 1:5000</p>
                <p className="text-gray-500">بيانات فورية</p>
              </div>
            </div>
          </div>
        </div>
      </motion.main>

      {/* Right Sidebar */}
      <motion.aside
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="w-80 bg-white border-r border-gray-200 overflow-y-auto shadow-sm"
        dir="rtl"
      >
        <div className="p-4 space-y-4">
          {kpiData.map((kpi, index) => (
            <motion.div
              key={kpi.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}20` }}>
                  <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
                </div>
                {kpi.trend && (
                  <TrendingDown className="w-4 h-4 text-green-600" />
                )}
              </div>
              <h3 className="text-xs font-medium text-gray-600 mb-2">{kpi.label}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-bold text-gray-900">{kpi.primary}</span>
                <span className="text-sm text-gray-500">{kpi.secondary}</span>
              </div>
              <p className="text-xs text-gray-500">{kpi.tertiary}</p>
            </motion.div>
          ))}

          {/* AI Recommendation Panel */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="bg-gradient-to-br from-[#00AEEF] to-[#0088CC] rounded-xl p-5 text-white shadow-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 className="font-semibold">توصية الذكاء الاصطناعي</h3>
            </div>
            <p className="text-sm text-white/90 mb-4 leading-relaxed">
              بدلاً من توسيع هذا الشارع، أضف دواراً عند التقاطع X للحصول على نتائج أفضل.
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white/20 rounded-lg p-2 text-center backdrop-blur-sm">
                <p className="font-bold text-base">-31%</p>
                <p className="text-white/80">ازدحام</p>
              </div>
              <div className="bg-white/20 rounded-lg p-2 text-center backdrop-blur-sm">
                <p className="font-bold text-base">+42%</p>
                <p className="text-white/80">كفاءة</p>
              </div>
              <div className="bg-white/20 rounded-lg p-2 text-center backdrop-blur-sm">
                <p className="font-bold text-base">+28%</p>
                <p className="text-white/80">استجابة</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.aside>
    </div>
  );
}
