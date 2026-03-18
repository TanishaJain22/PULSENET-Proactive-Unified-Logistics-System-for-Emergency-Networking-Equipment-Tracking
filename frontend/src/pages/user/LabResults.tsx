import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Download, Calendar, TrendingUp, AlertCircle, Eye, Trash2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';

// Define interfaces directly in the component
interface LabResult {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'REVIEWED' | 'APPROVED' | 'REJECTED' | 'ARCHIVED' | 'REQUIRES_ATTENTION';
  fileName?: string;
  mimeType?: string;
  formattedFileSize?: string;
  testName?: string;
  results?: string;
  interpretation?: string;
  referenceRanges?: string;
  isAbnormal?: boolean;
  isCritical?: boolean;
  orderingPhysician?: string;
  performingLab?: string;
  testDate?: string;
  reportDate?: string;
  createdAt: string;
  updatedAt: string;
  requiresAttention?: boolean;
  downloadUrl?: string;
}

interface LabResultUpload {
  title: string;
  description?: string;
  testName?: string;
  orderingPhysician?: string;
  performingLab?: string;
  file: File;
}

// API service functions
const API_BASE_URL = 'http://localhost:8080/api';

const labResultService = {
  async getUserLabResults(userId: number): Promise<LabResult[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/lab-results/mock/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lab results:', error);
      throw error;
    }
  },

  async uploadLabResult(userId: number, uploadData: LabResultUpload): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('userId', userId.toString());
      formData.append('title', uploadData.title);
      if (uploadData.description) formData.append('description', uploadData.description);
      if (uploadData.testName) formData.append('testName', uploadData.testName);
      if (uploadData.orderingPhysician) formData.append('orderingPhysician', uploadData.orderingPhysician);
      if (uploadData.performingLab) formData.append('performingLab', uploadData.performingLab);
      formData.append('file', uploadData.file);

      const response = await axios.post(`${API_BASE_URL}/lab-results/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading lab result:', error);
      throw error;
    }
  },

  async deleteLabResult(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/lab-results/${id}`);
    } catch (error) {
      console.error('Error deleting lab result:', error);
      throw error;
    }
  },

  async getDownloadUrl(id: string): Promise<string> {
    try {
      const response = await axios.get(`${API_BASE_URL}/lab-results/${id}/download`);
      return response.data;
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  }
};

// Mock user ID - in real app, get from auth context
const MOCK_USER_ID = 1;

export default function LabResults() {
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('recent');
  const [uploadForm, setUploadForm] = useState<Partial<LabResultUpload>>({
    title: '',
    description: '',
    testName: '',
    orderingPhysician: '',
    performingLab: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadLabResults();
  }, []);

  const loadLabResults = async () => {
    try {
      setLoading(true);
      const results = await labResultService.getUserLabResults(MOCK_USER_ID);
      setLabResults(results);
    } catch (error) {
      toast.error('Failed to load lab results');
      console.error('Error loading lab results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a PDF or image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadForm.title) {
      toast.error('Please provide a title and select a file');
      return;
    }

    try {
      setUploading(true);
      const uploadData: LabResultUpload = {
        title: uploadForm.title!,
        description: uploadForm.description,
        testName: uploadForm.testName,
        orderingPhysician: uploadForm.orderingPhysician,
        performingLab: uploadForm.performingLab,
        file: selectedFile
      };

      const response = await labResultService.uploadLabResult(MOCK_USER_ID, uploadData);
      toast.success('Lab result uploaded successfully');
      console.log('Upload response:', response);
      
      // Reset form
      setUploadForm({
        title: '',
        description: '',
        testName: '',
        orderingPhysician: '',
        performingLab: ''
      });
      setSelectedFile(null);
      
      // Switch to recent tab and reload results
      setActiveTab('recent');
      loadLabResults();
    } catch (error) {
      toast.error('Failed to upload lab result');
      console.error('Error uploading lab result:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (result: LabResult) => {
    try {
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      } else {
        const downloadUrl = await labResultService.getDownloadUrl(result.id);
        window.open(downloadUrl, '_blank');
      }
    } catch (error) {
      toast.error('Failed to download file');
      console.error('Error downloading file:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lab result?')) {
      return;
    }

    try {
      await labResultService.deleteLabResult(id);
      toast.success('Lab result deleted successfully');
      loadLabResults();
    } catch (error) {
      toast.error('Failed to delete lab result');
      console.error('Error deleting lab result:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': case 'approved': return 'bg-green-100 text-green-800';
      case 'requires_attention': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (result: LabResult) => {
    if (result.isCritical) return <AlertCircle className="w-4 h-4 text-red-600" />;
    if (result.isAbnormal) return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    if (result.status === 'APPROVED') return <TrendingUp className="w-4 h-4 text-green-600" />;
    return <FileText className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-border">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lab Results</h1>
            <p className="text-sm text-muted-foreground">Track and manage your laboratory test results</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadLabResults} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recent">📋 Recent Results</TabsTrigger>
          <TabsTrigger value="trends">📈 Trends</TabsTrigger>
          <TabsTrigger value="upload">📤 Upload</TabsTrigger>
        </TabsList>

        {/* Recent Results Tab */}
        <TabsContent value="recent" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading lab results...</span>
            </div>
          ) : labResults.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Lab Results</h3>
                <p className="text-gray-600 mb-4">
                  You haven't uploaded any lab results yet.
                </p>
                <Button onClick={() => setActiveTab('upload')}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Your First Report
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {labResults.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result)}
                          <div>
                            <h3 className="font-semibold text-lg">{result.title}</h3>
                            <p className="text-sm text-gray-600">
                              {result.performingLab || 'Lab not specified'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(result.status)}>
                            {result.status.replace('_', ' ')}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(result.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Test Name</p>
                          <p className="font-medium">{result.testName || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">File Size</p>
                          <p className="text-sm font-medium">{result.formattedFileSize || 'Unknown'}</p>
                        </div>
                        <div className="flex gap-2 justify-center">
                          <Button size="sm" variant="outline" onClick={() => handleDownload(result)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(result.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>

                      {result.description && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600">{result.description}</p>
                        </div>
                      )}

                      {(result.isAbnormal || result.isCritical) && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-medium text-red-600">
                              {result.isCritical ? 'Critical Result' : 'Abnormal Result'}
                            </span>
                          </div>
                          {result.interpretation && (
                            <p className="text-sm text-gray-600 mt-1">{result.interpretation}</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Health Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Trend Analysis</h3>
                <p className="text-gray-600">
                  View trends and patterns in your lab results over time
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Lab Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Report Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Blood Test Results"
                    value={uploadForm.title || ''}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="testName">Test Name</Label>
                  <Input
                    id="testName"
                    placeholder="e.g., Complete Blood Count"
                    value={uploadForm.testName || ''}
                    onChange={(e) => setUploadForm({ ...uploadForm, testName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Additional notes about this lab report..."
                  value={uploadForm.description || ''}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="physician">Ordering Physician</Label>
                  <Input
                    id="physician"
                    placeholder="Dr. Smith"
                    value={uploadForm.orderingPhysician || ''}
                    onChange={(e) => setUploadForm({ ...uploadForm, orderingPhysician: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lab">Performing Lab</Label>
                  <Input
                    id="lab"
                    placeholder="Apollo Diagnostics"
                    value={uploadForm.performingLab || ''}
                    onChange={(e) => setUploadForm({ ...uploadForm, performingLab: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="file">Lab Report File *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {selectedFile ? (
                    <div className="space-y-2">
                      <FileText className="w-12 h-12 text-green-500 mx-auto" />
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                      >
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Upload Your Lab Report</h3>
                      <p className="text-gray-600 mb-4">
                        Drag and drop your lab report PDF or image, or click to browse
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Supported formats: PDF, JPG, PNG (Max 10MB)
                      </p>
                      <input
                        type="file"
                        id="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileSelect}
                      />
                      <Button onClick={() => document.getElementById('file')?.click()}>
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadForm({
                      title: '',
                      description: '',
                      testName: '',
                      orderingPhysician: '',
                      performingLab: ''
                    });
                    setSelectedFile(null);
                  }}
                >
                  Clear Form
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={uploading || !selectedFile || !uploadForm.title}
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}