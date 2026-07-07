import React from 'react';
import NavItem from './NavItem';

export default function NavGroup({ title, items, isCollapsed, activeItem, onItemClick }) {
  return (
    <div className="mb-4">
      {!isCollapsed && (
        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-3 mb-1">
          {title}
        </div>
      )}
      <div className="space-y-1">
        {items.map((item) => (
          <NavItem
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            isActive={activeItem === item.id}
            isCollapsed={isCollapsed}
            onClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
}
