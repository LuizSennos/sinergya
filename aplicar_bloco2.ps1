# Aplica todos os arquivos do bloco 2 de integracao
# Rode na raiz do projeto: .\aplicar_bloco2.ps1

Write-Host "Aplicando bloco 2..." -ForegroundColor Cyan

# Cria pasta components se nao existir
New-Item -ItemType Directory -Force -Path src\components | Out-Null

# LGPD Consent Component
@"
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { apiLGPDConsent } from '@/lib/api';

interface Props { onAccept: () => void; }

export default function LGPDConsent({ onAccept }: Props) {
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  async function handleAccept() {
    setLoading(true);
    try { await apiLGPDConsent(true); onAccept(); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  return (
    <div className='fixed inset-0 bg-sinergya-dark/95 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden'>
        <div className='px-8 pt-8 pb-6 text-white' style={{ background: 'linear-gradient(135deg, #0F172A, #1e293b)' }}>
          <div className='flex justify-center mb-4'>
            <Image src='/logo.png' alt='Sinergya' width={140} height={40} />
          </div>
          <h1 className='text-xl font-bold text-center'>Termo de Consentimento</h1>
          <p className='text-sm text-white/50 text-center mt-1'>Lei Geral de Proteção de Dados — LGPD</p>
        </div>
        <div className='px-8 py-6 space-y-4 max-h-64 overflow-y-auto text-sm text-slate-600 leading-relaxed'>
          <p>Ao utilizar a plataforma <strong>Sinergya</strong>, você concorda com o tratamento dos seus dados pessoais conforme descrito abaixo:</p>
          {[
            ['Coleta de dados', 'Coletamos dados de identificação (nome, e-mail) e dados clínicos necessários para o acompanhamento de saúde.'],
            ['Finalidade', 'Os dados são utilizados exclusivamente para comunicação entre pacientes e equipe de saúde dentro da plataforma.'],
            ['Compartilhamento', 'Dados clínicos são compartilhados somente com profissionais da equipe vinculados ao seu cuidado.'],
            ['Segurança', 'Todos os dados são armazenados com criptografia e acesso controlado por perfil de usuário.'],
            ['Direitos', 'Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento.'],
          ].map(([title, desc], i) => (
            <div key={i} className='flex gap-3'>
              <span className='text-sinergya-green font-bold mt-0.5'>{i+1}.</span>
              <p><strong>{title}:</strong> {desc}</p>
            </div>
          ))}
        </div>
        <div className='px-8 pb-8 space-y-4'>
          <label className='flex items-start gap-3 cursor-pointer'>
            <input type='checkbox' checked={checked} onChange={e => setChecked(e.target.checked)} className='mt-0.5 w-4 h-4 accent-sinergya-green' />
            <span className='text-sm text-slate-700'>Li e concordo com o tratamento dos meus dados pessoais conforme a LGPD (Lei nº 13.709/2018).</span>
          </label>
          <button onClick={handleAccept} disabled={!checked || loading}
            className='w-full py-3.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 transition-all'
            style={{ background: 'linear-gradient(135deg, #4FBF9F, #3A7BD5)' }}>
            {loading ? 'Registrando...' : 'Aceitar e continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}
"@ | Set-Content src\components\LGPDConsent.tsx

# NewUserModal Component
@"
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
"@ | Set-Content src\components\NewUserModal.tsx

# Dashboard index page
@"
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiGetPatients } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  useEffect(() => {
    apiGetPatients().then(patients => {
      if (patients && patients.length > 0) router.replace('/patient/' + patients[0].id);
    }).catch(console.error);
  }, [router]);
  return <div className='flex items-center justify-center h-full text-slate-400 text-sm'>Carregando...</div>;
}
"@ | Set-Content "src\app\(dashboard)\page.tsx"

Write-Host ""
Write-Host "Bloco 2 aplicado!" -ForegroundColor Green
Write-Host ""
Write-Host "Arquivos criados/atualizados:" -ForegroundColor Yellow
Write-Host "  src/components/LGPDConsent.tsx"
Write-Host "  src/components/NewUserModal.tsx"
Write-Host "  src/app/(dashboard)/page.tsx"
Write-Host ""
Write-Host "Copiar manualmente (estao nos downloads):" -ForegroundColor Yellow
Write-Host "  src/lib/api.ts          (api.ts)"
Write-Host "  src/app/admin/page.tsx  (admin/page.tsx)"
Write-Host ""
Write-Host "Backend - copiar para sinergya-backend:" -ForegroundColor Yellow
Write-Host "  app/schemas/message.py"
Write-Host "  app/schemas/user.py"
Write-Host "  app/api/v1/endpoints/messages.py"
