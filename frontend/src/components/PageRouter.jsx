import { useState, useContext, createContext } from 'react';

// Create context for active page
export const PageContext = createContext();

export function PageRouter({ children }) {
  const [activePage, setActivePage] = useState('discover');

  return (
    <PageContext.Provider value={{ activePage, setActivePage }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePageContext() {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePageContext must be used within PageRouter');
  }
  return context;
}
