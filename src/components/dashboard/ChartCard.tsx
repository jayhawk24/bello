import React from 'react';
import { ChartData } from '@/types';

interface ChartCardProps {
    title: string;
    data: ChartData;
    type?: 'bar' | 'line' | 'pie';
    height?: number;
}

export const ChartCard: React.FC<ChartCardProps> = ({ 
    title, 
    data, 
    type = 'bar', 
    height = 300 
}) => {
    // This is a placeholder component for chart visualization
    // In a real implementation, you would use a charting library like Chart.js, Recharts, or D3.js
    
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            
            <div 
                className="flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300"
                style={{ height: `${height}px` }}
            >
                <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="text-gray-600 font-medium">{title}</p>
                    <p className="text-sm text-gray-500 mt-1">
                        Chart ({type}) - {data.datasets.length} dataset(s)
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        Integrate with Chart.js or similar library
                    </p>
                </div>
            </div>

            {/* Legend */}
            {data.datasets.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-4">
                    {data.datasets.map((dataset, index) => (
                        <div key={index} className="flex items-center">
                            <div 
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ 
                                    backgroundColor: Array.isArray(dataset.backgroundColor) 
                                        ? dataset.backgroundColor[0] 
                                        : dataset.backgroundColor || '#3B82F6'
                                }}
                            ></div>
                            <span className="text-sm text-gray-600">{dataset.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
