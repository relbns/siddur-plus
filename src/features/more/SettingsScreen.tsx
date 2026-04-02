import { useSettingsStore } from '../../core/stores';
import type { UserSettings } from '../../core/types';

export function SettingsScreen() {
  const settings = useSettingsStore();

  return (
    <div className="screen">
      <header className="app-header">
        <h1>הגדרות</h1>
      </header>
      <div className="container fade-in" style={{ paddingTop: 'var(--space-4)' }}>
        {/* Nusach */}
        <SettingGroup label="נוסח תפילה">
          <select
            value={settings.nusach}
            onChange={(e) => settings.updateSetting('nusach', e.target.value as UserSettings['nusach'])}
            style={selectStyle}
          >
            <option value="sefard">ספרד</option>
            <option value="ashkenaz">אשכנז</option>
            <option value="edot-hamizrach">עדות המזרח</option>
          </select>
        </SettingGroup>

        {/* Region */}
        <SettingGroup label="מיקום">
          <select
            value={settings.region}
            onChange={(e) => settings.updateSetting('region', e.target.value as UserSettings['region'])}
            style={selectStyle}
          >
            <option value="israel">ישראל</option>
            <option value="diaspora">חו״ל</option>
          </select>
        </SettingGroup>

        {/* Font Scale */}
        <SettingGroup label={`גודל טקסט: ${Math.round(settings.fontScale * 100)}%`}>
          <input
            type="range"
            min={0.7}
            max={2}
            step={0.1}
            value={settings.fontScale}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              settings.updateSetting('fontScale', val);
              document.documentElement.style.setProperty('--font-scale', String(val));
            }}
            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
          />
        </SettingGroup>

        {/* Nikud */}
        <SettingGroup label="הצגת ניקוד">
          <ToggleSwitch
            checked={settings.showNikud}
            onChange={(v) => settings.updateSetting('showNikud', v)}
          />
        </SettingGroup>

        {/* Theme */}
        <SettingGroup label="ערכת נושא">
          <select
            value={settings.theme}
            onChange={(e) => {
              const val = e.target.value as UserSettings['theme'];
              settings.updateSetting('theme', val);
              const isDark = val === 'dark' || (val === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
              document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
            }}
            style={selectStyle}
          >
            <option value="auto">אוטומטי</option>
            <option value="light">בהיר</option>
            <option value="dark">כהה</option>
          </select>
        </SettingGroup>
        {/* Prayer Mode Settings */}
        <SettingGroup label="השאר מסך דולק (בזמן תפילה)">
          <ToggleSwitch
            checked={settings.keepScreenAwake}
            onChange={(v) => settings.updateSetting('keepScreenAwake', v)}
          />
        </SettingGroup>

        <SettingGroup label="הקפץ תזכורת למצב שקט">
          <ToggleSwitch
            checked={settings.silentModeReminder}
            onChange={(v) => settings.updateSetting('silentModeReminder', v)}
          />
        </SettingGroup>
      </div>
    </div>
  );
}

function SettingGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      padding: 'var(--space-4)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 'var(--space-3)',
    }}>
      <span style={{ fontWeight: 500 }}>{label}</span>
      {children}
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: '3rem',
        height: '1.75rem',
        borderRadius: 'var(--radius-full)',
        background: checked ? 'var(--color-primary)' : 'var(--color-border)',
        border: 'none',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background var(--transition-fast)',
        flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute',
        top: '2px',
        right: checked ? '2px' : 'calc(100% - 1.5rem)',
        width: '1.35rem',
        height: '1.35rem',
        borderRadius: '50%',
        background: 'white',
        boxShadow: 'var(--shadow-sm)',
        transition: 'right var(--transition-fast)',
      }} />
    </button>
  );
}

const selectStyle: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-3)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-ui)',
  fontSize: 'var(--text-sm)',
};
