import { motion } from 'motion/react';
import { User, Bell, Shield, Globe, Database, Zap, ChevronLeft } from 'lucide-react';

export function SettingsScreen() {
  const settingsSections = [
    {
      icon: User,
      title: 'الحساب والملف الشخصي',
      description: 'إدارة معلومات المستخدم والصلاحيات',
      color: '#00AEEF'
    },
    {
      icon: Bell,
      title: 'الإشعارات والتنبيهات',
      description: 'تخصيص تفضيلات التنبيهات',
      color: '#FFB84D'
    },
    {
      icon: Shield,
      title: 'الأمان والخصوصية',
      description: 'إعدادات الأمان وحماية البيانات',
      color: '#4CAF50'
    },
    {
      icon: Globe,
      title: 'اللغة والمنطقة',
      description: 'تغيير اللغة والإعدادات الإقليمية',
      color: '#A78BFA'
    },
    {
      icon: Database,
      title: 'إدارة البيانات',
      description: 'استيراد وتصدير ونسخ احتياطي',
      color: '#FF6B6B'
    },
    {
      icon: Zap,
      title: 'التكاملات والAPI',
      description: 'ربط الأنظمة الخارجية',
      color: '#10B981'
    }
  ];

  return (
    <div className="flex-1 overflow-hidden bg-gray-50">
      <div className="h-full p-6 overflow-y-auto" dir="rtl">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">الإعدادات</h1>
            <p className="text-gray-600">إدارة تفضيلات النظام والحساب</p>
          </div>

          {/* User Profile Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00AEEF] to-[#0088CC] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                H
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">Hasan Ahmad</h2>
                <p className="text-gray-600">Municipality Planner</p>
                <p className="text-sm text-gray-500 mt-1">hasan.ahmad@hebron-municipality.ps</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors">
                تعديل الملف الشخصي
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">47</p>
                <p className="text-xs text-gray-500">محاكاة منجزة</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-xs text-gray-500">تقرير تم إنشاؤه</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">156</p>
                <p className="text-xs text-gray-500">يوم نشط</p>
              </div>
            </div>
          </motion.div>

          {/* Settings Sections */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {settingsSections.map((section, index) => (
              <motion.button
                key={section.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-all group text-right"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${section.color}20` }}
                  >
                    <section.icon className="w-6 h-6" style={{ color: section.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#00AEEF] transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-[#00AEEF] transition-colors" />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Quick Settings */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <h3 className="font-semibold text-gray-900 mb-4">الإعدادات السريعة</h3>

            <div className="space-y-4">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h4 className="font-medium text-gray-900">الوضع الداكن</h4>
                  <p className="text-sm text-gray-500">تفعيل المظهر الداكن للنظام</p>
                </div>
                <button className="relative w-11 h-6 rounded-full bg-gray-300 transition-colors">
                  <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform"></span>
                </button>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h4 className="font-medium text-gray-900">إشعارات سطح المكتب</h4>
                  <p className="text-sm text-gray-500">استقبال تنبيهات على سطح المكتب</p>
                </div>
                <button className="relative w-11 h-6 rounded-full bg-[#00AEEF] transition-colors">
                  <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform"></span>
                </button>
              </div>

              {/* Auto Save */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h4 className="font-medium text-gray-900">الحفظ التلقائي</h4>
                  <p className="text-sm text-gray-500">حفظ التغييرات تلقائياً</p>
                </div>
                <button className="relative w-11 h-6 rounded-full bg-[#00AEEF] transition-colors">
                  <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform"></span>
                </button>
              </div>

              {/* Map Quality */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="font-medium text-gray-900">جودة الخريطة</h4>
                  <p className="text-sm text-gray-500">اختر جودة عرض الخريطة ثلاثية الأبعاد</p>
                </div>
                <select className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00AEEF]">
                  <option>عالية</option>
                  <option>متوسطة</option>
                  <option>منخفضة</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* System Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white"
          >
            <h3 className="font-semibold mb-4">معلومات النظام</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-1">الإصدار</p>
                <p className="font-mono">v2.5.3</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">آخر تحديث</p>
                <p>10 أبريل 2026</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">البيئة</p>
                <p>Production</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">وقت التشغيل</p>
                <p>15 يوم 7 ساعات</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <p className="text-sm text-gray-300">© 2026 Hebron Municipality • Digital Twin Platform</p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors">
                  الدعم الفني
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors">
                  التوثيق
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
