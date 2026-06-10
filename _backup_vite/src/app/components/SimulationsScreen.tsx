import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, Download, Check, Clock, TrendingUp } from 'lucide-react';

export function SimulationsScreen() {
  const simulations = [
    {
      id: 1,
      name: 'محاكاة دوار جديد - تقاطع باب الزاوية',
      status: 'completed',
      date: '12 أبريل 2026',
      results: {
        congestionReduction: '-42%',
        speedIncrease: '+35%',
        emissionReduction: '-18%'
      }
    },
    {
      id: 2,
      name: 'توسعة شارع الإبراهيمية الرئيسي',
      status: 'running',
      date: '13 أبريل 2026',
      progress: 67
    },
    {
      id: 3,
      name: 'إضافة ممرات مشاة - المدينة القديمة',
      status: 'pending',
      date: '14 أبريل 2026'
    },
    {
      id: 4,
      name: 'تحسين شبكة الإنارة الذكية',
      status: 'completed',
      date: '10 أبريل 2026',
      results: {
        congestionReduction: '-12%',
        speedIncrease: '+8%',
        emissionReduction: '-22%'
      }
    }
  ];

  return (
    <div className="flex-1 flex overflow-hidden bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto" dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">المحاكاة والتجارب</h1>
            <p className="text-gray-600">تشغيل ومراقبة سيناريوهات المحاكاة المختلفة لتحسين شبكة الطرق</p>
          </div>

          {/* Active Simulation Panel */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-br from-[#00AEEF] to-[#0088CC] rounded-2xl p-6 mb-6 text-white shadow-xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold mb-2">محاكاة نشطة</h2>
                <p className="text-white/90">توسعة شارع الإبراهيمية الرئيسي</p>
              </div>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                  <Pause className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/90">التقدم</span>
                <span className="text-sm font-bold">67%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '67%' }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>

            {/* Real-time Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-xs text-white/80 mb-1">معالجة البيانات</p>
                <p className="text-2xl font-bold">12,847</p>
                <p className="text-xs text-white/70">نقطة بيانات</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-xs text-white/80 mb-1">الوقت المتبقي</p>
                <p className="text-2xl font-bold">4:23</p>
                <p className="text-xs text-white/70">دقائق</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-xs text-white/80 mb-1">دقة النموذج</p>
                <p className="text-2xl font-bold">94.2%</p>
                <p className="text-xs text-white/70">موثوقية</p>
              </div>
            </div>
          </motion.div>

          {/* Simulations List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">جميع المحاكاة</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {simulations.map((sim, index) => (
                <motion.div
                  key={sim.id}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{sim.name}</h4>
                        {sim.status === 'completed' && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            مكتملة
                          </span>
                        )}
                        {sim.status === 'running' && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                            قيد التشغيل
                          </span>
                        )}
                        {sim.status === 'pending' && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            معلقة
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{sim.date}</p>

                      {sim.results && (
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-gray-600">تقليل الازدحام:</div>
                            <div className="text-sm font-bold text-green-600">{sim.results.congestionReduction}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-gray-600">زيادة السرعة:</div>
                            <div className="text-sm font-bold text-green-600">{sim.results.speedIncrease}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-gray-600">تقليل الانبعاثات:</div>
                            <div className="text-sm font-bold text-green-600">{sim.results.emissionReduction}</div>
                          </div>
                        </div>
                      )}

                      {sim.progress !== undefined && (
                        <div className="mt-2">
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#00AEEF] rounded-full"
                              style={{ width: `${sim.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mr-4">
                      {sim.status === 'completed' && (
                        <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                          <Download className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                      {sim.status === 'pending' && (
                        <button className="px-4 py-2 rounded-lg bg-[#00AEEF] text-white text-sm font-medium hover:bg-[#0088CC] transition-colors flex items-center gap-2">
                          <Play className="w-4 h-4" />
                          تشغيل
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 grid grid-cols-3 gap-4"
          >
            <button className="bg-white rounded-xl p-6 border-2 border-dashed border-gray-300 hover:border-[#00AEEF] hover:bg-blue-50 transition-colors group">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-[#00AEEF] flex items-center justify-center mx-auto mb-3 transition-colors">
                  <Play className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">محاكاة جديدة</h4>
                <p className="text-xs text-gray-500">ابدأ سيناريو جديد</p>
              </div>
            </button>

            <button className="bg-white rounded-xl p-6 border-2 border-dashed border-gray-300 hover:border-[#00AEEF] hover:bg-blue-50 transition-colors group">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-[#00AEEF] flex items-center justify-center mx-auto mb-3 transition-colors">
                  <TrendingUp className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">تحليل متقدم</h4>
                <p className="text-xs text-gray-500">مقارنة النتائج</p>
              </div>
            </button>

            <button className="bg-white rounded-xl p-6 border-2 border-dashed border-gray-300 hover:border-[#00AEEF] hover:bg-blue-50 transition-colors group">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-[#00AEEF] flex items-center justify-center mx-auto mb-3 transition-colors">
                  <Download className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">تصدير البيانات</h4>
                <p className="text-xs text-gray-500">حفظ النتائج</p>
              </div>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
