import React from 'react';
import { SimpleHeart3D } from './SimpleHeart3D';
import { Heart } from 'lucide-react';

interface HeartWidgetProps {
  className?: string;
  heartRate?: number;
}

export const HeartWidget: React.FC<HeartWidgetProps> = ({
  className = '',
  heartRate = 72
}) => {
  return (
    <div className={`bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 rounded-lg border border-red-200 dark:border-red-800 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold flex items-center">
          <Heart className="w-4 h-4 mr-2 text-red-500" />
          3D Heart Monitor
        </h4>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-red-600 font-medium">{Math.round(heartRate)} BPM</span>
        </div>
      </div>
      
      {/* Mini 3D Heart - Keep smaller for widget */}
      <div className="h-32 mb-3 relative overflow-hidden">
        <SimpleHeart3D 
          heartRate={Math.round(heartRate)}
          height="h-full"
          heightPx={128}
          width={300}
          className="border-0 bg-transparent"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Status:</span>
          <span className={`font-semibold ${
            Math.round(heartRate) < 60 ? 'text-blue-600' : 
            Math.round(heartRate) > 100 ? 'text-red-600' : 
            'text-green-600'
          }`}>
            {Math.round(heartRate) < 60 ? 'Low' : Math.round(heartRate) > 100 ? 'High' : 'Normal'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Animation:</span>
          <span className="font-semibold text-green-600">Live</span>
        </div>
      </div>
    </div>
  );
};

export default HeartWidget;