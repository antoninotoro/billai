
import React from 'react';

interface DataCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  colorClass: string;
}

const DataCard: React.FC<DataCardProps> = ({ label, value, unit, icon, colorClass }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
          <i className={`${icon} ${colorClass.replace('bg-', 'text-')} text-xl`}></i>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-xl font-bold text-slate-900">
            {value} <span className="text-sm font-normal text-slate-400">{unit}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataCard;
