# CAD Drawing Analyzer - UI Components

This document contains the complete UI implementation of the CAD Drawing Analyzer, including React components, page structure, and user interactions.

## Table of Contents

1. [Overview](#overview)
2. [Page Component](#page-component)
3. [Main Analyzer Component](#main-analyzer-component)
4. [File Upload Interface](#file-upload-interface)
5. [Analysis Results Display](#analysis-results-display)
6. [3D Preview Component](#3d-preview-component)
7. [Product Recommendations UI](#product-recommendations-ui)
8. [Manufacturing Analysis UI](#manufacturing-analysis-ui)
9. [Sample Drawings Feature](#sample-drawings-feature)
10. [Styling](#styling)
11. [User Flow](#user-flow)
12. [Responsive Design](#responsive-design)

---

## Overview

The CAD Drawing Analyzer UI provides an intuitive interface for uploading technical drawings, viewing analysis results, and exploring product recommendations. It features:

- **Drag-and-drop file upload**
- **Real-time 3D model preview**
- **Tabbed interface** for analysis, validation, and verification
- **Sample drawings** for testing
- **Product recommendations** with details
- **Manufacturing analysis** visualization

### Technology Stack

- **React** 19.1.0
- **Next.js** 16.0.1 (App Router)
- **React Dropzone** for file uploads
- **Three.js** for 3D rendering
- **TailwindCSS** for styling

---

## Page Component

### File: `src/app/cad-analyzer/page.tsx`

The main page wrapper for the CAD Analyzer.

```tsx
'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CADAnalyzerFull from '@/components/cad/CADAnalyzerFull';
import PageHero from '@/components/layout/PageHero';
import BlueprintDiagramLayer from '@/components/cad/BlueprintDiagramLayer';

export default function CADAnalyzerPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 home-wavy-bg relative overflow-hidden">
        <BlueprintDiagramLayer className="text-blue-500/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <div className="mb-10">
            <PageHero
              eyebrow="Insight Engine"
              eyebrowPlacement="inline-after"
              title="CAD Drawing Analyzer"
              highlightPlacement="side"
              theme="light"
              description="Upload a drawing once to get normalized dimensions, tolerance checks, and ready-to-use catalog matches."
              highlights={[
                { label: 'Files Parsed', value: '12K+' },
                { label: 'Spec Match', value: '98%' },
                { label: 'Views', value: '3D + 2D' },
                { label: 'Formats', value: 'STEP • PDF' },
              ]}
            />
          </div>
          
          <CADAnalyzerFull />
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

### Page Features

- **PageHero**: Displays statistics and description
- **BlueprintDiagramLayer**: Animated background
- **Responsive Layout**: Max-width container with padding

---

## Main Analyzer Component

### File: `src/components/cad/CADAnalyzerFull.tsx`

The main component handling the entire analysis workflow.

```tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CADPreview3D from '@/components/cad/CADPreview3D';
import { DrawingAnalysis, FileUploadState, APIResponse } from '@/types';
import { useToast } from '@/components/ui/ToastProvider';

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
  const { addToast } = useToast();

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
  const analyzeDrawing = useCallback(async () => {
    if (!uploadState.file) return;

    setUploadState(prev => ({ ...prev, status: 'uploading' }));

    try {
      const formData = new FormData();
      formData.append('file', uploadState.file);

      if (cadModelData) {
        formData.append('cadModelData', JSON.stringify(cadModelData));
      }

      const response = await fetch('/api/analyze-drawing', {
        method: 'POST',
        body: formData,
      });

      const result: APIResponse<DrawingAnalysis> = await response.json();

      if (result.success && result.data) {
        setUploadState(prev => ({ ...prev, status: 'success' }));
        setAnalysis(result.data);
        addToast({
          type: 'success',
          title: 'Analysis Complete',
          message: 'Drawing analyzed successfully',
        });
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Analysis failed'
      }));
      addToast({
        type: 'error',
        title: 'Analysis Failed',
        message: error instanceof Error ? error.message : 'Please try again',
      });
    }
  }, [uploadState.file, cadModelData, addToast]);

  return (
    <div className="space-y-8">
      {/* File Upload Section */}
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold mb-4">Upload Technical Drawing</h2>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}
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
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                {isDragActive ? 'Drop file here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, PNG, JPG, STEP, STL, OBJ, DXF (max 10MB)
              </p>
            </div>
          )}
        </div>

        {uploadState.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {uploadState.error}
          </div>
        )}

        {uploadState.file && (
          <div className="mt-4 flex gap-3">
            <Button
              onClick={analyzeDrawing}
              disabled={uploadState.status === 'uploading'}
              className="flex-1"
            >
              {uploadState.status === 'uploading' ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Analyzing...
                </>
              ) : (
                'Analyze Drawing'
              )}
            </Button>
            <Button
              onClick={() => setUploadState({ file: null, progress: 0, status: 'idle' })}
              variant="secondary"
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* 3D Preview Section */}
      {uploadState.file && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-4">Model Preview</h3>
          <CADPreview3D
            file={uploadState.file}
            onModelLoaded={setCADModelData}
          />
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-6">Analysis Results</h2>
          
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {['analysis', 'validation', 'verification'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab
                      ? 'border-primary text-primary'
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
                  <span className="text-lg font-bold text-primary">
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
                      <div key={product.id} className="border rounded-lg p-4">
                        <h4 className="font-semibold">{product.name}</h4>
                        <p className="text-sm text-gray-600">{product.category}</p>
                        <p className="text-lg font-bold text-primary mt-2">
                          ${product.price}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CADAnalyzerFull;
```

### Component Structure

1. **Upload Section**: Drag-and-drop file upload
2. **Preview Section**: 3D model preview (if applicable)
3. **Results Section**: Tabbed interface with analysis, validation, verification

---

## File Upload Interface

### Drag and Drop

Uses `react-dropzone` for intuitive file uploads:

```tsx
const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop,
  accept: {
    'application/pdf': ['.pdf'],
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'application/step': ['.step', '.stp'],
    // ... more formats
  },
  maxSize: 10 * 1024 * 1024, // 10MB
  multiple: false
});
```

### States

- **idle**: No file selected
- **uploading**: Analysis in progress
- **success**: Analysis complete
- **error**: Analysis failed

### Visual Feedback

```tsx
<div className={`border-2 border-dashed rounded-lg p-12
  ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
  ${uploadState.file ? 'bg-gray-50' : ''}`}>
```

---

## Analysis Results Display

### Tabbed Interface

Three tabs organize the analysis results:

1. **Analysis Tab**: Extracted specifications and recommendations
2. **Validation Tab**: Manufacturing checks and compliance
3. **Verification Tab**: Detailed geometry verification

```tsx
<div className="border-b border-gray-200 mb-6">
  <nav className="flex space-x-8">
    {['analysis', 'validation', 'verification'].map((tab) => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`py-4 px-1 border-b-2 font-medium
          ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent'}`}
      >
        {tab.charAt(0).toUpperCase() + tab.slice(1)}
      </button>
    ))}
  </nav>
</div>
```

### Extracted Specifications Grid

```tsx
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
```

---

## 3D Preview Component

### File: `src/components/cad/CADPreview3D.tsx`

Renders 3D models using Three.js and React Three Fiber.

```tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

interface CADPreview3DProps {
  file: File;
  onModelLoaded?: (data: any) => void;
}

const CADPreview3D: React.FC<CADPreview3DProps> = ({ file, onModelLoaded }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Parse and load CAD file
    const loadModel = async () => {
      try {
        setIsLoading(true);
        // CAD parsing logic here
        // Call onModelLoaded with parsed data
      } catch (err) {
        setError('Failed to load model');
      } finally {
        setIsLoading(false);
      }
    };

    loadModel();
  }, [file]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading model...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-96 bg-gray-100 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="sunset" />
        {/* 3D model rendering */}
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default CADPreview3D;
```

### Features

- **Orbit Controls**: Rotate, zoom, pan
- **Lighting**: Ambient + directional lights
- **Environment**: HDR environment mapping
- **Loading States**: Shows spinner while loading

---

## Product Recommendations UI

### Product Card Grid

```tsx
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
          <p className="text-lg font-bold text-primary mt-2">
            ${product.price.toFixed(2)}
          </p>
          <Button className="w-full mt-3" size="sm">
            View Details
          </Button>
        </div>
      ))}
    </div>
  </div>
)}
```

---

## Manufacturing Analysis UI

### Validation Results Display

```tsx
{manufacturabilityResults.length > 0 && (
  <div>
    <h3 className="text-lg font-semibold mb-3">Manufacturing Analysis</h3>
    <div className="space-y-3">
      {manufacturabilityResults.map((result, idx) => (
        <div
          key={idx}
          className={`p-4 rounded-lg border-l-4 ${
            result.status === 'Valid'
              ? 'border-green-500 bg-green-50'
              : result.status === 'Warning'
              ? 'border-yellow-500 bg-yellow-50'
              : 'border-red-500 bg-red-50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold">{result.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{result.message}</p>
              {result.detail && (
                <p className="text-xs text-gray-500 mt-1">{result.detail}</p>
              )}
            </div>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                result.status === 'Valid'
                  ? 'bg-green-200 text-green-800'
                  : result.status === 'Warning'
                  ? 'bg-yellow-200 text-yellow-800'
                  : 'bg-red-200 text-red-800'
              }`}
            >
              {result.status}
            </span>
          </div>
          {result.suggestion && (
            <div className="mt-2 p-2 bg-white rounded text-sm">
              <strong>Suggestion:</strong> {result.suggestion}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}
```

### Status Indicators

- **Valid**: Green border, green badge
- **Warning**: Yellow border, yellow badge
- **Invalid**: Red border, red badge

---

## Sample Drawings Feature

### Sample Templates

```tsx
const templateSamples = [
  {
    id: 1,
    name: 'I-Beam Steel 200mm',
    description: 'Structural steel I-beam',
    file: '/products-models/i-beam-steel-200mm-grade.step',
    preview: '/images/steel-beam-cad-preview.svg',
  },
  {
    id: 2,
    name: 'Surgical Drill Guide',
    description: 'Medical component',
    file: '/products-models/surgical_drill_guide.step',
    preview: '/images/sample-cad-preview.svg',
  },
  {
    id: 4,
    name: 'Brake Rotor',
    description: 'Automotive brake disc',
    file: '/products-models/brake_rotor.step',
    preview: '/images/sample-cad-preview.svg',
  },
];
```

### Sample Cards UI

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
  {templateSamples.map((sample) => (
    <button
      key={sample.id}
      onClick={() => loadSample(sample)}
      className="text-left p-4 border rounded-lg hover:border-primary hover:shadow-lg transition-all"
    >
      <img
        src={sample.preview}
        alt={sample.name}
        className="w-full h-32 object-cover rounded-lg mb-3"
      />
      <h4 className="font-semibold">{sample.name}</h4>
      <p className="text-sm text-gray-600">{sample.description}</p>
      <div className="mt-2 flex items-center text-primary text-sm">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
        </svg>
        Try Sample
      </div>
    </button>
  ))}
</div>
```

---

## Styling

### Glass Card Effect

```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
}
```

### Home Wavy Background

```css
.home-wavy-bg {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}
```

### Blueprint Diagram Layer

Animated SVG background with technical drawings aesthetic.

---

## User Flow

### 1. Upload File

User drags and drops or clicks to upload a technical drawing

### 2. Preview (Optional)

If 3D file, show model preview with orbit controls

### 3. Analyze

Click "Analyze Drawing" button to start Claude AI analysis

### 4. View Results

Results displayed in tabs:
- **Analysis**: Specifications and recommendations
- **Validation**: Manufacturing checks
- **Verification**: Geometry verification

### 5. Explore Products

Click product cards to view details and specifications

---

## Responsive Design

### Breakpoints

- **Mobile**: < 768px - Stacked layout
- **Tablet**: 768px - 1024px - 2-column grid
- **Desktop**: > 1024px - 3-column grid

### Mobile Optimizations

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

### Touch Interactions

- Larger touch targets on mobile
- Swipe-friendly tabs
- Pinch-to-zoom in 3D viewer

---

## Accessibility

### Keyboard Navigation

- Tab through all interactive elements
- Enter to activate buttons
- Arrow keys for tabs

### Screen Reader Support

```tsx
<button aria-label="Analyze drawing">
  Analyze
</button>
```

### Focus States

```tsx
className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
```

---

## Performance

### Code Splitting

```tsx
const CADPreview3D = dynamic(() => import('@/components/cad/CADPreview3D'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});
```

### Lazy Loading

- Images lazy loaded
- 3D models loaded on demand
- Heavy components code-split

---

## Error Handling

### Upload Errors

```tsx
{uploadState.error && (
  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
    <p className="text-red-700">{uploadState.error}</p>
  </div>
)}
```

### Analysis Errors

```tsx
try {
  const result = await analyzeDrawing();
} catch (error) {
  addToast({
    type: 'error',
    title: 'Analysis Failed',
    message: error.message,
  });
}
```

---

## Testing

### Component Tests

```tsx
describe('CADAnalyzerFull', () => {
  it('should render upload area', () => {
    render(<CADAnalyzerFull />);
    expect(screen.getByText(/drag & drop/i)).toBeInTheDocument();
  });

  it('should accept file upload', async () => {
    render(<CADAnalyzerFull />);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    // Test file upload
  });
});
```

---

## Backend Integration Notes

### API Endpoint

The UI component calls `/api/analyze-drawing` which:
- Uses **Claude API** for AI analysis (replaces Gemini)
- Stores results in **Convex** database (replaces Supabase)
- Uses **Convex File Storage** for uploaded files

### Data Flow

```
User Upload → FormData → API Route → CADAnalysisService
  → Claude API (vision analysis)
  → Convex (product matching)
  → Convex (store analysis)
  → Return to UI
```

### Convex Integration

If you need to fetch analysis history in the UI:

```tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function AnalysisHistory() {
  const analyses = useQuery(api.drawingAnalyses.getByUser, { 
    userId: currentUserId 
  });
  
  // Render analyses...
}
```

---

## License

This code is extracted from Metalink and is provided as-is for reuse in other projects. Adapted for Convex and Claude API.

## License

This code is extracted from Metalink and is provided as-is for reuse in other projects.

