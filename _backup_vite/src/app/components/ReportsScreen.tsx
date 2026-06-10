import { motion } from 'motion/react';
import { FileText, Download, Calendar, TrendingUp, BarChart3, PieChart } from 'lucide-react';

export function ReportsScreen() {
  const reports = [
    {
      id: 1,
      title: 'تقرير الأداء الشهري - مارس 2026',
      type: 'monthly',
      date: '1 أبريل 2026',
      size: '2.4 MB',
      pages: 24,
      status: 'ready'
    },
    {
      id: 2,
      title: 'تحليل الازدحام المروري - Q1 2026',
      type: 'quarterly',
      date: '28 مارس 2026',
      size: '5.8 MB',
      pages: 42,
      status: 'ready'
    },
    {
      id: 3,
      title: 'تقرير البنية التحتية السنوي 2025',
      type: 'annual',
      date: '15 يناير 2026',
      size: '12.3 MB',
      pages: 86,
      status: 'ready'
    },
    {
      id: 4,
      title: 'تقييم جودة الطرق - أبريل 2026',
      type: 'monthly',
      date: 'قيد الإنشاء',
      size: '-',
      pages: '-',
      status: 'processing'
    }
  ];

  const chartTypes = [
    {
      icon: BarChart3,
      name: 'الرسوم البيانية',
      count: 156,
      color: '#00AEEF'
    },
    {
      icon: PieChart,
      name: 'التوزيعات',
      count: 89,
      color: '#4CAF50'
    },
    {
      icon: TrendingUp,
      name: 'الاتجاهات',
      count: 124,
      color: '#FFB84D'
    }
  ];

  return (
    <div className="flex-1 overflow-hidden bg-gray-50">
      <div className="h-full p-6 overflow-y-auto" dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">التقارير والتحليلات</h1>
            <p className="text-gray-600">عرض وتصدير التقارير التفصيلية للأداء والتخطيط</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {chartTypes.map((chart, index) => (
              <motion.div
                key={chart.name}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${chart.color}20` }}
                  >
                    <chart.icon className="w-6 h-6" style={{ color: chart.color }} />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{chart.count}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">{chart.name}</h3>
              </motion.div>
            ))}
          </div>

          {/* Generate Report Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[#00AEEF] to-[#0088CC] rounded-2xl p-6 mb-6 text-white"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">إنشاء تقرير جديد</h2>
                <p className="text-white/90 mb-4">
                  اختر الفترة الزمنية ونوع التقرير للحصول على تحليل شامل
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <select className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50">
                    <option className="text-gray-900">تقرير شهري</option>
                    <option className="text-gray-900">تقرير ربع سنوي</option>
                    <option className="text-gray-900">تقرير سنوي</option>
                    <option className="text-gray-900">تقرير مخصص</option>
                  </select>

                  <select className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50">
                    <option className="text-gray-900">أبريل 2026</option>
                    <option className="text-gray-900">مارس 2026</option>
                    <option className="text-gray-900">فبراير 2026</option>
                    <option className="text-gray-900">يناير 2026</option>
                  </select>

                  <button className="px-4 py-2 rounded-lg bg-white text-[#00AEEF] font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    إنشاء التقرير
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Reports List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">التقارير المتاحة</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    تصفية
                  </button>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {reports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  className="p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <FileText className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{report.title}</h4>
                          {report.status === 'ready' && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                              جاهز
                            </span>
                          )}
                          {report.status === 'processing' && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse" />
                              قيد الإنشاء
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {report.date}
                          </span>
                          {report.status === 'ready' && (
                            <>
                              <span>•</span>
                              <span>{report.size}</span>
                              <span>•</span>
                              <span>{report.pages} صفحة</span>
                            </>
                          )}
                        </div>

                        {report.type === 'annual' && (
                          <div className="mt-2 flex gap-2">
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                              تقرير سنوي
                            </span>
                          </div>
                        )}
                        {report.type === 'quarterly' && (
                          <div className="mt-2 flex gap-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              تقرير ربع سنوي
                            </span>
                          </div>
                        )}
                        {report.type === 'monthly' && (
                          <div className="mt-2 flex gap-2">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                              تقرير شهري
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {report.status === 'ready' && (
                        <>
                          <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors group">
                            <Download className="w-5 h-5 text-gray-600 group-hover:text-[#00AEEF]" />
                          </button>
                          <button className="px-4 py-2 rounded-lg bg-[#00AEEF] text-white text-sm font-medium hover:bg-[#0088CC] transition-colors">
                            عرض
                          </button>
                        </>
                      )}
                      {report.status === 'processing' && (
                        <button className="px-4 py-2 rounded-lg bg-gray-200 text-gray-500 text-sm font-medium cursor-not-allowed">
                          معالجة...
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Analytics Summary */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 grid grid-cols-2 gap-4"
          >
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">الاتجاهات الرئيسية</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">تحسن حركة المرور</span>
                  <span className="text-sm font-bold text-green-600">+18%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">تقليل الانبعاثات</span>
                  <span className="text-sm font-bold text-green-600">-24%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">رضا المواطنين</span>
                  <span className="text-sm font-bold text-blue-600">82%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">الأولويات التالية</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00AEEF]"></div>
                  <span className="text-sm text-gray-700">تحديث تقرير مارس</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00AEEF]"></div>
                  <span className="text-sm text-gray-700">مراجعة البيانات الربع سنوية</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00AEEF]"></div>
                  <span className="text-sm text-gray-700">تجهيز التقرير السنوي 2026</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
