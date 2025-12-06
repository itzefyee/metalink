'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useDropzone, FileRejection } from 'react-dropzone';
import { DrawingAnalysis, FileUploadState, APIResponse } from '@/types/cad.types';
import { useCADAnalysis } from '@/hooks/useCADAnalysis';
import { Loader2, Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';

// Dynamically import CADPreview3D to avoid bundling opencascade.js at build time
const CADPreview3D = dynamic(() => import('./CADPreview3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] rounded-lg border-2 border-gray-200 flex items-center justify-center bg-gray-50">
      <div className="text-gray-500">Loading 3D preview...</div>
    </div>
  ),
});

const CADAnalyzerFull: React.FC = () => {
  const [uploadState, setUploadState] = useState<FileUploadState>({
    file: null,
    progress: 0,
    status: 'idle',
    error: undefined
  });
  
  const [analysis, setAnalysis] = useState<DrawingAnalysis | null>(null);
  const [cadModelData, setCADModelData] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'validation' | 'verification'>('analysis');

  const { isAnalyzing, error: analysisError, analyzeDrawing } = useCADAnalysis({
    onSuccess: (data: DrawingAnalysis) => {
      setAnalysis(data);
      setUploadState(prev => ({ ...prev, status: 'success' }));
    },
    onError: (error: string) => {
      setUploadState(prev => ({
        ...prev,
        status: 'error',
        error: error
      }));
    }
  });

  // File drop handler
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      setUploadState({
        file: null,
        progress: 0,
        status: 'error',
        error: 'Invalid file type or size'
      });
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadState({
        file,
        progress: 0,
        status: 'idle',
        error: undefined
      });
      
      setAnalysis(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/step': ['.step', '.stp'],
      'application/sla': ['.stl'],
      'model/obj': ['.obj'],
      'application/dxf': ['.dxf'],
      'model/gltf+json': ['.gltf'],
      'model/gltf-binary': ['.glb']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false
  });

  // Analysis function
  const handleAnalyze = useCallback(async () => {
    if (!uploadState.file) return;

    setUploadState(prev => ({ ...prev, status: 'uploading' }));

    try {
      await analyzeDrawing(uploadState.file, cadModelData);
    } catch (error) {
      // Error handled by hook
    }
  }, [uploadState.file, cadModelData, analyzeDrawing]);

  return (
    <div className="space-y-8">
      {/* File Upload Section */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">Upload Technical Drawing</h2>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
            ${uploadState.file ? 'bg-gray-50' : ''}`}
        >
          <input {...getInputProps()} />
          
          {uploadState.file ? (
            <div>
              <p className="text-lg font-semibold">{uploadState.file.name}</p>
              <p className="text-sm text-gray-500">
                {(uploadState.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="mt-2 text-sm text-gray-600">
                {isDragActive ? 'Drop file here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, PNG, JPG, STEP, STL, OBJ, DXF (max 10MB)
              </p>
            </div>
          )}
        </div>

        {(uploadState.error || analysisError) && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {uploadState.error || analysisError}
          </div>
        )}

        {uploadState.status === 'success' && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Analysis completed successfully
          </div>
        )}

        {uploadState.file && (
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || uploadState.status === 'uploading'}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Drawing'
              )}
            </button>
            <button
              onClick={() => {
                setUploadState({ file: null, progress: 0, status: 'idle' });
                setAnalysis(null);
                setCADModelData(null);
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Clear
            </button>
          </div>
        )}
      </div>

      {/* 3D Preview Section */}
      {uploadState.file && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Model Preview</h3>
          <CADPreview3D
            file={uploadState.file}
            onModelDataParsed={(data) => {
              setCADModelData(data);
            }}
            onParsingStart={() => {
              setUploadState(prev => ({ ...prev, status: 'uploading' }));
            }}
            onParsingComplete={(ok) => {
              if (ok) {
                setUploadState(prev => ({ ...prev, status: 'idle' }));
              }
            }}
            showStats={true}
          />
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">Analysis Results</h2>
          
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {['analysis', 'validation', 'verification'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as 'analysis' | 'validation' | 'verification')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* Extracted Specifications */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Extracted Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(analysis.extractedSpecs).map(([key, value]) => (
                    value && (
                      <div key={key} className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-lg font-semibold">{value}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Confidence & Reasoning */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Confidence</span>
                  <span className="text-lg font-bold text-blue-600">
                    {(analysis.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600">{analysis.reasoning}</p>
              </div>

              {/* Product Recommendations */}
              {analysis.recommendedProducts && analysis.recommendedProducts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Recommended Products</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analysis.recommendedProducts.map((product) => (
                      <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                        {product.images && product.images[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-40 object-cover rounded-lg mb-3"
                          />
                        )}
                        <h4 className="font-semibold">{product.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{product.category}</p>
                        {product.price && (
                          <p className="text-lg font-bold text-blue-600 mt-2">
                            ${product.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alternative Suggestions */}
              {analysis.alternativeSuggestions && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Alternative Suggestions</h4>
                  <p className="text-sm text-yellow-700">{analysis.alternativeSuggestions.message}</p>
                  {analysis.alternativeSuggestions.suggestedCategories.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {analysis.alternativeSuggestions.suggestedCategories.map((cat, idx) => (
                        <span key={idx} className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs">
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="text-center py-12 text-gray-500">
              <p>Manufacturing validation results will appear here</p>
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="text-center py-12 text-gray-500">
              <p>Geometry verification results will appear here</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CADAnalyzerFull;

