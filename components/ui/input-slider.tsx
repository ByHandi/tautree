"use client";

import { useId, useState } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface InputSliderProps extends React.ComponentProps<typeof Slider> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  required?: boolean;
  showValue?: boolean;
  formatValue?: (value: number[]) => React.ReactNode;
  classNames?: {
    base?: string;
    header?: string;
    label?: string;
    value?: string;
    slider?: string;
    description?: string;
    error?: string;
  };
}

function defaultFormatValue(value: number[]) {
  return value.length > 1 ? value.join(" - ") : value[0];
}

function InputSlider(props: InputSliderProps) {
  const {
    label,
    description,
    errorMessage,
    showValue,
    formatValue = defaultFormatValue,
    className,
    classNames,
    required,
    min = 0,
    defaultValue,
    value,
    onValueChange,
    ...rest
  } = props;

  const generatedId = useId();
  const sliderId = rest.id || generatedId;
  const descriptionId = description ? `${sliderId}-description` : undefined;
  const errorId = errorMessage ? `${sliderId}-error` : undefined;
  const describedBy = [rest["aria-describedby"], descriptionId, errorId].filter(Boolean).join(" ");
  const ariaInvalid = rest["aria-invalid"] ?? Boolean(errorMessage);
  const [internalValue, setInternalValue] = useState(defaultValue ?? [min]);
  const displayValue = value ?? internalValue;

  return (
    <Field className={cn("gap-2", [className, classNames?.base])}>
      {(label || showValue) && (
        <div className={cn("flex items-center justify-between gap-3", classNames?.header)}>
          {label && (
            <FieldLabel htmlFor={sliderId} isRequired={required} className={classNames?.label}>
              {label}
            </FieldLabel>
          )}

          {showValue && (
            <span className={cn("text-sm text-muted-foreground", classNames?.value)}>
              {formatValue(displayValue)}
            </span>
          )}
        </div>
      )}

      <Slider
        {...rest}
        id={sliderId}
        min={min}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(nextValue) => {
          if (value === undefined) {
            setInternalValue(nextValue);
          }

          onValueChange?.(nextValue);
        }}
        aria-invalid={ariaInvalid}
        aria-describedby={describedBy || undefined}
        className={classNames?.slider}
      />

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
    </Field>
  );
}

export default InputSlider;
export { InputSlider };
