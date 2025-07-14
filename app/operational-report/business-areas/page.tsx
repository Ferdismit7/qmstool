"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface BusinessArea {
  business_area: string;
}

const BusinessAreasPage = () => {
  const [businessAreas, setBusinessAreas] = useState<BusinessArea[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBusinessAreas = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/business-areas");
        const data = await res.json();
        setBusinessAreas(data.data || []);
      } catch {
        setBusinessAreas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinessAreas();
  }, []);

  const handleCardClick = (area: string) => {
    router.push(`/operational-report/${encodeURIComponent(area)}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-white">Business Areas</h1>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : businessAreas.length === 0 ? (
        <div className="text-gray-500">No business areas found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {businessAreas.map((area) => (
            <button
              key={area.business_area}
              onClick={() => handleCardClick(area.business_area)}
              className="bg-gray-800 hover:bg-gray-700 rounded-lg shadow-lg p-6 flex flex-col items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 border border-gray-700 transition-colors"
              aria-label={`View report for ${area.business_area}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleCardClick(area.business_area);
              }}
            >
              <span className="text-lg font-semibold text-white mb-2">{area.business_area}</span>
              <span className="text-sm text-blue-400">View Report</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessAreasPage; 