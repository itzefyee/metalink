"use client";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export default function ComplianceReport({ generationId }: { generationId: Id<"cadGenerations"> }) {
  const report = useQuery(api.queries.getComplianceReport, { generationId });

  if (!report) return <div>Loading report...</div>;

  const scoreColor = 
    report.overallScore >= 90 ? "text-green-600" :
    report.overallScore >= 70 ? "text-blue-600" :
    report.overallScore >= 50 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {/* Score Badge */}
      <div className="text-center mb-8">
        <div className={`text-6xl font-bold ${scoreColor}`}>
          {report.overallScore}
        </div>
        <div className="text-gray-600 mt-2">{report.status.replace(/_/g, " ")}</div>
      </div>

      {/* Violations */}
      {report.violations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-red-600 mb-4">
            Critical Issues ({report.violations.length})
          </h3>
          {report.violations.map((v: any, i: number) => (
            <div key={i} className="bg-red-50 border-l-4 border-red-600 p-4 mb-3">
              <div className="font-semibold">{v.code}: {v.message}</div>
              {v.standard && (
                <div className="text-sm text-gray-600 mt-1">{v.standard}</div>
              )}
              {v.recommendation && (
                <div className="text-sm text-blue-600 mt-2">
                  💡 {v.recommendation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Warnings */}
      {report.warnings.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-yellow-600 mb-4">
            Warnings ({report.warnings.length})
          </h3>
          {report.warnings.map((w: any, i: number) => (
            <div key={i} className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-3">
              <div className="font-semibold">{w.message}</div>
              {w.recommendation && (
                <div className="text-sm text-blue-600 mt-2">
                  💡 {w.recommendation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Passes */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-green-600 mb-4">
          Passing Checks ({report.passes.length})
        </h3>
        <div className="space-y-2">
          {report.passes.map((p: any, i: number) => (
            <div key={i} className="flex items-center text-gray-700">
              <span className="text-green-500 mr-2">✓</span>
              {p.message}
            </div>
          ))}
        </div>
      </div>

      {/* AI Analysis */}
      {report.aiAnalysis && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Manufacturing Insights</h3>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {report.aiAnalysis}
          </div>
        </div>
      )}
    </div>
  );
}

