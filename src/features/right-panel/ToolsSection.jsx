import React, { useMemo } from 'react';
import SearchInput from '../../components/SearchInput';
import { useToolStore } from '../../stores/useToolStore';
import { toolCategories } from '../../mocks/tools';
import ToolCategoryAccordion from './ToolCategoryAccordion';

export default function ToolsSection() {
  const { searchQuery, setSearchQuery, expandedCategories, toggleCategory } = useToolStore();

  // Handle searching tools filtering
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return toolCategories;
    
    const query = searchQuery.toLowerCase();
    return toolCategories
      .map((category) => {
        const matchingTools = category.tools.filter(
          (tool) =>
            tool.name.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query)
        );
        return {
          ...category,
          tools: matchingTools,
        };
      })
      .filter((category) => category.tools.length > 0);
  }, [searchQuery]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1 mb-2.5 mt-2">
        Tool Library
      </h4>

      {/* Search Filter input */}
      <div className="mb-3 px-0.5">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tools & triggers..."
        />
      </div>

      {/* Tool categories list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1.5 pr-0.5 pb-4">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <ToolCategoryAccordion
              key={category.id}
              category={category}
              isExpanded={expandedCategories.includes(category.id)}
              onToggle={() => toggleCategory(category.id)}
            />
          ))
        ) : (
          <div className="text-xs text-gray-400 text-center py-6 italic select-none">
            No matching tools found
          </div>
        )}
      </div>
    </div>
  );
}
