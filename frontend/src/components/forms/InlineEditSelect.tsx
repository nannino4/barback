import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Check, X, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface SelectOption
{
  value: string;
  label: string;
}

interface InlineEditSelectProps
{
  /** Current value */
  value: string;
  /** Available options */
  options: SelectOption[];
  /** Callback when value is saved */
  onSave: (newValue: string) => Promise<void> | void;
  /** Label for accessibility */
  label: string;
  /** Display label for the current value (if different from option label) */
  displayLabel?: string;
  /** Whether the field can be edited */
  canEdit?: boolean;
  /** Custom className for the container */
  className?: string;
  /** Custom className for the display text */
  textClassName?: string;
  /** Whether to show loading state during save */
  isLoading?: boolean;
  /** Whether the edit icon should always be visible (default: false, hover-reveal) */
  alwaysShowEdit?: boolean;
}

/**
 * InlineEditSelect - Editable select field with inline editing support
 * 
 * Features:
 * - Display mode with edit button (hover reveal on desktop)
 * - Edit mode with select dropdown, save and cancel buttons
 * - Loading state during async save
 * - Focus management
 * 
 * Use cases:
 * - Member role editing
 * - Currency selection
 * - Any single-select field that benefits from inline editing
 */
export const InlineEditSelect: React.FC<InlineEditSelectProps> = ({
  value,
  options,
  onSave,
  label,
  displayLabel,
  canEdit = true,
  className,
  textClassName,
  isLoading = false,
  alwaysShowEdit = false,
}) =>
{
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update editValue when value prop changes
  useEffect(() =>
  {
    if (!isEditing)
    {
      setEditValue(value);
    }
  }, [value, isEditing]);

  const handleStartEdit = () =>
  {
    if (!canEdit) return;
    setEditValue(value);
    setIsEditing(true);
  };

  const handleCancel = () =>
  {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleSave = async () =>
  {
    // Skip if no change
    if (editValue === value)
    {
      setIsEditing(false);
      return;
    }

    // Save
    setIsSaving(true);
    try
    {
      await onSave(editValue);
      setIsEditing(false);
    }
    catch
    {
      // Error handling is done by the parent
      setEditValue(value);
    }
    finally
    {
      setIsSaving(false);
    }
  };

  const handleValueChange = (newValue: string) =>
  {
    setEditValue(newValue);
  };

  const currentOption = options.find(opt => opt.value === value);
  const currentLabel = displayLabel ?? currentOption?.label ?? value;

  const showSaving = isSaving || isLoading;

  // Display mode
  if (!isEditing)
  {
    return (
      <div className={cn('group flex items-center gap-2', className)}>
        <span className={cn('font-medium', textClassName)}>
          {currentLabel}
        </span>
        {canEdit && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'h-7 w-7 transition-opacity focus:opacity-100',
              alwaysShowEdit ? 'opacity-50 hover:opacity-100' : 'opacity-0 group-hover:opacity-100',
            )}
            onClick={handleStartEdit}
            aria-label={`Edit ${label}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    );
  }

  const selectedOption = options.find(opt => opt.value === editValue);

  // Edit mode
  return (
    <div ref={containerRef} className={cn('flex items-center gap-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={showSaving}>
          <Button
            variant="outline"
            size="sm"
            className="h-8 min-w-[120px] justify-between"
            aria-label={label}
          >
            {selectedOption?.label ?? editValue}
            <ChevronDown className="h-3.5 w-3.5 ml-2 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleValueChange(option.value)}
              className={cn(
                option.value === editValue && 'bg-accent',
              )}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => void handleSave()}
          disabled={showSaving}
          aria-label="Save"
        >
          {showSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5 text-success" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleCancel}
          disabled={showSaving}
          aria-label="Cancel"
        >
          <X className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
    </div>
  );
};
