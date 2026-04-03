import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ArrowRight, Navigation } from 'lucide-react';
import { useSidebarStore } from '@/core/sidebar-store';
import { CompassModal } from './CompassModal';
import './Header.css';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  backTo?: string;
  onBack?: () => void;
  showMenu?: boolean;
  rightElement?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * StandardHeader
 * Consistent header across all screens. 
 * Layout (RTL): [Back Button] -- [Title] -- [Menu/Right Element]
 */
export function StandardHeader({ 
  title, 
  showBack = false, 
  backTo, 
  onBack,
  showMenu = true,
  rightElement,
  children
}: HeaderProps) {
  const navigate = useNavigate();
  const toggleSidebar = useSidebarStore((s: { toggle: () => void }) => s.toggle);
  const [isCompassOpen, setIsCompassOpen] = React.useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="standard-header">
      <div className="header-left">
        {showMenu && (
          <button className="header-btn sidebar-trigger" onClick={toggleSidebar} aria-label="תפריט">
            <Menu size={22} />
          </button>
        )}
      </div>

      <div className="header-center">
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-right">
        <button 
          className="header-btn" 
          onClick={() => setIsCompassOpen(true)}
          aria-label="מצפן כיוון תפילה"
        >
          <Navigation size={22} />
        </button>
        {rightElement}
        {showBack && (
          <button className="header-btn" onClick={handleBack} aria-label="חזרה">
            <ArrowRight size={22} />
          </button>
        )}
      </div>
      
      <CompassModal isOpen={isCompassOpen} onClose={() => setIsCompassOpen(false)} />
      
      {children}
    </header>
  );
}
