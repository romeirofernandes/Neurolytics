import React, { useState, useEffect } from 'react';
import { SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Upload, X, Loader2, Image as ImageIcon, Music, Video } from 'lucide-react';

const NodeEditor = ({ node, onSave, onCancel }) => {
  const [formData, setFormData] = useState(node.data.config || {});
  const [label, setLabel] = useState(node.data.label || '');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    setFormData(node.data.config || {});
    setLabel(node.data.label || '');
  }, [node]);

  const handleUpload = async (file, type = 'image') => {
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      });

      const data = await response.json();
      
      if (data.success) {
        setUploadProgress(100);
        return data.data.url;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file: ' + error.message);
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
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

  const handleSave = () => {
    onSave({
      label,
      config: formData,
    });
  };

  const renderEditor = () => {
    switch (node.data.blockType) {
      case 'stimulus':
        return (
          <div className="space-y-4">
            <div>
              <Label>Stimulus Type</Label>
              <select
                className="w-full p-2 border rounded-md bg-background mt-1"
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
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mb-3">Upload an image stimulus</p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'content')}
                        disabled={uploading}
                        className="cursor-pointer"
                      />
                      {uploading && (
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-xs">Uploading... {uploadProgress}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {formData.stimulusType === 'video' && (
              <div>
                <Label>Video Upload</Label>
                <div className="mt-2">
                  {formData.content ? (
                    <div className="relative">
                      <video src={formData.content} controls className="max-w-full h-48 border rounded" />
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
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Video className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mb-3">Upload a video stimulus (max 50MB)</p>
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileChange(e, 'content')}
                        disabled={uploading}
                        className="cursor-pointer"
                      />
                      {uploading && (
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-xs">Uploading... {uploadProgress}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {formData.stimulusType === 'audio' && (
              <div>
                <Label>Audio Upload</Label>
                <div className="mt-2">
                  {formData.content ? (
                    <div className="relative border rounded-lg p-4">
                      <audio src={formData.content} controls className="w-full" />
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
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Music className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mb-3">Upload an audio stimulus</p>
                      <Input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => handleFileChange(e, 'content')}
                        disabled={uploading}
                        className="cursor-pointer"
                      />
                      {uploading && (
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-xs">Uploading... {uploadProgress}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {formData.stimulusType === 'text' && (
              <div>
                <Label>Text Content</Label>
                <textarea
                  className="w-full p-3 border rounded-md bg-background min-h-[120px] mt-1"
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
                className="mt-1"
              />
            </div>

            <div>
              <Label>Position</Label>
              <select
                className="w-full p-2 border rounded-md bg-background mt-1"
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
                className="w-full p-2 border rounded-md bg-background mt-1"
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
                placeholder="e.g., f, j, space"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Timeout (ms, 0 = no timeout)</Label>
              <Input
                type="number"
                value={formData.timeout || 2000}
                onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Correct Response (optional)</Label>
              <Input
                value={formData.correctResponse || ''}
                onChange={(e) => setFormData({ ...formData, correctResponse: e.target.value })}
                placeholder="Leave empty if no correct answer"
                className="mt-1"
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
                className="w-full p-3 border rounded-md bg-background min-h-[150px] mt-1"
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
                className="mt-1"
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
                className="mt-1"
              />
            </div>

            <div>
              <Label>Duration (ms)</Label>
              <Input
                type="number"
                value={formData.duration || 500}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Size (px)</Label>
              <Input
                type="number"
                value={formData.size || 40}
                onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) })}
                className="mt-1"
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
                className="mt-1"
              />
            </div>

            <div>
              <Label>Incorrect Message</Label>
              <Input
                value={formData.incorrectText || 'Incorrect'}
                onChange={(e) => setFormData({ ...formData, incorrectText: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Duration (ms)</Label>
              <Input
                type="number"
                value={formData.duration || 1000}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <input
                type="checkbox"
                checked={formData.showAccuracy || false}
                onChange={(e) => setFormData({ ...formData, showAccuracy: e.target.checked })}
                className="rounded"
              />
              <Label className="cursor-pointer">Show Running Accuracy</Label>
            </div>
          </div>
        );

      case 'survey':
        return (
          <div className="space-y-4">
            <div>
              <Label>Question</Label>
              <textarea
                className="w-full p-3 border rounded-md bg-background min-h-[100px] mt-1"
                value={formData.question || ''}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Enter your survey question"
              />
            </div>

            <div>
              <Label>Question Type</Label>
              <select
                className="w-full p-2 border rounded-md bg-background mt-1"
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
                  placeholder="e.g., Option 1, Option 2, Option 3"
                  className="mt-1"
                />
              </div>
            )}
          </div>
        );

      case 'conditional':
        return (
          <div className="space-y-4">
            <div>
              <Label>Condition</Label>
              <Input
                value={formData.condition || 'accuracy > 0.7'}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                placeholder="e.g., accuracy > 0.7 or responseTime < 500"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use variables like accuracy, responseTime, trialCount
              </p>
            </div>
          </div>
        );

      default:
        return <p className="text-muted-foreground">Select a block type to edit</p>;
    }
  };

  return (
    <>
      <SheetHeader className="mb-6">
        <SheetTitle>Edit Node</SheetTitle>
        <SheetDescription>
          Configure the properties of this experiment block
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-6">
        <div>
          <Label>Node Label</Label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., Stimulus Presentation"
            className="mt-1"
          />
        </div>

        <div>
          <Label>Block Type</Label>
          <div className="mt-1">
            <Badge className="capitalize">{node.data.blockType}</Badge>
          </div>
        </div>

        <div className="border-t pt-4">
          {renderEditor()}
        </div>

        <div className="flex gap-3 pt-6 border-t sticky bottom-0 bg-background pb-2">
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
};

export default NodeEditor;