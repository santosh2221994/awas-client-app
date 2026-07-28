import React from 'react';
import { 
  Workflow, 
  Users, 
  Bot, 
  Wrench, 
  Activity, 
  Cpu, 
  Variable, 
  BarChart3, 
  CreditCard, 
  Settings, 
  BookOpen,
  ShoppingBag
} from 'lucide-react';
import { cn } from '../../utils/cn';
import Tooltip from '../../components/Tooltip';

const iconMap = {
  Workflow,
  Users,
  Bot,
  Wrench,
  Activity,
  Cpu,
  Variable,
  BarChart3,
  CreditCard,
  Settings,
  BookOpen,
  ShoppingBag
};

export default function NavItem({ id, label, icon, isActive, isCollapsed, onClick }) {
  const IconComponent = iconMap[icon] || Settings;

  const content = (
    <button
      onClick={() => onClick?.(id)}
      className={cn(
        "flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm transition-all duration-150 outline-none",
        isCollapsed ? "justify-center" : "justify-start",
        isActive
          ? "bg-gray-100 text-gray-900 font-medium"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      )}
    >
      <IconComponent className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-gray-900" : "text-gray-400")} />
      {!isCollapsed && <span className="truncate">{label}</span>}
    </button>
  );

  if (isCollapsed) {
    return (
      <Tooltip content={label} position="right">
        {content}
      </Tooltip>
    );
  }

  return content;
}
