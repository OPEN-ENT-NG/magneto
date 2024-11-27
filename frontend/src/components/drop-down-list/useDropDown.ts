import { useState, useRef, useEffect, useCallback } from "react";

export const useDropdown = () => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const isClosing = useRef(false);
  const ignoreNextClick = useRef(false);

  const registerDropdown = useCallback(
    (id: string, ref: HTMLDivElement | null) => {
      dropdownRefs.current[id] = ref;
    },
    [],
  );

  const toggleDropdown = useCallback((id: string | null) => {
    setOpenDropdownId((prevId: string | null) => (prevId === id ? null : id));
    ignoreNextClick.current = true;
  }, []);

  const closeDropdown = useCallback(() => {
    isClosing.current = true;
    setOpenDropdownId(null);
    setTimeout(() => {
      isClosing.current = false;
    }, 0);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ignoreNextClick.current) {
        ignoreNextClick.current = false;
        return;
      }

      if (isClosing.current) return;

      if (openDropdownId) {
        const dropdownRef = dropdownRefs.current[openDropdownId];
        if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
          closeDropdown();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId, closeDropdown]);

  return {
    openDropdownId,
    registerDropdown,
    toggleDropdown,
    closeDropdown,
  };
};
