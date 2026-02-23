'use client';
import { useState } from 'react';
import { apiCreateUser } from '@/lib/api';

interface Props { onClose: () => void; onCreated: () => void; }
const roles = [
  { value: 'profissional', label: 'Profissional' },
  { value: 'academico', label: 'Academico' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'paciente', label: 'Paciente' },
  { value: 'responsavel', label: 'Responsavel Legal' },
];

export default function NewUserModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'profissional', specialty:'', council_number:'', course:'', institution:'' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  function update(field: string, value: string) { setForm(f => ({ ...f, [field]: value })); }

  async function handleCreate() {
    if (!form.name || !form.email || !form.password) { setError('Nome, email e senha sao obrigatorios.'); return; }
    setSaving(true); setError('');
    try { await apiCreateUser(form); onCreated(); }
    catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  const isProfissional = form.role === 'profissional' || form.role === 'supervisor';
  const isAcademico = form.role === 'academico';

  return (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto'>
        <h2 className='text-lg font-bold text-sinergya-dark mb-4'>Novo Usuario</h2>
        <div className='space-y-3'>
          <div>
            <label className='block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider'>Nome completo *</label>
            <input value={form.name} onChange={e=>update('name',e.target.value)} className='w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sinergya-green/30' placeholder='Nome do usuario'/>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider'>Email *</label>
              <input type='email' value={form.email} onChange={e=>update('email',e.target.value)} className='w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sinergya-green/30' placeholder='email@exemplo.com'/>
            </div>
            <div>
              <label className='block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider'>Senha *</label>
              <input type='password' value={form.password} onChange={e=>update('password',e.target.value)} className='w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sinergya-green/30' placeholder='Senha inicial'/>
            </div>
          </div>
          <div>
            <label className='block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider'>Perfil *</label>
            <select value={form.role} onChange={e=>update('role',e.target.value)} className='w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sinergya-green/30 bg-white'>
              {roles.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          {isProfissional && (
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider'>Especialidade</label>
                <input value={form.specialty} onChange={e=>update('specialty',e.target.value)} className='w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sinergya-green/30' placeholder='Ex: Psicologia'/>
              </div>
              <div>
                <label className='block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider'>Conselho</label>
                <input value={form.council_number} onChange={e=>update('council_number',e.target.value)} className='w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sinergya-green/30' placeholder='Ex: CRP 06/12345'/>
              </div>
            </div>
          )}
          {isAcademico && (
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider'>Curso</label>
                <input value={form.course} onChange={e=>update('course',e.target.value)} className='w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sinergya-green/30' placeholder='Ex: Psicologia'/>
              </div>
              <div>
                <label className='block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider'>Instituicao</label>
                <input value={form.institution} onChange={e=>update('institution',e.target.value)} className='w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sinergya-green/30' placeholder='Ex: USP'/>
              </div>
            </div>
          )}
          {error && <div className='bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-xl'>{error}</div>}
        </div>
        <div className='flex gap-2 mt-6'>
          <button onClick={onClose} className='flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition'>Cancelar</button>
          <button onClick={handleCreate} disabled={saving} className='flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50' style={{background:'linear-gradient(135deg, #4FBF9F, #3A7BD5)'}}>
            {saving ? 'Criando...' : 'Criar usuario'}
          </button>
        </div>
      </div>
    </div>
  );
}
