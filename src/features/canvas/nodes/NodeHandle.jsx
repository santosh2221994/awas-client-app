import React from 'react';
import { Handle } from '@xyflow/react';
import { cn } from '../../../utils/cn';

export default function NodeHandle({ type, position, id, className, ...rest }) {
  return (
    <Handle
      type={type}
      position={position}
      id={id}
      className={cn(
        "!w-2.5 !h-2.5 !border-2 !border-gray-300 !bg-white hover:!border-indigo-500 hover:!bg-indigo-500 hover:!scale-125 !transition-all !duration-150",
        className
      )}
      {...rest}
    />
  );
}
