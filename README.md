# Next shadcn Boilerplate

A Next.js boilerplate with shadcn/ui, Tailwind CSS, TypeScript, ESLint, and Prettier.

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Radix UI
- React DayPicker
- date-fns
- Sonner
- ESLint 9 flat config
- Prettier with Tailwind class sorting and import sorting

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Run with Turbopack:

```bash
npm run dev:turbo
```

## Scripts

```bash
npm run dev
npm run dev:turbo
npm run build
npm run start
npm run lint
npm run format
npm run typecheck
```

## UI Components

Base shadcn-style components live in `components/ui`.

Custom form components:

- `InputText`
- `InputTextarea`
- `InputNumber`
- `InputFormattedNumber`
- `InputSlider`
- `InputSelect`
- `InputCombobox`
- `InputComboboxMultiple`
- `InputCheckbox`
- `InputSwitch`
- `InputCheckboxGroup`
- `InputRadioGroup`
- `DatePicker`
- `DateRangePicker`

Supporting primitives:

- `Button`
- `Icon`
- `Input`
- `InputGroup`
- `Select`
- `Combobox`
- `Checkbox`
- `Switch`
- `Slider`
- `RadioGroup`
- `Textarea`
- `Spinner`
- `Field`
- `Label`
- `Calendar`
- `Popover`
- `Separator`

## Component Usage

```tsx
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/ui/date-picker";
import DateRangePicker from "@/components/ui/date-range-picker";
import Icon from "@/components/ui/icon";
import InputCheckbox from "@/components/ui/input-checkbox";
import InputCheckboxGroup from "@/components/ui/input-checkbox-group";
import InputCombobox from "@/components/ui/input-combobox";
import InputComboboxMultiple from "@/components/ui/input-combobox-multiple";
import InputFormattedNumber from "@/components/ui/input-formatted-number";
import InputNumber from "@/components/ui/input-number";
import InputRadioGroup from "@/components/ui/input-radio-group";
import InputSelect from "@/components/ui/input-select";
import InputSlider from "@/components/ui/input-slider";
import InputSwitch from "@/components/ui/input-switch";
import InputText from "@/components/ui/input-text";
import InputTextarea from "@/components/ui/input-textarea";
import { Spinner } from "@/components/ui/spinner";
```

Example:

```tsx
<Button startContent={<Icon name="plus" />}>Create</Button>

<Button endContent={<Icon name="arrow-right" />} variant="outline">
  Continue
</Button>

<Button isLoading loadingText="Saving...">
  Save
</Button>

<Spinner />

<InputText required label="Username" placeholder="Username" />

<InputTextarea label="Description" placeholder="Write a description..." />

<InputNumber required hideStepper label="Amount" min={0} step={1} startContent="Rp" />

<InputFormattedNumber
  label="Formatted amount"
  startContent="Rp"
  defaultValue={1250000.5}
/>

<InputSlider label="Progress" defaultValue={[45]} min={0} max={100} step={5} showValue />

<InputSlider label="Budget range" defaultValue={[20, 80]} min={0} max={100} step={5} showValue />

<InputSelect
  label="Status"
  placeholder="Select status"
  options={[
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ]}
/>

<InputCombobox
  label="Assignee"
  placeholder="Select assignee"
  defaultValue="jane"
  options={[
    { label: "Jane Doe", value: "jane" },
    { label: "John Smith", value: "john" },
  ]}
/>

<InputComboboxMultiple
  label="Reviewers"
  placeholder="Select reviewers"
  defaultValue={["jane", "john"]}
  options={[
    { label: "Jane Doe", value: "jane" },
    { label: "John Smith", value: "john" },
  ]}
/>

<InputCheckbox
  label="Accept terms"
  description="You agree to the terms and privacy policy."
/>

<InputSwitch
  label="Email notifications"
  description="Receive email updates for important activity."
  defaultChecked
/>

<InputCheckboxGroup
  label="Permissions"
  defaultValue={["read"]}
  options={[
    { label: "Create", value: "create" },
    { label: "Read", value: "read" },
  ]}
/>

<InputRadioGroup
  label="Visibility"
  defaultValue="public"
  options={[
    { label: "Public", value: "public" },
    { label: "Private", value: "private" },
  ]}
/>

<DatePicker label="Date" />

<DateRangePicker label="Period" />
```

## Formatting

Prettier is configured in `.prettierrc` with:

- `prettier-plugin-tailwindcss`
- `@trivago/prettier-plugin-sort-imports`

Tailwind class sorting includes `cn` and `cva` via `tailwindFunctions`.

Run formatting:

```bash
npm run format
```

## Linting

ESLint uses the Next.js 15 config through `FlatCompat`, with TypeScript support and `eslint-config-prettier` to avoid conflicts with Prettier.

Run linting:

```bash
npm run lint
```

Run type checking:

```bash
npm run typecheck
```

Run a production build:

```bash
npm run build
```

## Theme

Theme tokens are defined in `app/globals.css` using OKLCH colors.

The current palette uses a blue/cyan direction with:

- cyan primary color
- blue-tinted light surfaces
- navy blue dark background
- blue-tinted dark cards, borders, inputs, and accents

## Adding shadcn Components

Use the shadcn CLI:

```bash
npx shadcn@latest add button
```

Generated UI components are placed under `components/ui`.
