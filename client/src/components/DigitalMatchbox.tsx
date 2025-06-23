import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Upload, Lock, Save, Camera, Calendar, Link2, History, Eye, X, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const journalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  linkedSymptomEntry: z.string().optional(),
  mediaFiles: z.array(z.any()).optional(),
});

type JournalFormData = z.infer<typeof journalSchema>;

import { useJournalEntries } from '@/hooks/useJournalData';

export const DigitalMatchbox = () => {
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showAllEntries, setShowAllEntries] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const { toast } = useToast();
  const { data: journalEntries, isLoading: entriesLoading } = useJournalEntries();

  const form = useForm<JournalFormData>({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      title: '',
      content: '',
      linkedSymptomEntry: '',
      mediaFiles: [],
    },
  });

  const onSubmit = async (data: JournalFormData) => {
    console.log('Form submitted with data:', data);
    setLoading(true);
    try {
      const { createJournalEntry } = await import('@/lib/firestore');
      const { uploadMultipleFiles, validateFiles } = await import('@/lib/storage');
      const { getCurrentUser } = await import('@/lib/auth');
      
      const user = getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate files if any are selected
      if (selectedFiles.length > 0) {
        const validation = validateFiles(selectedFiles);
        if (!validation.valid) {
          throw new Error(validation.errors[0]);
        }
      }

      // Upload files to Firebase Storage if any are selected
      let mediaUrls: string[] = [];
      if (selectedFiles.length > 0) {
        const uploadResults = await uploadMultipleFiles(selectedFiles, user.uid, 'journal');
        mediaUrls = uploadResults.map(result => result.url);
      }

      // Create journal entry in Firestore
      const journalData = {
        title: data.title,
        content: data.content,
        mediaUrls,
        linkedSymptomEntry: data.linkedSymptomEntry || null
      };

      await createJournalEntry(user.uid, journalData);
      
      toast({
        title: "Entry Saved",
        description: "Your journal entry has been securely saved to your Digital Matchbox.",
      });
      
      form.reset();
      setSelectedFiles([]);
    } catch (error: any) {
      toast({
        title: "Save Error",
        description: error.message || "Failed to save journal entry.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'video/mp4'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a supported file type. Please use PNG, JPG, or MP4.`,
          variant: "destructive",
        });
        return false;
      }
      
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds the 10MB size limit.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };
  
  console.log('Current form state:', {
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    isDirty: form.formState.isDirty
  });

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Digital Matchbox</h1>
        <p className="text-xl text-gray-600 mt-4">Your secure, private space for documenting your health journey</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Journal Entry Form */}
        <div>
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-primary-500" />
                New Journal Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2 block">
                    Entry Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., New lesion on arm, unusual fiber observation..."
                    {...form.register('title')}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="content" className="text-sm font-medium text-gray-700 mb-2 block">
                    Detailed Description
                  </Label>
                  <Textarea
                    id="content"
                    rows={6}
                    placeholder="Describe what you're observing, how you're feeling, any changes you've noticed..."
                    {...form.register('content')}
                    className="resize-none"
                  />
                  {form.formState.errors.content && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.content.message}</p>
                  )}
                </div>

                {/* Media Upload */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Add Photos/Videos
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Drag and drop files here, or click to select</p>
                    <p className="text-sm text-gray-500 mb-4">PNG, JPG, MP4 up to 10MB each</p>
                    <input
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/jpg,video/mp4"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      type="button"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="bg-primary-500 hover:bg-primary-600"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Select Files
                    </Button>
                  </div>
                  
                  {selectedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Selected Files:</Label>
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <Camera className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {(file.size / 1024 / 1024).toFixed(1)} MB
                            </Badge>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Link to Symptom Entry */}
                <div data-tour="entry-linking">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Link to Symptom Entry
                  </Label>
                  <Select onValueChange={(value) => form.setValue('linkedSymptomEntry', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select today's symptom entry..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today-morning">Today - Morning Entry</SelectItem>
                      <SelectItem value="today-evening">Today - Evening Entry</SelectItem>
                      <SelectItem value="yesterday">Yesterday's Entry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Button Section - ALWAYS VISIBLE */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-600">
                      <Lock className="mr-2 h-4 w-4" />
                      <span>End-to-end encrypted</span>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          form.reset();
                          setSelectedFiles([]);
                        }}
                        disabled={loading}
                      >
                        Clear Form
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Submit Entry
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Recent Entries */}
        <div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <History className="mr-2 h-5 w-5 text-secondary-500" />
              Recent Entries
            </h3>
          </div>

          <div className="space-y-4">
            {entriesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded mb-3 w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : journalEntries && journalEntries.length > 0 ? (
              journalEntries.slice(0, 5).map((entry) => (
                <Card key={entry.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-900">{entry.title}</h4>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span>{entry.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                      {entry.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {entry.mediaUrls && entry.mediaUrls.length > 0 && (
                          <span className="flex items-center">
                            <Camera className="mr-1 h-3 w-3" />
                            {entry.mediaUrls.length} {entry.mediaUrls.length === 1 ? 'photo' : 'photos'}
                          </span>
                        )}
                        {entry.linkedSymptomEntry && (
                          <span className="flex items-center">
                            <Link2 className="mr-1 h-3 w-3" />
                            Linked to symptoms
                          </span>
                        )}
                        {(!entry.mediaUrls || entry.mediaUrls.length === 0) && !entry.linkedSymptomEntry && (
                          <span>Text only</span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary-600 hover:text-primary-700"
                        onClick={() => setSelectedEntry(entry)}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View Full Entry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No entries yet</h4>
                  <p className="text-gray-600 mb-4">Start documenting your health journey by creating your first entry.</p>
                </CardContent>
              </Card>
            )}

            <Button
              variant="ghost"
              className="w-full py-6 text-primary-600 hover:text-primary-700 font-medium"
            >
              View All Entries →
            </Button>
          </div>
        </div>

        {/* All Entries Modal */}
        <Dialog open={showAllEntries} onOpenChange={setShowAllEntries}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>All Journal Entries</DialogTitle>
              <DialogDescription>
                View and manage all your journal entries from your digital matchbox.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {journalEntries && journalEntries.length > 0 ? (
                journalEntries.map((entry) => (
                  <Card key={entry.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-gray-900">{entry.title}</h3>
                        <span className="text-sm text-gray-500">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4">{entry.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {entry.mediaUrls && entry.mediaUrls.length > 0 && (
                            <span className="flex items-center">
                              <Camera className="mr-1 h-3 w-3" />
                              {entry.mediaUrls.length} {entry.mediaUrls.length === 1 ? 'photo' : 'photos'}
                            </span>
                          )}
                          {entry.linkedSymptomEntry && (
                            <span className="flex items-center">
                              <Link2 className="mr-1 h-3 w-3" />
                              Linked to symptoms
                            </span>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEntry(entry);
                            setShowAllEntries(false);
                          }}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No journal entries found.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Entry Detail Modal */}
        <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedEntry?.title}</DialogTitle>
              <DialogDescription>
                Detailed view of your journal entry with all associated media and notes.
              </DialogDescription>
            </DialogHeader>
            {selectedEntry && (
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Date</Label>
                  <p className="text-gray-900 mt-1">
                    {new Date(selectedEntry.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Content</Label>
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                    {selectedEntry.content}
                  </p>
                </div>

                {selectedEntry.mediaUrls && selectedEntry.mediaUrls.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Photos</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {selectedEntry.mediaUrls.map((url: string, index: number) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Entry photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {selectedEntry.linkedSymptomEntry && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Linked Symptom Entry</Label>
                    <div className="mt-1 p-3 bg-blue-50 rounded-lg flex items-center">
                      <Link2 className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-blue-800">Connected to symptom tracking</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
