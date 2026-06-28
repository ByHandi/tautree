"use client";

import { useId } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface InputCheckboxProps extends React.ComponentProps<typeof Checkbox> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  classNames?: {
    base?: string;
    checkbox?: string;
    label?: string;
    description?: string;
    error?: string;
  };
}

function InputCheckbox(props: InputCheckboxProps) {
  const { label, description, errorMessage, className, classNames, required, ...rest } = props;

  const generatedId = useId();
  const checkboxId = rest.id || generatedId;
  const descriptionId = description ? `${checkboxId}-description` : undefined;
  const errorId = errorMessage ? `${checkboxId}-error` : undefined;
  const describedBy = [rest["aria-describedby"], descriptionId, errorId].filter(Boolean).join(" ");
  const ariaInvalid = rest["aria-invalid"] ?? Boolean(errorMessage);

  return (
    <Field
      data-disabled={rest.disabled || undefined}
      data-invalid={Boolean(errorMessage) || undefined}
      orientation="horizontal"
      className={cn("gap-2", [className, classNames?.base])}
    >
      <Checkbox
        {...rest}
        id={checkboxId}
        required={required}
        aria-invalid={ariaInvalid}
        aria-describedby={describedBy || undefined}
        className={classNames?.checkbox}
      />

      <FieldContent>
        {label && (
          <FieldLabel htmlFor={checkboxId} isRequired={required} className={classNames?.label}>
            {label}
          </FieldLabel>
        )}

        {description && (
          <FieldDescription id={descriptionId} className={classNames?.description}>
            {description}
          </FieldDescription>
        )}

        {errorMessage && (
          <FieldError id={errorId} className={cn("text-xs", classNames?.error)}>
            {errorMessage}
          </FieldError>
        )}
      </FieldContent>
    </Field>
  );
}

export default InputCheckbox;
export { InputCheckbox };
