"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

function PageClient() {
  return (
    <div className="">
      <Button
        variant="outline"
        onClick={() =>
          toast("Event has been created", {
            description: "Sunday, December 03, 2023 at 9:00 AM",
            icon: <Icon name="check" className="text-primary" />,
            action: {
              label: "Undo",
              onClick: () => console.log("Undo"),
            },
          })
        }
      >
        Show Toast
      </Button>
    </div>
  );
}

export default PageClient;
