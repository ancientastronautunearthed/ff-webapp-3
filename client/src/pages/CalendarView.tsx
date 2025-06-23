import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Calendar, DayDetail } from '@/components/Calendar';
import { CalendarHeatmap } from '@/components/CalendarHeatmap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, TrendingUp, Plus, Eye } from 'lucide-react';
import { useLocation } from 'wouter';

export default function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [location, navigate] = useLocation();

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddEntry = (date: Date) => {
    // Navigate to symptom tracker with pre-selected date
    navigate('/tracker');
  };

  const handleViewEntry = (entryId: string, type: 'symptom' | 'journal') => {
    // Navigate to specific entry view
    navigate(type === 'symptom' ? '/tracker' : '/journal');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <CalendarIcon className="h-8 w-8 text-primary-600" />
                Health Calendar
              </h1>
              <p className="text-gray-600 mt-2">
                Visual overview of your health tracking journey with symptom patterns and journal entries.
              </p>
            </div>
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Monthly View
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Yearly Heatmap
            </TabsTrigger>
          </TabsList>

          {/* Monthly Calendar View */}
          <TabsContent value="calendar" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Calendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  onAddEntry={handleAddEntry}
                />
              </div>

              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      onClick={() => navigate('/tracker')} 
                      className="w-full justify-start"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Symptom Entry
                    </Button>
                    <Button 
                      onClick={() => navigate('/journal')} 
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Journal Entry
                    </Button>
                    <Button 
                      onClick={() => navigate('/insights')} 
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>

                {/* Day Detail */}
                {selectedDate && (
                  <DayDetail 
                    date={selectedDate} 
                    onClose={() => setSelectedDate(null)}
                  />
                )}

                {/* Calendar Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Calendar Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                      <span>Red dots indicate symptom entries for that day</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <span>Blue dots show journal entries</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-3 h-3 rounded bg-red-200 mt-1.5 flex-shrink-0" />
                      <span>Background colors show average symptom intensity</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CalendarIcon className="h-4 w-4 mt-1 flex-shrink-0 text-primary-500" />
                      <span>Click any date to view details or add entries</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Yearly Heatmap View */}
          <TabsContent value="heatmap" className="space-y-6">
            <CalendarHeatmap />
            
            {/* Additional Year Navigation */}
            <Card>
              <CardHeader>
                <CardTitle>Year Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 flex-wrap">
                  {[2024, 2025, 2026].map(year => (
                    <Button key={year} variant="outline" size="sm">
                      {year}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}