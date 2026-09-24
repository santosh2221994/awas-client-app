import React, { useMemo, useState, useEffect } from 'react';
import SearchInput from '../../components/SearchInput';
import { useToolStore } from '../../stores/useToolStore';
import { listTools } from '../../api/services/toolService';
import ToolCategoryAccordion from './ToolCategoryAccordion';

export default function ToolsSection() {
  const { searchQuery, setSearchQuery, expandedCategories, toggleCategory } = useToolStore();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    listTools()
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          if (data[0] && Array.isArray(data[0].tools)) {
            setCategories(data);
          } else {
            // Group flat list of tools by category
            const groups = {};
            data.forEach((tool) => {
              const catName = tool.category || 'General';
              const catId = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              if (!groups[catId]) {
                groups[catId] = { id: catId, category: catName, tools: [] };
              }
              groups[catId].tools.push(tool);
            });
            setCategories(Object.values(groups));
          }
        } else {
          import('../../mocks/tools').then((mod) => setCategories(mod.toolCategories));
        }
      })
      .catch((err) => {
        console.warn('Failed to load tool categories from API, falling back to mocks', err);
        import('../../mocks/tools').then((mod) => setCategories(mod.toolCategories));
      });
  }, []);

  // Handle searching tools filtering
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase();
    return categories
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
  }, [searchQuery, categories]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 px-1 mb-2.5 mt-2">
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
          <div className="text-xs text-gray-400 dark:text-slate-500 text-center py-6 italic select-none">
            No matching tools found
          </div>
        )}
      </div>
    </div>
  );
}
