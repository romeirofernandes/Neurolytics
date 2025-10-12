import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Upload, X } from 'lucide-react';

export const TrialEditor = ({ trial, onSave, onCancel }) => {
  const [formData, setFormData] = useState(trial || {});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setFormData(trial || {});
  }, [trial]);

  const handleUpload = async (file, type = 'image') => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        return data.data.url;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e, field) => {
    const file = e.target.files[0];
    if (file) {
      let type = 'image';
      if (file.type.startsWith('audio/')) type = 'audio';
      if (file.type.startsWith('video/')) type = 'video';
      
      const url = await handleUpload(file, type);
      if (url) {
        setFormData({ ...formData, [field]: url });
      }
    }
  };

  const renderEditor = () => {
    switch (formData.type) {
      case 'stimulus':
        return (
          <div className="space-y-4">
            <div>
              <Label>Stimulus Type</Label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={formData.stimulusType || 'image'}
                onChange={(e) => setFormData({ ...formData, stimulusType: e.target.value })}
              >
                <option value="image">Image</option>
                <option value="text">Text</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
              </select>
            </div>

            {formData.stimulusType === 'image' && (
              <div>
                <Label>Image Upload</Label>
                <div className="mt-2">
                  {formData.content ? (
                    <div className="relative">
                      <img src={formData.content} alt="Stimulus" className="max-w-full h-48 object-contain border rounded" />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setFormData({ ...formData, content: '' })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'content')}
                        disabled={uploading}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {formData.stimulusType === 'text' && (
              <div>
                <Label>Text Content</Label>
                <textarea
                  className="w-full p-2 border rounded-md bg-background min-h-[100px]"
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter text to display"
                />
              </div>
            )}

            <div>
              <Label>Duration (ms)</Label>
              <Input
                type="number"
                value={formData.duration || 1000}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <Label>Position</Label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={formData.position || 'center'}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              >
                <option value="center">Center</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        );

      case 'response':
        return (
          <div className="space-y-4">
            <div>
              <Label>Response Type</Label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={formData.responseType || 'keyboard'}
                onChange={(e) => setFormData({ ...formData, responseType: e.target.value })}
              >
                <option value="keyboard">Keyboard</option>
                <option value="mouse">Mouse Click</option>
                <option value="button">Button</option>
              </select>
            </div>

            <div>
              <Label>Valid Keys (comma-separated)</Label>
              <Input
                value={formData.choices?.join(', ') || 'f, j'}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  choices: e.target.value.split(',').map(k => k.trim()) 
                })}
              />
            </div>

            <div>
              <Label>Timeout (ms, 0 for no timeout)</Label>
              <Input
                type="number"
                value={formData.timeout || 2000}
                onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <Label>Correct Response (optional)</Label>
              <Input
                value={formData.correctResponse || ''}
                onChange={(e) => setFormData({ ...formData, correctResponse: e.target.value })}
                placeholder="Leave empty if no correct answer"
              />
            </div>
          </div>
        );

      case 'instruction':
        return (
          <div className="space-y-4">
            <div>
              <Label>Instruction Text</Label>
              <textarea
                className="w-full p-2 border rounded-md bg-background min-h-[150px]"
                value={formData.text || ''}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Enter instructions for participants"
              />
            </div>

            <div>
              <Label>Button Text</Label>
              <Input
                value={formData.buttonText || 'Continue'}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
              />
            </div>
          </div>
        );

      case 'fixation':
        return (
          <div className="space-y-4">
            <div>
              <Label>Symbol</Label>
              <Input
                value={formData.symbol || '+'}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                maxLength={3}
              />
            </div>

            <div>
              <Label>Duration (ms)</Label>
              <Input
                type="number"
                value={formData.duration || 500}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <Label>Size (px)</Label>
              <Input
                type="number"
                value={formData.size || 40}
                onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) })}
              />
            </div>
          </div>
        );

      case 'feedback':
        return (
          <div className="space-y-4">
            <div>
              <Label>Correct Message</Label>
              <Input
                value={formData.correctText || 'Correct!'}
                onChange={(e) => setFormData({ ...formData, correctText: e.target.value })}
              />
            </div>

            <div>
              <Label>Incorrect Message</Label>
              <Input
                value={formData.incorrectText || 'Incorrect'}
                onChange={(e) => setFormData({ ...formData, incorrectText: e.target.value })}
              />
            </div>

            <div>
              <Label>Duration (ms)</Label>
              <Input
                type="number"
                value={formData.duration || 1000}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.showAccuracy || false}
                onChange={(e) => setFormData({ ...formData, showAccuracy: e.target.checked })}
                className="rounded"
              />
              <Label>Show Running Accuracy</Label>
            </div>
          </div>
        );

      case 'survey':
        return (
          <div className="space-y-4">
            <div>
              <Label>Question</Label>
              <textarea
                className="w-full p-2 border rounded-md bg-background min-h-[100px]"
                value={formData.question || ''}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              />
            </div>

            <div>
              <Label>Question Type</Label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={formData.questionType || 'likert'}
                onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
              >
                <option value="likert">Likert Scale</option>
                <option value="multiple-choice">Multiple Choice</option>
                <option value="text">Text Response</option>
                <option value="rating">Rating (1-10)</option>
              </select>
            </div>

            {formData.questionType === 'multiple-choice' && (
              <div>
                <Label>Options (comma-separated)</Label>
                <Input
                  value={formData.options?.join(', ') || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    options: e.target.value.split(',').map(o => o.trim()) 
                  })}
                />
              </div>
            )}
          </div>
        );

      default:
        return <p className="text-muted-foreground">Select a block type to edit</p>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Trial Block</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Block Name</Label>
          <Input
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Stimulus Presentation"
          />
        </div>

        {renderEditor()}

        <div className="flex gap-2 pt-4">
          <Button onClick={() => onSave(formData)} className="flex-1">
            Save Changes
          </Button>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};