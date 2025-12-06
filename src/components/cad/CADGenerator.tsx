'use client';

import { useState } from 'react';
import { useAction, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import CADViewer from '../CADViewer';
import ComplianceReport from '../ComplianceReport';
import { Loader2, Download, FileText } from 'lucide-react';

export default function CADGenerator() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [generationId, setGenerationId] = useState<Id<"cadGenerations"> | null>(null);

  const generateCAD = useAction(api.actions.generateCAD.generateFromDescription);
  const generation = useQuery(
    api.queries.getGeneration,
    generationId ? { id: generationId } : "skip"
  );

  const handleGenerate = async () => {
    if (!description.trim()) return;
    
    setLoading(true);
    try {
      const result = await generateCAD({
        description,
        specifications: {
          dimensions: { length: 6, width: 4, height: 0.25, thickness: 0.25 },
          material: { grade: "A36", edgeType: "rolled" },
        },
      });
      setGenerationId(result.generationId);
    } catch (error) {
      console.error(error);
      alert("Generation failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="glass-card glass-card-with-liquid rounded-2xl p-8">
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-4 text-gray-900">
            Describe your component:
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-400"
            placeholder="e.g., L-bracket, 6 inches tall, 4 inches wide, 1/4 inch thick, four 1/2 inch holes"
            disabled={loading}
          />
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={loading || !description.trim()}
          className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              Generate CAD
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {generation && generation.stepFileId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 3D Viewer */}
          <div className="glass-card glass-card-with-liquid rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">3D Preview</h2>
            <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
              <CADViewer stepFileId={generation.stepFileId} />
            </div>
          </div>

          {/* Compliance Report */}
          <div className="glass-card glass-card-with-liquid rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Compliance Analysis</h2>
            <ComplianceReport generationId={generation._id} />
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !generation && (
        <div className="glass-card glass-card-with-liquid rounded-2xl p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Generating your CAD model...</p>
        </div>
      )}
    </div>
  );
}

