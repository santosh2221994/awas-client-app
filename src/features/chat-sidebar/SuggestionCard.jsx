import React from 'react';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { Play } from 'lucide-react';

export default function SuggestionCard({ suggestion, onPrimaryAction, onDismiss }) {
  if (!suggestion) return null;
  const { id, title, description, primaryAction, secondaryAction } = suggestion;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm animate-scale-in">
      <div className="flex items-center justify-between">
        <Badge variant="info" size="sm">
          {title || 'Suggestion'}
        </Badge>
      </div>

      <p className="text-sm text-gray-600 mt-2.5 leading-relaxed">
        {description || 'Your automation is configured and ready. Click below to start processing the scene files.'}
      </p>

      <div className="flex items-center gap-2.5 mt-4">
        <Button
          variant="primary"
          size="sm"
          icon={Play}
          onClick={() => onPrimaryAction?.(id)}
        >
          {primaryAction?.label || 'Run Automation'}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDismiss?.(id)}
        >
          {secondaryAction?.label || 'Dismiss'}
        </Button>
      </div>
    </div>
  );
}
