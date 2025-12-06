/**
 * Improved CAD Generator Component
 * 
 * Uses new service layer architecture with React Query
 */

'use client';

import { useState } from 'react';
import { useCADGeneration, useCADHistory, useDownloadCAD } from '@/hooks/useCADGeneration';
import { useCADStore } from '@/stores/cad.store';
import { CADGenerationRequest } from '@/types/cad.types';
import { Loader2, Download, History, Sparkles, Settings } from 'lucide-react';
import CADViewer from '../CADViewer';

export default function ImprovedCADGenerator() {
  const [description, setDescription] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Hooks
  const generateMutation = useCADGeneration();
  const { data: history, isLoading: historyLoading } = useCADHistory(10);
  const downloadMutation = useDownloadCAD();
  
  // Store
  const {
    defaultFormat,
    defaultUnits,
    defaultCategory,
    recentPrompts,
    setDefaultFormat,
    setDefaultUnits,
    setDefaultCategory,
  } = useCADStore();

  const handleGenerate = async () => {
    if (!description.trim()) {
      alert('Please enter a description');
      return;
    }

    const request: CADGenerationRequest = {
      description,
      category: defaultCategory,
      format: defaultFormat,
      units: defaultUnits,
      specifications: {
        dimensions: { length: 6, width: 4, height: 0.25, thickness: 0.25 },
        material: { grade: 'A36', edgeType: 'rolled' },
      },
    };

    try {
      await generateMutation.mutateAsync(request);
      setDescription(''); // Clear on success
    } catch (error: any) {
      alert(error.message || 'Generation failed');
    }
  };

  const handleDownload = (generationId: string) => {
    downloadMutation.mutate({ generationId, format: defaultFormat });
  };

  return (
    <div className="space-y-8">
      {/* Main Input Section */}
      <div className="glass-card glass-card-with-liquid rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Generate CAD Model</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Preferences"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="History"
            >
              <History className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Preferences Panel */}
        {showPreferences && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold mb-3 text-gray-900">Preferences</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select
                  value={defaultFormat}
                  onChange={(e) => setDefaultFormat(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="step">STEP</option>
                  <option value="stl">STL</option>
                  <option value="obj">OBJ</option>
                  <option value="gltf">GLTF</option>
                  <option value="glb">GLB</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Units
                </label>
                <select
                  value={defaultUnits}
                  onChange={(e) => setDefaultUnits(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="mm">Millimeters</option>
                  <option value="cm">Centimeters</option>
                  <option value="m">Meters</option>
                  <option value="in">Inches</option>
                  <option value="ft">Feet</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={defaultCategory}
                  onChange={(e) => setDefaultCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="custom">Custom</option>
                  <option value="bracket">Bracket</option>
                  <option value="plate">Plate</option>
                  <option value="beam">Beam</option>
                  <option value="fastener">Fastener</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Recent Prompts */}
        {recentPrompts.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recent Prompts
            </label>
            <div className="flex flex-wrap gap-2">
              {recentPrompts.slice(0, 5).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setDescription(prompt)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                >
                  {prompt.slice(0, 30)}{prompt.length > 30 ? '...' : ''}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Description Input */}
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-4 text-gray-900">
            Describe your component:
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Steel bracket with 4 mounting holes, 6x4 inches, 1/4 inch thick"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
            rows={4}
            maxLength={1000}
          />
          <div className="text-sm text-gray-500 mt-1">
            {description.length}/1000 characters
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generateMutation.isPending || !description.trim()}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating CAD Model...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate CAD Drawing
            </>
          )}
        </button>

        {/* Error Display */}
        {generateMutation.isError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <strong>Error:</strong> {(generateMutation.error as Error).message}
          </div>
        )}

        {/* Success Display */}
        {generateMutation.isSuccess && generateMutation.data && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <strong className="text-green-900">Success!</strong>
                <p className="text-green-700 text-sm mt-1">
                  Generated in {defaultFormat.toUpperCase()} format
                </p>
              </div>
              <button
                onClick={() => handleDownload(generateMutation.data.id)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        )}
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="glass-card rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
            <History className="w-5 h-5" />
            Generation History
          </h3>

          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-3">
              {history.map((item: any) => (
                <div
                  key={item._id}
                  className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.description}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(item._id)}
                      disabled={downloadMutation.isPending}
                      className="ml-4 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Download className="w-5 h-5 text-blue-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No generation history yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

