import React from 'react';

const colorStyles = {
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    border: 'border-indigo-100',
    badge: 'bg-indigo-100 text-indigo-700'
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
    badge: 'bg-emerald-100 text-emerald-700'
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-100',
    badge: 'bg-amber-100 text-amber-700'
  },
  sky: {
    bg: 'bg-sky-50',
    text: 'text-sky-600',
    border: 'border-sky-100',
    badge: 'bg-sky-100 text-sky-700'
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-100',
    badge: 'bg-rose-100 text-rose-700'
  }
};

const StatCard = ({ title, value, icon: Icon, color = 'indigo', subtitle, badge }) => {
  const styles = colorStyles[color] || colorStyles.indigo;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-slate-500">{title}</span>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${styles.bg} ${styles.text}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        {badge && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles.badge}`}>
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-2 text-xs text-slate-400 font-medium">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
