import React from 'react';
import { SelectProps } from '@/types';

export const Select: React.FC<SelectProps> = ({
    label,
    options,
    value,
    onChange,
    error,
    required = false,
    disabled = false,
    placeholder,
    className = ''
}) => {
    const baseClasses = 'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-minion-yellow focus:border-transparent transition-colors';
    const errorClasses = error ? 'border-red-500' : 'border-gray-300';
    const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';
    
    const selectClasses = `${baseClasses} ${errorClasses} ${disabledClasses} ${className}`;

    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <select
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                required={required}
                disabled={disabled}
                className={selectClasses}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};
