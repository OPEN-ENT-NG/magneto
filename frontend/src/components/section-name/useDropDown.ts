import { useState, useRef, useEffect, useCallback } from "react";

export const useDropdown = () => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const registerDropdown = useCallback(
    (id: string, ref: HTMLDivElement | null) => {
      dropdownRefs.current[id] = ref;
    },
    [],
  );

  const toggleDropdown = useCallback((id: string | null) => {
    setOpenDropdownId((prevId) => (prevId === id ? null : id));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openDropdownId &&
        !dropdownRefs.current[openDropdownId]?.contains(event.target as Node)
      ) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId]);

  return {
    openDropdownId,
    registerDropdown,
    toggleDropdown,
  };
};
