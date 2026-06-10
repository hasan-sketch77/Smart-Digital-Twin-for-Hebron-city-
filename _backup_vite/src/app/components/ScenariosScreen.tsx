import { motion } from 'motion/react';
import { Layers, ChevronLeft, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export function ScenariosScreen() {
  const scenarios = [
    {
      id: 1,
      name: 'سيناريو 2025 - النمو المعتدل',
      description: 'توقع نمو بنسبة 15% في حركة المرور خلال 12 شهراً',
      status: 'active',
      impact: 'medium',
      metrics: {
        traffic: '+15%',
        infrastructure: '3 مشاريع',
        timeline: '12 شهر'
      },
      color: '#00AEEF'
    },
    {
      id: 2,
      name: 'سيناريو 2030 - التوسع العمراني',
      description: 'خطة توسع شاملة تشمل 8 شوارع رئيسية جديدة',
      status: 'planned',
      impact: 'high',
      metrics: {
        traffic: '+45%',
        infrastructure: '8 مشاريع',
        timeline: '5 سنوات'
      },
      color: '#4CAF50'
    },
    {
      id: 3,
      name: 'سيناريو الطوارئ - إغلاق مؤقت',
      description: 'خطة بديلة في حالة إغلاق الطرق الرئيسية',
      status: 'standby',
      impact: 'critical',
      metrics: {
        traffic: 'متغير',
        infrastructure: '2 بديل',
        timeline: 'فوري'
      },
      color: '#FF6B6B'
    },
    {
      id: 4,
      name: 'سيناريو النقل المستدام 2028',
      description: 'تحويل 30% من الحركة إلى وسائل نقل عامة ومشاة',
      status: 'draft',
      impact: 'medium',
      metrics: {
        traffic: '-30%',
        infrastructure: '5 مشاريع',
        timeline: '3 سنوات'
      },
      color: '#FFB84D'
    }
  ];

  return (
    <div className="flex-1 overflow-hidden bg-gray-50">
      <div className="h-full p-6 overflow-y-auto" dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">السيناريوهات والخطط</h1>
            <p className="text-gray-600">إدارة ومقارنة سيناريوهات التخطيط طويلة المدى</p>
          </div>

          {/* Active Scenario Highlight */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg border-2 border-[#00AEEF] p-6 mb-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#00AEEF] flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-gray-900">سيناريو 2025 - النمو المعتدل</h2>
                    <span className="px-2 py-1 bg-[#00AEEF] text-white rounded-full text-xs font-medium">
                      نشط
                    </span>
                  </div>
                  <p className="text-gray-600">توقع نمو بنسبة 15% في حركة المرور خلال 12 شهراً</p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors">
                عرض التفاصيل
                <ChevronLeft className="w-4 h-4 inline mr-1" />
              </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-4">
                <p className="text-xs text-blue-700 mb-1">زيادة متوقعة</p>
                <p className="text-2xl font-bold text-blue-900">+15%</p>
                <p className="text-xs text-blue-600">في حركة المرور</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg p-4">
                <p className="text-xs text-green-700 mb-1">المشاريع</p>
                <p className="text-2xl font-bold text-green-900">3</p>
                <p className="text-xs text-green-600">مشاريع بنية تحتية</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg p-4">
                <p className="text-xs text-purple-700 mb-1">الإطار الزمني</p>
                <p className="text-2xl font-bold text-purple-900">12</p>
                <p className="text-xs text-purple-600">شهر</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-lg p-4">
                <p className="text-xs text-orange-700 mb-1">الموثوقية</p>
                <p className="text-2xl font-bold text-orange-900">87%</p>
                <p className="text-xs text-orange-600">دقة التوقع</p>
              </div>
            </div>
          </motion.div>

          {/* Scenarios Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {scenarios.map((scenario, index) => (
              <motion.div
                key={scenario.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${scenario.color}20` }}
                    >
                      <Layers className="w-5 h-5" style={{ color: scenario.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-[#00AEEF] transition-colors">
                        {scenario.name}
                      </h3>
                    </div>
                  </div>
                  <div>
                    {scenario.status === 'active' && (
                      <span className="px-2 py-1 bg-[#00AEEF] text-white rounded-full text-xs font-medium">
                        نشط
                      </span>
                    )}
                    {scenario.status === 'planned' && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        مخطط
                      </span>
                    )}
                    {scenario.status === 'standby' && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        احتياطي
                      </span>
                    )}
                    {scenario.status === 'draft' && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        مسودة
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{scenario.description}</p>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: scenario.color }}></div>
                    <span className="text-gray-500">حركة المرور:</span>
                    <span className="font-semibold text-gray-900">{scenario.metrics.traffic}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: scenario.color }}></div>
                    <span className="text-gray-500">المشاريع:</span>
                    <span className="font-semibold text-gray-900">{scenario.metrics.infrastructure}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: scenario.color }}></div>
                    <span className="text-gray-500">المدة:</span>
                    <span className="font-semibold text-gray-900">{scenario.metrics.timeline}</span>
                  </div>
                </div>

                {/* Impact Badge */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {scenario.impact === 'critical' && (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span className="text-xs font-medium text-red-600">تأثير حرج</span>
                        </>
                      )}
                      {scenario.impact === 'high' && (
                        <>
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                          <span className="text-xs font-medium text-orange-600">تأثير عالي</span>
                        </>
                      )}
                      {scenario.impact === 'medium' && (
                        <>
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-medium text-blue-600">تأثير متوسط</span>
                        </>
                      )}
                    </div>
                    <button className="text-xs text-[#00AEEF] hover:text-[#0088CC] font-medium">
                      عرض المزيد ←
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Comparison Tool */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold mb-1">أداة المقارنة</h3>
                <p className="text-sm text-gray-300">قارن بين سيناريوهات مختلفة لاتخاذ القرار الأمثل</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-white text-gray-900 text-sm font-medium hover:bg-gray-100 transition-colors">
                مقارنة السيناريوهات
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-xs text-gray-300 mb-2">متوسط التحسين</p>
                <p className="text-3xl font-bold">+23%</p>
                <p className="text-xs text-gray-400 mt-1">عبر جميع السيناريوهات</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-xs text-gray-300 mb-2">إجمالي المشاريع</p>
                <p className="text-3xl font-bold">18</p>
                <p className="text-xs text-gray-400 mt-1">مشروع مخطط</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-xs text-gray-300 mb-2">الإطار الزمني</p>
                <p className="text-3xl font-bold">2026-2030</p>
                <p className="text-xs text-gray-400 mt-1">فترة التنفيذ</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
