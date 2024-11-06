import { useState } from "react";

export const useEditingId = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  return { editingId, setEditingId };
};
