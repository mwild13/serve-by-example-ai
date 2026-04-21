"use client";

import { useEffect, useState } from "react";
import { Module, AvailableModulesResponse } from "@/lib/modules";

interface DynamicModuleNavProps {
  userId: string;
  userEmail: string;
  userToken: string; // Supabase session access token
  onModuleSelect: (moduleId: number) => void;
  selectedModuleId?: number;
}

export default function DynamicModuleNav({
  userId,
  userEmail,
  userToken,
  onModuleSelect,
  selectedModuleId,
}: DynamicModuleNavProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [filteredModules, setFilteredModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "technical" | "service" | "compliance"
  >("all");
  const [sortBy, setSortBy] = useState<"recommended" | "elo" | "title">(
    "recommended"
  );
  const [platformVersion, setPlatformVersion] = useState(1);

  // Fetch available modules on mount
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/training/modules?sort=${sortBy}${
            selectedCategory !== "all" ? `&category=${selectedCategory}` : ""
          }`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(userToken ? { Authorization: `Bearer ${userToken}` } : {}),
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch modules");
        }

        const data: AvailableModulesResponse = await response.json();
        setModules(data.modules);
        setPlatformVersion(data.platform_version);

        // Apply category filter if needed
        if (selectedCategory === "all") {
          setFilteredModules(data.modules);
        } else {
          setFilteredModules(
            data.modules.filter((m) => m.category === selectedCategory)
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        console.error("Error fetching modules:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [selectedCategory, sortBy, userToken]);

  const handleCategoryChange = (
    category: "all" | "technical" | "service" | "compliance"
  ) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (sort: "recommended" | "elo" | "title") => {
    setSortBy(sort);
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "technical":
        return "bg-blue-50 border-blue-200";
      case "service":
        return "bg-green-50 border-green-200";
      case "compliance":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getCategoryBadgeColor = (category: string): string => {
    switch (category) {
      case "technical":
        return "bg-blue-100 text-blue-800";
      case "service":
        return "bg-green-100 text-green-800";
      case "compliance":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEloColor = (elo: number): string => {
    if (elo < 1100) return "text-red-600 font-bold";
    if (elo < 1200) return "text-yellow-600 font-bold";
    if (elo < 1300) return "text-blue-600 font-bold";
    return "text-green-600 font-bold";
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-semibold">Error loading modules</p>
        <p className="text-red-600 text-sm mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Training Modules
        </h2>
        <p className="text-gray-600">
          {platformVersion === 1
            ? "Legacy training (3 modules)"
            : `Complete your personalized learning path across ${modules.length} modules`}
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Filter by Category
            </label>
            <div className="flex flex-wrap gap-2">
              {["all", "technical", "service", "compliance"].map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    handleCategoryChange(
                      cat as "all" | "technical" | "service" | "compliance"
                    )
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Sort by
            </label>
            <div className="flex flex-wrap gap-2">
              {["recommended", "elo", "title"].map((sort) => (
                <button
                  key={sort}
                  onClick={() =>
                    handleSortChange(
                      sort as "recommended" | "elo" | "title"
                    )
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    sortBy === sort
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {sort.charAt(0).toUpperCase() + sort.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading modules...</p>
        </div>
      )}

      {/* Modules Grid */}
      {!loading && filteredModules.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModules.map((module) => (
            <div
              key={module.id}
              onClick={() => onModuleSelect(module.id)}
              className={`p-5 rounded-lg border-2 cursor-pointer transition transform hover:scale-105 ${
                selectedModuleId === module.id
                  ? "border-blue-600 bg-blue-50"
                  : `border-gray-200 ${getCategoryColor(module.category)} hover:border-blue-400`
              }`}
            >
              {/* Recommended Badge */}
              {module.recommended && (
                <div className="mb-3 inline-block">
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                    RECOMMENDED
                  </span>
                </div>
              )}

              {/* Module Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {module.title}
              </h3>

              {/* Category Badge */}
              <div className="mb-3">
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getCategoryBadgeColor(
                    module.category
                  )}`}
                >
                  {module.category.toUpperCase()}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                {module.description}
              </p>

              {/* Stats Row */}
              <div className="bg-white rounded p-3 mb-4 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-gray-600 text-xs font-semibold">ELO</p>
                    <p className={getEloColor(module.current_elo)}>
                      {module.current_elo}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs font-semibold">
                      MASTERY
                    </p>
                    <p className="text-gray-900 font-bold">
                      {module.mastery_pct}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs font-semibold">
                      DONE
                    </p>
                    <p className="text-gray-900 font-bold">
                      {module.completion_pct}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendation Reason */}
              {module.recommendation_reason && (
                <p className="text-xs text-gray-600 italic mb-3">
                  {module.recommendation_reason}
                </p>
              )}

              {/* Difficulty Level */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600">Difficulty:</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < module.difficulty_level
                          ? "bg-orange-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredModules.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 font-semibold mb-2">
            No modules available
          </p>
          <p className="text-gray-500 text-sm">
            Try adjusting your filters or contact support
          </p>
        </div>
      )}
    </div>
  );
}
