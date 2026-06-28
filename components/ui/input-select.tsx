"use client";

import { useId } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type InputSelectOption = {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
};

interface InputSelectProps extends React.ComponentProps<typeof Select> {
  label?: string;
  description?: string;
  errorMessage?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: InputSelectOption[];
  className?: string;
  classNames?: {
    base?: string;
    label?: string;
    trigger?: string;
    content?: string;
    item?: string;
  };
  children?: React.ReactNode;
}

function InputSelect(props: InputSelectProps) {
  const {
    label,
    description,
    errorMessage,
    placeholder,
    required,
    disabled,
    options,
    className,
    classNames,
    children,
    ...rest
  } = props;

  const generatedId = useId();
  const triggerId = generatedId;
  const descriptionId = description ? `${triggerId}-description` : undefined;
  const errorId = errorMessage ? `${triggerId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ");

  return (
    <Field className={cn("gap-1", [className, classNames?.base])}>
      {label && (
        <FieldLabel
          htmlFor={triggerId}
          isRequired={required}
          className={cn("", [classNames?.label])}
        >
          {label}
        </FieldLabel>
      )}

      <Select disabled={disabled} required={required} {...rest}>
        <SelectTrigger
          id={triggerId}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={describedBy || undefined}
          className={cn("w-full", classNames?.trigger)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent className={classNames?.content}>
          {children ??
            options?.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={classNames?.item}
              >
                {option.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {description && (
        <FieldDescription id={descriptionId} className="text-muted-foreground">
          {description}
        </FieldDescription>
      )}

      {errorMessage && (
        <FieldError id={errorId} className="text-xs">
          {errorMessage}
        </FieldError>
      )}
    </Field>
  );
}

export default InputSelect;
export { InputSelect, type InputSelectOption };
