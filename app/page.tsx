import { ArrowRightIcon, PlusIcon } from "lucide-react";

import PageClient from "./page-client";

import { Button } from "@/components/ui/button";
import DatePicker from "@/components/ui/date-picker";
import DateRangePicker from "@/components/ui/date-range-picker";
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

export default function Page() {
  return (
    <div className="p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button startContent={<PlusIcon />}>Create</Button>
            <Button endContent={<ArrowRightIcon />} variant="outline">
              Continue
            </Button>
            <Button isLoading loadingText="Saving...">
              Save
            </Button>
          </div>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>

        <PageClient />

        <InputText required label="Username" placeholder="Username" />

        <InputTextarea
          required
          label="Description"
          placeholder="Write a description..."
          description="Keep it short and clear."
        />

        <InputNumber
          required
          hideStepper
          label="Amount"
          placeholder="0"
          min={0}
          step={1}
          startContent="Rp"
          errorMessage="Amount is required"
        />

        <InputFormattedNumber
          required
          label="Formatted amount"
          placeholder="0"
          startContent="Rp"
          defaultValue={1250000.5}
          // errorMessage="Formatted amount is required"
        />

        <InputSlider
          required
          label="Progress"
          description="Adjust the progress value."
          defaultValue={[45]}
          min={0}
          max={100}
          step={5}
          showValue
        />

        <InputSlider
          label="Budget range"
          defaultValue={[20, 80]}
          min={0}
          max={100}
          step={5}
          showValue
        />

        <InputSelect
          required
          label="Status"
          placeholder="Select status"
          defaultValue="active"
          options={[
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
            { label: "Archived", value: "archived", disabled: true },
          ]}
        />

        <InputCombobox
          required
          label="Assignee"
          placeholder="Select assignee"
          defaultValue="jane"
          options={[
            { label: "Jane Doe", value: "jane" },
            { label: "John Smith", value: "john" },
            { label: "Sarah Connor", value: "sarah" },
            { label: "Archived User", value: "archived", disabled: true },
          ]}
        />

        <InputComboboxMultiple
          required
          label="Reviewers"
          placeholder="Select reviewers"
          defaultValue={["jane", "john"]}
          options={[
            { label: "Jane Doe", value: "jane" },
            { label: "John Smith", value: "john" },
            { label: "Sarah Connor", value: "sarah" },
            { label: "Archived User", value: "archived", disabled: true },
          ]}
        />

        <InputCheckbox
          required
          label="Accept terms"
          description="You agree to the terms and privacy policy."
        />

        <InputSwitch
          label="Email notifications"
          description="Receive email updates for important activity."
          defaultChecked
        />

        <InputCheckboxGroup
          required
          label="Permissions"
          description="Select one or more permissions."
          defaultValue={["read"]}
          options={[
            { label: "Create", value: "create" },
            { label: "Read", value: "read" },
            { label: "Update", value: "update" },
            { label: "Delete", value: "delete", disabled: true },
          ]}
        />

        <InputRadioGroup
          required
          label="Visibility"
          description="Choose who can see this item."
          defaultValue="public"
          options={[
            { label: "Public", value: "public" },
            { label: "Private", value: "private" },
            { label: "Team only", value: "team", disabled: true },
          ]}
        />

        <DatePicker required label="Date" />

        <DateRangePicker
          required
          label="Period"
          dateFormat="dd MMM yyyy"
          placeholder="dd MMM yyyy"
        />
      </div>
    </div>
  );
}
