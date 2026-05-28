import React from 'react';
import { Plus, Minus } from 'lucide-react';

function NumericInput({ 
  value, 
  onChange, 
  min = 0, 
  max = 999999, 
  step = 1, 
  label = '', 
  className = '', 
  required = false 
}) {
  
  const handleIncrement = () => {
    const newVal = Math.min(max, (Number(value) || 0) + step);
    onChange(newVal);
  };

  const handleDecrement = () => {
    const newVal = Math.max(min, (Number(value) || 0) - step);
    onChange(newVal);
  };

  const handleChange = (e) => {
    const val = e.target.value === '' ? '' : Number(e.target.value);
    if (val === '') {
      onChange('');
    } else if (!isNaN(val)) {
      onChange(Math.min(max, Math.max(min, val)));
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-dense-xs font-semibold text-slate-600 select-none">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex border border-slate-300 bg-white">
        {/* Decrement Button */}
        <button
          type="button"
          onClick={handleDecrement}
          className="flex h-9 w-9 shrink-0 items-center justify-center border-r border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          <Minus className="h-4 w-4" />
        </button>

        {/* Real Input */}
        <input
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          className="h-9 w-full text-center text-dense-base font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />

        {/* Increment Button */}
        <button
          type="button"
          onClick={handleIncrement}
          className="flex h-9 w-9 shrink-0 items-center justify-center border-l border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default NumericInput;
