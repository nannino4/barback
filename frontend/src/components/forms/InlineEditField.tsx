import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface InlineEditFieldProps
{
  /** Current value to display */
  value: string;
  /** Callback when value is saved */
  onSave: (newValue: string) => Promise<void> | void;
  /** Placeholder text when editing */
  placeholder?: string;
  /** Label for accessibility */
  label: string;
  /** Whether the field can be edited */
  canEdit?: boolean;
  /** Validation function - returns error message or undefined */
  validate?: (value: string) => string | undefined;
  /** Minimum length for the value */
  minLength?: number;
  /** Maximum length for the value */
  maxLength?: number;
  /** Custom className for the container */
  className?: string;
  /** Custom className for the display text */
  textClassName?: string;
  /** Custom className for the input field (used to match display styling) */
  inputClassName?: string;
  /** Whether to show loading state during save */
  isLoading?: boolean;
  /** Whether the edit icon should always be visible (default: false, hover-reveal) */
  alwaysShowEdit?: boolean;
}

/**
 * InlineEditField - Editable text field with inline editing support
 * 
 * Features:
 * - Display mode with edit button (hover reveal on desktop)
 * - Edit mode with input, save and cancel buttons
 * - Keyboard navigation (Enter to save, Escape to cancel)
 * - Validation support
 * - Loading state during async save
 * - Focus management
 * 
 * Use cases:
 * - Organization name editing
 * - Currency selection
 * - Other single-value fields that benefit from inline editing
 */
export const InlineEditField: React.FC<InlineEditFieldProps> = ({
  value,
  onSave,
  placeholder = '',
  label,
  canEdit = true,
  validate,
  minLength = 1,
  maxLength = 100,
  className,
  textClassName,
  inputClassName,
  isLoading = false,
  alwaysShowEdit = false,
}) =>
{
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update editValue when value prop changes
  useEffect(() =>
  {
    if (!isEditing)
    {
      setEditValue(value);
    }
  }, [value, isEditing]);

  // Focus input when entering edit mode
  useEffect(() =>
  {
    if (isEditing && inputRef.current)
    {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const validateValue = (val: string): string | undefined =>
  {
    if (val.trim().length < minLength)
    {
      return `Minimum ${minLength} characters required`;
    }
    if (val.length > maxLength)
    {
      return `Maximum ${maxLength} characters allowed`;
    }
    return validate?.(val);
  };

  const handleStartEdit = () =>
  {
    if (!canEdit) return;
    setEditValue(value);
    setError(undefined);
    setIsEditing(true);
  };

  const handleCancel = () =>
  {
    setEditValue(value);
    setError(undefined);
    setIsEditing(false);
  };

  const handleSave = async () =>
  {
    const trimmedValue = editValue.trim();
    
    // Skip if no change
    if (trimmedValue === value)
    {
      setIsEditing(false);
      return;
    }

    // Validate
    const validationError = validateValue(trimmedValue);
    if (validationError)
    {
      setError(validationError);
      return;
    }

    // Save
    setIsSaving(true);
    try
    {
      await onSave(trimmedValue);
      setIsEditing(false);
      setError(undefined);
    }
    catch
    {
      // Error handling is done by the parent, but we can show a generic error
      setError('Failed to save. Please try again.');
    }
    finally
    {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) =>
  {
    if (e.key === 'Enter')
    {
      e.preventDefault();
      void handleSave();
    }
    else if (e.key === 'Escape')
    {
      handleCancel();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
  {
    setEditValue(e.target.value);
    if (error)
    {
      setError(undefined);
    }
  };

  const showSaving = isSaving || isLoading;

  // Display mode
  if (!isEditing)
  {
    return (
      <div className={cn('group flex items-center gap-2', className)}>
        <span className={cn('font-medium', textClassName)}>
          {value || <span className="text-muted-foreground italic">{placeholder}</span>}
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

  // Edit mode
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={showSaving}
          aria-label={label}
          aria-invalid={Boolean(error)}
          className={cn(
            'h-auto py-1',
            inputClassName ?? textClassName,
            error && 'border-destructive focus-visible:ring-destructive',
          )}
        />
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
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
