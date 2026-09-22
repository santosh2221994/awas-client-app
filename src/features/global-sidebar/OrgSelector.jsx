import React from 'react';
import Avatar from '../../components/Avatar';
import { ChevronDown } from 'lucide-react';

export default function OrgSelector({ organization, user, isCollapsed }) {
  const orgName = user?.name || organization?.name || 'Your organization';

  if (isCollapsed) {
    return (
      <div className="flex items-center justify-center py-3">
        <Avatar fallback={orgName} size="sm" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2.5 px-3 py-2.5 mx-2 my-1 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 border border-transparent hover:border-gray-100 dark:hover:border-slate-700 transition-all duration-150 cursor-pointer group">
      <div className="flex items-center gap-2.5 min-w-0">
        <Avatar fallback={orgName} size="sm" />
        <span className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate group-hover:text-gray-900 dark:group-hover:text-white">
          {orgName}
        </span>
      </div>
      <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0 group-hover:text-gray-600 dark:group-hover:text-slate-300 transition-colors" />
    </div>
  );
}
