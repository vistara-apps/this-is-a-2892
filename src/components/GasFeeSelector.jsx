import React from 'react';
import { Zap, Clock, Timer } from 'lucide-react';

const GAS_LEVELS = [
  {
    id: 'low',
    name: 'Slow',
    description: '~10-15 min',
    fee: '0.002 ETH',
    icon: Clock,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    id: 'medium',
    name: 'Standard',
    description: '~3-5 min',
    fee: '0.004 ETH',
    icon: Timer,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'high',
    name: 'Fast',
    description: '~1-2 min',
    fee: '0.008 ETH',
    icon: Zap,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  }
];

const GasFeeSelector = ({ selected, onSelect }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-text mb-3">
        Gas Fee (Transaction Speed)
      </label>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {GAS_LEVELS.map((level) => {
          const Icon = level.icon;
          const isSelected = selected === level.id;
          
          return (
            <button
              key={level.id}
              onClick={() => onSelect(level.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? `${level.borderColor} ${level.bgColor}`
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${isSelected ? level.color : 'text-gray-400'}`} />
                <span className={`text-xs font-medium ${isSelected ? level.color : 'text-gray-500'}`}>
                  {level.fee}
                </span>
              </div>
              
              <div>
                <h4 className={`font-medium text-sm ${isSelected ? level.color : 'text-gray-700'}`}>
                  {level.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {level.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GasFeeSelector;