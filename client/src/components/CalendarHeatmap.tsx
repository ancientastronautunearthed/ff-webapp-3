import { useMemo } from 'react';
import { format, eachDayOfInterval, startOfYear, endOfYear, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSymptomEntries } from '@/hooks/useSymptomData';

interface CalendarHeatmapProps {
  year?: number;
}

export const CalendarHeatmap = ({ year = new Date().getFullYear() }: CalendarHeatmapProps) => {
  const { data: symptomEntries } = useSymptomEntries();

  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 0, 1));
  const daysInYear = eachDayOfInterval({ start: yearStart, end: yearEnd });

  const intensityData = useMemo(() => {
    return daysInYear.map(date => {
      const dayEntries = symptomEntries?.filter(entry => 
        isSameDay(new Date(entry.date), date)
      ) || [];

      if (dayEntries.length === 0) return { date, intensity: null, count: 0 };

      const avgIntensity = dayEntries.reduce((sum, entry) => {
        const symptoms = entry.symptoms as any;
        return sum + (symptoms?.itchingIntensity || 0);
      }, 0) / dayEntries.length;

      return { date, intensity: avgIntensity, count: dayEntries.length };
    });
  }, [symptomEntries, daysInYear]);

  const getIntensityColor = (intensity: number | null) => {
    if (!intensity) return 'bg-gray-100';
    if (intensity <= 2) return 'bg-green-200';
    if (intensity <= 4) return 'bg-green-400';
    if (intensity <= 6) return 'bg-yellow-400';
    if (intensity <= 8) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const getIntensityLabel = (intensity: number | null) => {
    if (!intensity) return 'No data';
    if (intensity <= 2) return 'Very Low';
    if (intensity <= 4) return 'Low';
    if (intensity <= 6) return 'Moderate';
    if (intensity <= 8) return 'High';
    return 'Very High';
  };

  // Group days into weeks
  const weeks = [];
  for (let i = 0; i < intensityData.length; i += 7) {
    weeks.push(intensityData.slice(i, i + 7));
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Symptom Intensity Heatmap - {year}</CardTitle>
        <p className="text-sm text-gray-600">
          Visual overview of symptom intensity throughout the year. Darker colors indicate higher intensity.
        </p>
      </CardHeader>

      <CardContent>
        {/* Month Labels */}
        <div className="flex justify-between mb-2 text-xs text-gray-500">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i}>{format(new Date(year, i, 1), 'MMM')}</span>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-53 gap-1 mb-4">
          {intensityData.map(({ date, intensity, count }, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity)} cursor-pointer transition-all hover:scale-110 hover:shadow-sm`}
              title={`${format(date, 'MMM d, yyyy')}: ${getIntensityLabel(intensity)} ${intensity ? `(${intensity.toFixed(1)})` : ''} ${count > 0 ? `- ${count} entries` : ''}`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-100" />
              <div className="w-3 h-3 rounded-sm bg-green-200" />
              <div className="w-3 h-3 rounded-sm bg-green-400" />
              <div className="w-3 h-3 rounded-sm bg-yellow-400" />
              <div className="w-3 h-3 rounded-sm bg-orange-400" />
              <div className="w-3 h-3 rounded-sm bg-red-500" />
            </div>
            <span>More</span>
          </div>

          <div className="text-sm text-gray-500">
            {intensityData.filter(d => d.count > 0).length} days tracked
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-800">
              {intensityData.filter(d => d.count > 0).length}
            </div>
            <div className="text-sm text-gray-600">Days Tracked</div>
          </div>

          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-800">
              {intensityData.filter(d => d.intensity && d.intensity <= 3).length}
            </div>
            <div className="text-sm text-green-600">Good Days</div>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-800">
              {intensityData.filter(d => d.intensity && d.intensity > 3 && d.intensity <= 6).length}
            </div>
            <div className="text-sm text-yellow-600">Moderate Days</div>
          </div>

          <div className="bg-red-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-800">
              {intensityData.filter(d => d.intensity && d.intensity > 6).length}
            </div>
            <div className="text-sm text-red-600">Difficult Days</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};