import React from "react";
import { PageEditorForm } from "@/components/admin/PageEditorForm";

export default function CreateNewPageRoute() {
  return <PageEditorForm isNew={true} />;
}
