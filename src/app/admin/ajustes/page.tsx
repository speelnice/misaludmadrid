'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type Setting = {
  key: string;
  value: string;
  label: string;
  description?: string;
  type: 'text' | 'email' | 'url' | 'textarea' | 'toggle';
};

const DEFAULT_SETTINGS: Setting[] = [
  { key: 'site_name', value: '', label: 'Nombre del sitio', description: 'Nombre visible en el encabezado y pestaña del navegador', type: 'text' },
  { key: 'contact_email', value: '', label: 'Email de contacto', description: 'Dirección de email que aparece en el sitio', type: 'email' },
  { key: 'contact_phone', value: '', label: 'Teléfono de contacto', description: 'Número de teléfono visible en el sitio', type: 'text' },
  { key: 'site_description', value: '', label: 'Descripción del sitio', description: 'Descripción breve para SEO y redes sociales', type: 'textarea' },
  { key: 'footer_text', value: '', label: 'Texto del pie de página', description: 'Mensaje o aviso legal en el footer', type: 'textarea' },
  { key: 'booking_url', value: '', label: 'URL de reservas', description: 'Enlace externo para reservar cita', type: 'url' },
  { key: 'maintenance_mode', value: 'false', label: 'Modo mantenimiento', description: 'Muestra un mensaje de mantenimiento a los visitantes', type: 'toggle' },
  { key: 'show_faqs', value: 'true', label: 'Mostrar FAQs en el sitio', description: 'Activa/desactiva la sección de preguntas frecuentes', type: 'toggle' },
];

export default function AdminAjustes() {
  const sb = createClient();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  async function fetchSettings() {
    setLoading(true);
    const { data } = await sb.from('settings').select('key, value');
    const map: Record<string, string> = {};
    DEFAULT_SETTINGS.forEach(s => { map[s.key] = s.value; });
    (data || []).forEach((row: { key: string; value: string }) => { map[row.key] = row.value; });
    setSettings(map);
    setLoading(false);
  }

  function set(key: string, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function showToast(msg: string, type: 'ok' | 'err') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSave() {
    setSaving(true);
    const rows = Object.entries(settings).map(([key, value]) => ({ key, value }));
    const { error } = await sb.from('settings').upsert(rows, { onConflict: 'key' });
    if (error) showToast('Error al guardar ajustes', 'err');
    else { showToast('Ajustes guardados', 'ok'); setDirty(false); }
    setSaving(false);
  }

  const s = {
    page: { padding: 'var(--space-8)', maxWidth: '720px', margin: '0 auto' } as React.CSSProperties,
    title: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 400, color: 'var(--text-primary)' } as React.CSSProperties,
    section: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: 'var(--space-6)' } as React.CSSProperties,
    sectionTitle: { padding: 'var(--space-4) var(--space-6)', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' },
    row: { padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', alignItems: 'start' } as React.CSSProperties,
    rowFull: { padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--border-color)' } as React.CSSProperties,
    input: { width: '100%', padding: '0.625rem 0.875rem', border: '1.5px solid var(--border-color)', borderRadius: '0.5rem', fontSize: 'var(--text-sm)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', outline: 'none' } as React.CSSProperties,
    labelText: { fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' } as React.CSSProperties,
    descText: { fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' } as React.CSSProperties,
    toastBase: { position: 'fixed', bottom: '1.5rem', right: '1.5rem', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', fontSize: 'var(--text-sm)', fontWeight: 500, zIndex: 200, boxShadow: 'var(--shadow-md)' } as React.CSSProperties,
  };

  const generalKeys = ['site_name', 'site_description', 'footer_text'];
  const contactKeys = ['contact_email', 'contact_phone', 'booking_url'];
  const toggleKeys = ['maintenance_mode', 'show_faqs'];

  function renderField(def: Setting) {
    const value = settings[def.key] ?? def.value;
    if (def.type === 'toggle') {
      return (
        <div key={def.key} style={{ ...s.row, gridTemplateColumns: '1fr auto', alignItems: 'center', borderBottom: def.key === toggleKeys[toggleKeys.length - 1] ? 'none' : '1px solid var(--border-color)' }}>
          <div>
            <p style={s.labelText}>{def.label}</p>
            {def.description && <p style={s.descText}>{def.description}</p>}
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
            <input type="checkbox" checked={value === 'true'} onChange={e => set(def.key, e.target.checked ? 'true' : 'false')} style={{ opacity: 0, width: 0, height: 0 }} />
            <span style={{
              position: 'absolute', inset: 0, borderRadius: '999px',
              background: value === 'true' ? 'var(--brand, #01696f)' : 'var(--border-color)',
              transition: 'background 0.2s',
            }}>
              <span style={{
                position: 'absolute', top: '3px',
                left: value === 'true' ? '23px' : '3px',
                width: '18px', height: '18px', borderRadius: '50%',
                background: 'white', transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </span>
          </label>
        </div>
      );
    }
    if (def.type === 'textarea') {
      return (
        <div key={def.key} style={{ ...s.rowFull, borderBottom: def.key === generalKeys[generalKeys.length - 1] ? 'none' : '1px solid var(--border-color)' }}>
          <p style={s.labelText}>{def.label}</p>
          {def.description && <p style={s.descText}>{def.description}</p>}
          <textarea style={{ ...s.input, marginTop: 'var(--space-2)', minHeight: '80px', resize: 'vertical' as const }} value={value} onChange={e => set(def.key, e.target.value)} />
        </div>
      );
    }
    return (
      <div key={def.key} style={{ ...s.row, borderBottom: (def.key === generalKeys[generalKeys.length - 1] || def.key === contactKeys[contactKeys.length - 1]) ? 'none' : '1px solid var(--border-color)' }}>
        <div>
          <p style={s.labelText}>{def.label}</p>
          {def.description && <p style={s.descText}>{def.description}</p>}
        </div>
        <input type={def.type} style={s.input} value={value} onChange={e => set(def.key, e.target.value)} />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Cargando ajustes...</p>
      </div>
    );
  }

  return (
    <div style={s.page}>
      {toast && (
        <div style={{ ...s.toastBase, background: toast.type === 'ok' ? '#437a22' : '#a12c7b', color: '#fff' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={s.title}>Ajustes</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Configuración general del sitio</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving || !dirty}>
          {saving ? 'Guardando...' : dirty ? 'Guardar cambios' : 'Sin cambios'}
        </button>
      </div>

      {/* General */}
      <div style={s.section}>
        <div style={s.sectionTitle}>General</div>
        {DEFAULT_SETTINGS.filter(d => generalKeys.includes(d.key)).map(renderField)}
      </div>

      {/* Contacto */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Contacto y enlaces</div>
        {DEFAULT_SETTINGS.filter(d => contactKeys.includes(d.key)).map(renderField)}
      </div>

      {/* Visibilidad */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Visibilidad</div>
        {DEFAULT_SETTINGS.filter(d => toggleKeys.includes(d.key)).map(renderField)}
      </div>
    </div>
  );
}
