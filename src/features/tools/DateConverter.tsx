import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HDate } from '@hebcal/core';
import './DateConverter.css';

function gematriya(n: number): string {
  const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
  const hundreds = ['', 'ק', 'ר', 'ש', 'ת'];

  if (n === 15) return 'ט״ו';
  if (n === 16) return 'ט״ז';

  let result = '';
  if (n >= 100) { result += hundreds[Math.floor(n / 100)] ?? ''; n %= 100; }
  if (n >= 10) { result += tens[Math.floor(n / 10)] ?? ''; n %= 10; }
  if (n > 0) { result += ones[n] ?? ''; }

  if (result.length > 1) {
    result = result.slice(0, -1) + '״' + result.slice(-1);
  } else if (result.length === 1) {
    result += '׳';
  }
  return result;
}

const HE_MONTHS = [
  '', 'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול',
  'תשרי', 'חשון', 'כסלו', 'טבת', 'שבט', 'אדר', 'אדר ב׳',
];

export function DateConverter() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'greg-to-heb' | 'heb-to-greg'>('greg-to-heb');
  const [gregDate, setGregDate] = useState(new Date().toISOString().slice(0, 10));
  const [result, setResult] = useState<string | null>(null);

  const convert = useCallback(() => {
    try {
      if (mode === 'greg-to-heb') {
        const d = new Date(gregDate);
        const hd = new HDate(d);
        const dayStr = gematriya(hd.getDate());
        const monthName = HE_MONTHS[hd.getMonth()] ?? '';
        const yearStr = hd.renderGematriya(true).split(' ').pop() ?? '';
        setResult(`${dayStr} ${monthName} ${yearStr}`);
      }
    } catch {
      setResult('תאריך לא תקין');
    }
  }, [mode, gregDate]);

  return (
    <div className="screen">
      <header className="app-header">
        <button className="reader-back-btn" onClick={() => navigate('/more')} aria-label="חזרה">←</button>
        <h1>ממיר תאריכים</h1>
        <div style={{ width: '2rem' }} />
      </header>
      <div className="container fade-in converter-content">
        {/* Mode toggle */}
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

        {mode === 'greg-to-heb' ? (
          <div className="converter-form">
            <label className="converter-label">בחר תאריך לועזי:</label>
            <input
              type="date"
              className="converter-input"
              value={gregDate}
              onChange={(e) => setGregDate(e.target.value)}
            />
            <button className="btn btn-primary converter-btn" onClick={convert}>
              המר
            </button>
          </div>
        ) : (
          <div className="converter-form">
            <p className="converter-coming-soon">
              המרה מעברי ללועזי — בקרוב!
            </p>
          </div>
        )}

        {result && (
          <div className="converter-result card">
            <span className="result-label">תאריך עברי:</span>
            <span className="result-value">{result}</span>
          </div>
        )}
      </div>
    </div>
  );
}
