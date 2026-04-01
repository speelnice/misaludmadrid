'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  published: boolean;
  created_at: string;
};

export default function AdminFAQs() {
  const sb = createClient();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | 'new' | FAQ>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const [form, setForm] = useState({ question: '', answer: '', category: 'General', order: 0, published: true });

  useEffect(() => { fetchFAQs(); }, []);

  async function fetchFAQs() {
    setLoading(true);
    const { data } = await sb.from('faqs').select('*').order('order', { ascending: true });
    setFaqs(data || []);
    setLoading(false);
  }

  function openNew() {
    setForm({ question: '', answer: '', category: 'General', order: faqs.length, published: true });
    setModal('new');
  }

  function openEdit(faq: FAQ) {
    setForm({ question: faq.question, answer: faq.answer, category: faq.category, order: faq.order, published: faq.published });
    setModal(faq);
  }

  function showToast(msg: string, type: 'ok' | 'err') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSave() {
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    if (modal === 'new') {
      const { error } = await sb.from('faqs').insert([form]);
      if (error) showToast('Error al guardar', 'err');
      else showToast('FAQ creada', 'ok');
    } else {
      const faq = modal as FAQ;
      const { error } = await sb.from('faqs').update(form).eq('id', faq.id);
      if (error) showToast('Error al actualizar', 'err');
      else showToast('FAQ actualizada', 'ok');
    }
    setSaving(false);
    setModal(null);
    fetchFAQs();
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const { error } = await sb.from('faqs').delete().eq('id', id);
    if (error) showToast('Error al eliminar', 'err');
    else { showToast('FAQ eliminada', 'ok'); fetchFAQs(); }
    setDeleting(null);
  }

  async function togglePublished(faq: FAQ) {
    await sb.from('faqs').update({ published: !faq.published }).eq('id', faq.id);
    fetchFAQs();
  }

  const s = {
    page: { padding: 'var(--space-8)', maxWidth: '960px', margin: '0 auto' } as React.CSSProperties,
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' } as React.CSSProperties,
    title: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 400, color: 'var(--text-primary)' } as React.CSSProperties,
    card: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' } as React.CSSProperties,
    row: { display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)', padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border-color)' } as React.CSSProperties,
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 'var(--space-4)' } as React.CSSProperties,
    modalBox: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: 'var(--space-8)', width: '100%', maxWidth: '560px', boxShadow: 'var(--shadow-lg)' } as React.CSSProperties,
    input: { width: '100%', padding: '0.625rem 0.875rem', border: '1.5px solid var(--border-color)', borderRadius: '0.5rem', fontSize: 'var(--text-sm)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', outline: 'none' } as React.CSSProperties,
    label: { display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' },
    toastBase: { position: 'fixed', bottom: '1.5rem', right: '1.5rem', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', fontSize: 'var(--text-sm)', fontWeight: 500, zIndex: 200, boxShadow: 'var(--shadow-md)' } as React.CSSProperties,
  };

  return (
    <div style={s.page}>
      {/* Toast */}
      {toast && (
        <div style={{ ...s.toastBase, background: toast.type === 'ok' ? '#437a22' : '#a12c7b', color: '#fff' }}>
          {toast.msg}
        </div>
      )}

      <div style={s.header}>
        <div>
          <h1 style={s.title}>Preguntas Frecuentes</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {faqs.length} pregunta{faqs.length !== 1 ? 's' : ''} en total
          </p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Nueva FAQ</button>
      </div>

      <div style={s.card}>
        {loading && (
          <div style={{ padding: 'var(--space-16)', textAlign: 'center', color: 'var(--text-muted)' }}>
            Cargando...
          </div>
        )}
        {!loading && faqs.length === 0 && (
          <div style={{ padding: 'var(--space-16)', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: 'var(--space-4)' }}>No hay preguntas frecuentes todavía.</p>
            <button className="btn btn-primary" onClick={openNew}>Crear primera FAQ</button>
          </div>
        )}
        {!loading && faqs.map((faq, i) => (
          <div key={faq.id} style={{ ...s.row, borderBottom: i === faqs.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 'var(--text-xs)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '999px', padding: '0.125rem 0.5rem', color: 'var(--text-muted)' }}>
                  {faq.category}
                </span>
                <span style={{ fontSize: 'var(--text-xs)', borderRadius: '999px', padding: '0.125rem 0.5rem', background: faq.published ? 'rgba(67,122,34,0.1)' : 'rgba(122,121,116,0.1)', color: faq.published ? '#437a22' : 'var(--text-muted)' }}>
                  {faq.published ? 'Publicada' : 'Borrador'}
                </span>
              </div>
              <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{faq.question}</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '600px' }}>{faq.answer}</p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0, alignItems: 'center' }}>
              <button onClick={() => togglePublished(faq)} style={{ fontSize: 'var(--text-xs)', padding: '0.375rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {faq.published ? 'Despublicar' : 'Publicar'}
              </button>
              <button onClick={() => openEdit(faq)} style={{ fontSize: 'var(--text-xs)', padding: '0.375rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Editar
              </button>
              <button onClick={() => handleDelete(faq.id)} disabled={deleting === faq.id} style={{ fontSize: 'var(--text-xs)', padding: '0.375rem 0.75rem', border: '1px solid rgba(161,44,123,0.3)', borderRadius: '0.375rem', background: 'transparent', color: '#a12c7b', cursor: 'pointer', opacity: deleting === faq.id ? 0.5 : 1 }}>
                {deleting === faq.id ? '...' : 'Eliminar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal !== null && (
        <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div style={s.modalBox}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 400, marginBottom: 'var(--space-6)', color: 'var(--text-primary)' }}>
              {modal === 'new' ? 'Nueva FAQ' : 'Editar FAQ'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={s.label}>Pregunta</label>
                <input style={s.input} value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="¿Cuál es tu pregunta?" />
              </div>
              <div>
                <label style={s.label}>Respuesta</label>
                <textarea style={{ ...s.input, minHeight: '120px', resize: 'vertical' as const }} value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} placeholder="Escribe la respuesta..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                  <label style={s.label}>Categoría</label>
                  <select style={s.input} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    <option>General</option>
                    <option>Seguro</option>
                    <option>Citas</option>
                    <option>Pagos</option>
                    <option>Cuenta</option>
                  </select>
                </div>
                <div>
                  <label style={s.label}>Orden</label>
                  <input type="number" style={s.input} value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
                Publicada (visible en el sitio)
              </label>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.question.trim() || !form.answer.trim()}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
