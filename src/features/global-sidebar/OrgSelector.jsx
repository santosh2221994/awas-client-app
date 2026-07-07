import React from 'react';
import Avatar from '../../components/Avatar';
import { ChevronDown } from 'lucide-react';

export default function OrgSelector({ organization, isCollapsed }) {
  const orgName = organization?.name || 'Your organization';

  if (isCollapsed) {
    return (
      <div className="flex items-center justify-center py-3">
        <Avatar fallback={orgName} size="sm" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2.5 px-3 py-2.5 mx-2 my-1 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all duration-150 cursor-pointer group">
      <div className="flex items-center gap-2.5 min-w-0">
        <Avatar fallback={orgName} size="sm" />
        <span className="text-sm font-semibold text-gray-800 truncate group-hover:text-gray-900">
          {orgName}
        </span>
      </div>
      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:text-gray-600 transition-colors" />
    </div>
  );
}
