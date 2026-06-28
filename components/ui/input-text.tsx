import { useId } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

interface InputTextProps extends React.ComponentProps<"input"> {
  label?: string;
  description?: string;
  errorMessage?: string;
  classNames?: {
    base?: string;
    label?: string;
    input?: string;
  };
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
}

function InputText(props: InputTextProps) {
  const {
    required,
    label,
    description,
    errorMessage,
    className,
    classNames,
    startContent,
    endContent,
    ...rest
  } = props;

  const generatedId = useId();
  const inputId = rest.id || generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = errorMessage ? `${inputId}-error` : undefined;
  const describedBy = [rest["aria-describedby"], descriptionId, errorId].filter(Boolean).join(" ");
  const ariaInvalid = rest["aria-invalid"] ?? Boolean(errorMessage);

  return (
    <Field className={cn("gap-1", [className, classNames?.base])}>
      {label && (
        <FieldLabel htmlFor={inputId} isRequired={required} className={cn("", [classNames?.label])}>
          {label}
        </FieldLabel>
      )}

      <InputGroup>
        {startContent && <InputGroupAddon align="inline-start">{startContent}</InputGroupAddon>}

        <InputGroupInput
          {...rest}
          id={inputId}
          required={required}
          aria-invalid={ariaInvalid}
          aria-describedby={describedBy || undefined}
          className={classNames?.input}
        />

        {endContent && <InputGroupAddon align="inline-end">{endContent}</InputGroupAddon>}
      </InputGroup>

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

export default InputText;
