import { useState, useCallback, useMemo } from 'react';
import { HDate } from '@hebcal/core';
import { StandardHeader } from '../../shared/Header';
import './DateConverter.css';

/* Date conversion utilities using @hebcal/core */

export function DateConverter() {
  const [mode, setMode] = useState<'greg-to-heb' | 'heb-to-greg'>('greg-to-heb');
  const [gregDate, setGregDate] = useState(new Date().toISOString().slice(0, 10));
  
  // Hebrew inputs
  const [hebDay, setHebDay] = useState(1);
  const [hebMonth, setHebMonth] = useState(7); // Tishrei
  const [hebYear, setHebYear] = useState(new HDate().getFullYear());

  const [result, setResult] = useState<string | null>(null);

  const months = useMemo(() => {
    // Check if current year is leap year to show Adar I/II
    const isLeap = new HDate(1, 1, hebYear).isLeapYear();
    if (!isLeap) {
      return [
        { id: 7, name: 'תשרי' }, { id: 8, name: 'חשון' }, { id: 9, name: 'כסלו' },
        { id: 10, name: 'טבת' }, { id: 11, name: 'שבט' }, { id: 12, name: 'אדר' },
        { id: 1, name: 'ניסן' }, { id: 2, name: 'אייר' }, { id: 3, name: 'סיון' },
        { id: 4, name: 'תמוז' }, { id: 5, name: 'אב' }, { id: 6, name: 'אלול' },
      ];
    } else {
      return [
        { id: 7, name: 'תשרי' }, { id: 8, name: 'חשון' }, { id: 9, name: 'כסלו' },
        { id: 10, name: 'טבת' }, { id: 11, name: 'שבט' }, { id: 13, name: 'אדר א׳' },
        { id: 14, name: 'אדר ב׳' }, { id: 1, name: 'ניסן' }, { id: 2, name: 'אייר' },
        { id: 3, name: 'סיון' }, { id: 4, name: 'תמוז' }, { id: 5, name: 'אב' },
        { id: 6, name: 'אלול' },
      ];
    }
  }, [hebYear]);

  const convert = useCallback(() => {
    try {
      if (mode === 'greg-to-heb') {
        const d = new Date(gregDate);
        const hd = new HDate(d);
        setResult(hd.renderGematriya(true));
      } else {
        const hd = new HDate(hebDay, hebMonth, hebYear);
        const d = hd.greg();
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        setResult(d.toLocaleDateString('he-IL', options));
      }
    } catch {
      setResult('תאריך לא תקין');
    }
  }, [mode, gregDate, hebDay, hebMonth, hebYear]);

  return (
    <div className="screen">
      <StandardHeader title="ממיר תאריכים" showBack={true} />
      <div className="container fade-in converter-content">
        <div className="converter-tabs">
          <button
            className={`tab ${mode === 'greg-to-heb' ? 'active' : ''}`}
            onClick={() => { setMode('greg-to-heb'); setResult(null); }}
          >
            לועזי → עברי
          </button>
          <button
            className={`tab ${mode === 'heb-to-greg' ? 'active' : ''}`}
            onClick={() => { setMode('heb-to-greg'); setResult(null); }}
          >
            עברי → לועזי
          </button>
        </div>

        <div className="converter-card card">
          {mode === 'greg-to-heb' ? (
            <div className="converter-form">
              <label className="converter-label">בחר תאריך לועזי:</label>
              <input
                type="date"
                className="converter-input"
                value={gregDate}
                onChange={(e) => setGregDate(e.target.value)}
              />
            </div>
          ) : (
            <div className="converter-form heb-inputs">
              <div className="input-group">
                <label>יום:</label>
                <input type="number" min="1" max="30" value={hebDay} onChange={(e) => setHebDay(parseInt(e.target.value))} />
              </div>
              <div className="input-group">
                <label>חודש:</label>
                <select value={hebMonth} onChange={(e) => setHebMonth(parseInt(e.target.value))}>
                  {months.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>שנה:</label>
                <input type="number" value={hebYear} onChange={(e) => setHebYear(parseInt(e.target.value))} />
              </div>
            </div>
          )}
          
          <button className="btn btn-primary converter-btn" onClick={convert}>
            המר תאריך
          </button>
        </div>

        {result && (
          <div className="converter-result fade-in">
            <span className="result-label">{mode === 'greg-to-heb' ? 'תאריך עברי:' : 'תאריך לועזי:'}</span>
            <div className="result-value">{result}</div>
          </div>
        )}
      </div>
    </div>
  );
}
