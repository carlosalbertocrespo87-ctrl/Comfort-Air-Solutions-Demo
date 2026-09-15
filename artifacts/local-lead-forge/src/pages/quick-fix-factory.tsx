import { ArrowLeft, Factory, LockKeyhole, ShieldCheck, TriangleAlert } from 'lucide-react';
import { requestAgentLock } from '@/components/agent-biometric-gate';
import { getStoredAgentSession } from '@/lib/supabase-session';
import { resolvePilotAgentId } from '@/lib/conversation-model';

type FactoryCase = {
  id: string;
  label: string;
  stage: string;
  owner: 'CARLOS' | 'CURSOR';
  attention?: string;
  dueAt?: string;
};

const mockCases: FactoryCase[] = [
  { id: 'qf-mock-01', label: 'Mensaje esperando aprobación', stage: 'MESSAGE_NEEDS_APPROVAL', owner: 'CARLOS', attention: 'APROBAR ANTES DE ENVIAR' },
  { id: 'qf-mock-02', label: 'Prospecto respondió', stage: 'REPLIED', owner: 'CURSOR', attention: 'PREPARAR BORRADOR' },
  { id: 'qf-mock-03', label: 'Cliente quiere comprar', stage: 'OFFER_SENT', owner: 'CARLOS', attention: 'CONFIRMAR VENTA' },
  { id: 'qf-mock-04', label: 'Pago recibido — no contabilizado', stage: 'PAYMENT_RECEIVED', owner: 'CARLOS', attention: 'AUTORIZAR INICIO' },
  { id: 'qf-mock-05', label: 'Faltan materiales o acceso', stage: 'MATERIALS_PENDING', owner: 'CURSOR', attention: 'PREPARAR SOLICITUD' },
  { id: 'qf-mock-06', label: 'Entrega próxima', stage: 'IN_PRODUCTION', owner: 'CURSOR', attention: 'TERMINAR ENTREGA', dueAt: 'FECHA MOCK' },
  { id: 'qf-mock-07', label: 'Bloqueado por cliente', stage: 'NEEDS_REVIEW', owner: 'CARLOS', attention: 'DESTRABAR CLIENTE' },
  { id: 'qf-mock-08', label: 'Bloqueado por pago', stage: 'PAYMENT_PENDING', owner: 'CARLOS', attention: 'ESPERAR PAGO' },
  { id: 'qf-mock-09', label: 'Bloqueado por alcance', stage: 'NEEDS_REVIEW', owner: 'CARLOS', attention: 'ACLARAR ALCANCE' },
  { id: 'qf-mock-10', label: 'Contactado; esperando respuesta', stage: 'CONTACTED', owner: 'CURSOR' },
  { id: 'qf-mock-11', label: 'Prospecto encontrado; puede esperar', stage: 'PROSPECT_FOUND', owner: 'CURSOR' },
];

const topToday = mockCases.slice(0, 4).filter((item) => ['qf-mock-01', 'qf-mock-03', 'qf-mock-04'].includes(item.id));
const productionCount = mockCases.filter((item) => item.stage === 'IN_PRODUCTION').length;

function OwnerPill({ owner }: { owner: FactoryCase['owner'] }) {
  const carlos = owner === 'CARLOS';
  return (
    <span className={`rounded-full px-2 py-1 text-[8px] font-black ${carlos ? 'bg-orange-500/10 text-orange-300' : 'bg-blue-500/10 text-blue-300'}`}>
      {carlos ? 'CARLOS' : 'EQUIPO PREPARA'}
    </span>
  );
}

function CaseCard({ item }: { item: FactoryCase }) {
  return (
    <article className="rounded-xl border border-white/10 bg-[#07111f] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black">{item.label}</p>
          <p className="mt-1 text-[9px] text-slate-500">{item.stage}{item.dueAt ? ` · ${item.dueAt}` : ''}</p>
        </div>
        <OwnerPill owner={item.owner} />
      </div>
      {item.attention && <p className="mt-2 text-[9px] font-bold text-amber-200">Siguiente: {item.attention}</p>}
    </article>
  );
}

export default function QuickFixFactoryPage() {
  const session = getStoredAgentSession();
  const operator = resolvePilotAgentId(session?.agentUserId);
  const operatorName = session?.displayName ?? operator ?? 'Operador autorizado';
  const carlosQueue = mockCases.filter((item) => item.owner === 'CARLOS');
  const teamQueue = mockCases.filter((item) => item.owner === 'CURSOR');

  return (
    <main className="min-h-screen bg-[#030913] text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/10 bg-[#050d18] shadow-2xl">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-[#050d18]/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <a href="/agent-demo" className="flex items-center gap-2 text-slate-300">
              <ArrowLeft className="h-4 w-4" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">Local Lead Forge</p>
                <p className="text-xs font-black text-white">Fábrica Quick‑Fix · QA</p>
              </div>
            </a>
            <button type="button" onClick={requestAgentLock} className="flex items-center gap-1 rounded-lg border border-white/10 px-2 py-2 text-[9px] font-bold text-slate-300">
              <LockKeyhole className="h-3.5 w-3.5" /> Bloquear
            </button>
          </div>
        </header>

        <section className="border-b border-white/10 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] text-slate-400">Operador</p>
              <p className="text-sm font-black">{operatorName}</p>
            </div>
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[9px] font-bold text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" /> Sólo lectura
            </span>
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-3 text-[10px] leading-4 text-amber-100">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            Datos MOCK sanitizados. No son clientes reales. Mensajes, pagos, contabilidad y automatizaciones live permanecen bloqueados.
          </div>
        </section>

        <section className="px-4 py-4">
          <div className="flex items-center gap-2">
            <Factory className="h-4 w-4 text-orange-300" />
            <h1 className="text-sm font-black">Pulso de la fábrica</h1>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/10 bg-[#07111f] p-3">
              <p className="text-[9px] text-slate-500">Capacidad real</p>
              <p className="mt-1 text-xl font-black">0 / 10</p>
              <p className="text-[8px] text-slate-500">clientes reales</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#07111f] p-3">
              <p className="text-[9px] text-slate-500">WIP simulado</p>
              <p className="mt-1 text-xl font-black">{productionCount} / 2</p>
              <p className="text-[8px] text-slate-500">en producción</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#07111f] p-3">
              <p className="text-[9px] text-slate-500">Requiere a Carlos</p>
              <p className="mt-1 text-xl font-black text-orange-300">{carlosQueue.length}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#07111f] p-3">
              <p className="text-[9px] text-slate-500">Equipo puede preparar</p>
              <p className="mt-1 text-xl font-black text-blue-300">{teamQueue.length}</p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <h2 className="text-sm font-black">Top 3 de hoy</h2>
            <span className="rounded-full bg-rose-500/10 px-2 py-1 text-[9px] font-bold text-rose-300">{topToday.length} prioridades</span>
          </div>
          <div className="mt-3 space-y-2">{topToday.map((item) => <CaseCard key={item.id} item={item} />)}</div>

          <details className="mt-5 rounded-xl border border-white/10 bg-[#07111f] p-3">
            <summary className="cursor-pointer text-xs font-black">Cola de Carlos · {carlosQueue.length}</summary>
            <div className="mt-3 space-y-2">{carlosQueue.map((item) => <CaseCard key={item.id} item={item} />)}</div>
          </details>

          <details className="mt-3 rounded-xl border border-white/10 bg-[#07111f] p-3">
            <summary className="cursor-pointer text-xs font-black">Trabajo que el equipo puede preparar · {teamQueue.length}</summary>
            <div className="mt-3 space-y-2">{teamQueue.map((item) => <CaseCard key={item.id} item={item} />)}</div>
          </details>

          <p className="mt-4 text-center text-[9px] leading-4 text-slate-500">Precio de referencia: $149 · mutaciones: NONE · alcance: QA interno</p>
        </section>
      </div>
    </main>
  );
}
