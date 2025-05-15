import React, { useState, createContext, useContext } from 'react';
interface MobileMenuContextType {
  isOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
}
const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined);
export function MobileMenuProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  return <MobileMenuContext.Provider value={{
    isOpen,
    toggleMenu,
    closeMenu
  }}>
      {children}
    </MobileMenuContext.Provider>;
}
export const useMobileMenu = () => {
  const context = useContext(MobileMenuContext);
  if (context === undefined) {
    throw new Error('useMobileMenu must be used within a MobileMenuProvider');
  }
  return context;
};