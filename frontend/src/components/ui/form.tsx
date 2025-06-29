"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
    Controller,
    FormProvider,
    type ControllerProps,
    type FieldPath,
    type FieldValues,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { FormFieldContext, FormItemContext, useFormField } from "@/components/ui/use-form-field"

const Form = FormProvider

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
        ...props
    }: ControllerProps<TFieldValues, TName>) => 
{
    const contextValue = React.useMemo(() => ({ name: props.name }), [props.name])
    
    return (
        <FormFieldContext value={contextValue}>
            <Controller {...props} />
        </FormFieldContext>
    )
}

function FormItem({ className, ...props }: React.ComponentProps<"div">) 
{
    const id = React.useId()
    const contextValue = React.useMemo(() => ({ id }), [id])

    return (
        <FormItemContext value={contextValue}>
            <div
                data-slot="form-item"
                className={cn("grid gap-2", className)}
                {...props}
            />
        </FormItemContext>
    )
}

function FormLabel({
    className,
    ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) 
{
    const { formItemId } = useFormField()

    return (
        <Label
            data-slot="form-label"
            className={cn(className)}
            htmlFor={formItemId}
            {...props}
        />
    )
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) 
{
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

    return (
        <Slot
            data-slot="form-control"
            id={formItemId}
            aria-describedby={
                !error
                    ? `${formDescriptionId}`
                    : `${formDescriptionId} ${formMessageId}`
            }
            aria-invalid={!!error}
            {...props}
        />
    )
}

function FormDescription({
    className,
    ...props
}: React.ComponentProps<"p">) 
{
    const { formDescriptionId } = useFormField()

    return (
        <p
            data-slot="form-description"
            id={formDescriptionId}
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    )
}

function FormMessage({
    className,
    children,
    ...props
}: React.ComponentProps<"p">) 
{
    const { error, formMessageId } = useFormField()
    const body = error ? String(error?.message) : children

    if (!body) 
    {
        return null
    }

    return (
        <p
            data-slot="form-message"
            id={formMessageId}
            className={cn("text-sm font-medium text-destructive", className)}
            {...props}
        >
            {body}
        </p>
    )
}

export {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
}
