import { useEffect } from 'react';
import { CheckCircle2, Circle, PartyPopper } from 'lucide-react';
import { useChecklistStore } from '@/core/checklist-store';
import './ShabbatChecklist.css';

export function ShabbatChecklist() {
  const { items, toggleItem, checkReset } = useChecklistStore();

  useEffect(() => {
    checkReset();
  }, [checkReset]);

  const allDone = items.every(item => item.checked);

  return (
    <div className={`shabbat-checklist card fade-in ${allDone ? 'all-done' : ''}`}>
      <div className="checklist-header">
        <h3 className="checklist-title">
          {allDone ? 'הכל מוכן לשבת!' : 'הכנות לשבת'}
        </h3>
        {allDone && <PartyPopper className="celebration-icon" size={20} />}
      </div>

      <div className="checklist-items">
        {items.map((item) => (
          <button 
            key={item.id} 
            className={`checklist-item ${item.checked ? 'checked' : ''}`}
            onClick={() => toggleItem(item.id)}
          >
            {item.checked ? (
              <CheckCircle2 className="check-icon" size={20} />
            ) : (
              <Circle className="uncheck-icon" size={20} />
            )}
            <span className="item-label">{item.label}</span>
          </button>
        ))}
      </div>
      
      {!allDone && (
         <div className="checklist-progress">
           <div 
             className="progress-bar" 
             style={{ width: `${(items.filter(i => i.checked).length / items.length) * 100}%` }} 
           />
         </div>
      )}
    </div>
  );
}
