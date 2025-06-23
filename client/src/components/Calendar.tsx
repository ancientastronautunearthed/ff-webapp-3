import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSymptomEntries } from '@/hooks/useSymptomData';
import { useJournalEntries } from '@/hooks/useJournalData';

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
  onAddEntry?: (date: Date) => void;
  selectedDate?: Date;
}

export const Calendar = ({ onDateSelect, onAddEntry, selectedDate }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: symptomEntries } = useSymptomEntries();
  const { data: journalEntries } = useJournalEntries();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get entries for each day
  const getEntriesForDate = (date: Date) => {
    const symptoms = symptomEntries?.filter(entry => 
      isSameDay(new Date(entry.date), date)
    ) || [];
    
    const journals = journalEntries?.filter(entry => 
      isSameDay(new Date(entry.createdAt), date)
    ) || [];

    return { symptoms, journals };
  };

  // Get symptom intensity for heatmap
  const getSymptomIntensity = (date: Date) => {
    const dayEntries = symptomEntries?.filter(entry => 
      isSameDay(new Date(entry.date), date)
    ) || [];

    if (dayEntries.length === 0) return null;

    const avgIntensity = dayEntries.reduce((sum, entry) => {
      const symptoms = entry.symptoms as any;
      return sum + (symptoms?.itchingIntensity || 0);
    }, 0) / dayEntries.length;

    return avgIntensity;
  };

  const getIntensityColor = (intensity: number | null) => {
    if (!intensity) return '';
    if (intensity <= 3) return 'bg-green-200 text-green-800';
    if (intensity <= 6) return 'bg-yellow-200 text-yellow-800';
    if (intensity <= 8) return 'bg-orange-200 text-orange-800';
    return 'bg-red-200 text-red-800';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDateClick = (date: Date) => {
    onDateSelect?.(date);
  };

  const handleAddClick = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddEntry?.(date);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Health Tracking Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold min-w-[140px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {daysInMonth.map(date => {
            const { symptoms, journals } = getEntriesForDate(date);
            const intensity = getSymptomIntensity(date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isCurrentMonth = isSameMonth(date, currentDate);

            return (
              <div
                key={date.toISOString()}
                className={`
                  relative p-2 min-h-[80px] border rounded-lg cursor-pointer transition-colors
                  ${isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:bg-gray-50'}
                  ${!isCurrentMonth ? 'opacity-30' : ''}
                  ${isToday(date) ? 'border-primary-500 bg-primary-25' : 'border-gray-200'}
                  ${intensity ? getIntensityColor(intensity) : ''}
                `}
                onClick={() => handleDateClick(date)}
              >
                {/* Date Number */}
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${isToday(date) ? 'text-primary-700' : ''}`}>
                    {format(date, 'd')}
                  </span>
                  {isCurrentMonth && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                      onClick={(e) => handleAddClick(date, e)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Entry Indicators */}
                <div className="space-y-1">
                  {symptoms.length > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-xs text-gray-600">{symptoms.length} symptom{symptoms.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {journals.length > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-xs text-gray-600">{journals.length} journal{journals.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                {/* Intensity Badge */}
                {intensity && intensity > 0 && (
                  <Badge 
                    variant="secondary" 
                    className={`absolute top-1 right-1 text-xs px-1 py-0 ${getIntensityColor(intensity)}`}
                  >
                    {intensity.toFixed(1)}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Symptom Entry</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Journal Entry</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-200" />
            <span>Low intensity (1-3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-200" />
            <span>Moderate (4-6)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-200" />
            <span>High (7-10)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Day Detail Component for showing entries on selected date
interface DayDetailProps {
  date: Date;
  onClose: () => void;
}

export const DayDetail = ({ date, onClose }: DayDetailProps) => {
  const { data: symptomEntries } = useSymptomEntries();
  const { data: journalEntries } = useJournalEntries();

  const daySymptoms = symptomEntries?.filter(entry => 
    isSameDay(new Date(entry.date), date)
  ) || [];

  const dayJournals = journalEntries?.filter(entry => 
    isSameDay(new Date(entry.createdAt), date)
  ) || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {format(date, 'EEEE, MMMM d, yyyy')}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Symptom Entries */}
        {daySymptoms.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              Symptom Entries ({daySymptoms.length})
            </h3>
            <div className="space-y-3">
              {daySymptoms.map(entry => {
                const symptoms = entry.symptoms as any;
                return (
                  <div key={entry.id} className="p-4 border rounded-lg bg-red-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Itching Intensity: {symptoms?.itchingIntensity || 0}/10</span>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-gray-600">{entry.notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Journal Entries */}
        {dayJournals.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              Journal Entries ({dayJournals.length})
            </h3>
            <div className="space-y-3">
              {dayJournals.map(entry => (
                <div key={entry.id} className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{entry.title}</h4>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{entry.content}</p>
                  {entry.mediaUrls && entry.mediaUrls.length > 0 && (
                    <div className="mt-2 text-xs text-blue-600">
                      📸 {entry.mediaUrls.length} media file{entry.mediaUrls.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Entries */}
        {daySymptoms.length === 0 && dayJournals.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No entries recorded for this date</p>
            <Button className="mt-4" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};