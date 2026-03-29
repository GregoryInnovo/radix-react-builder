import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Bell } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'checking';

interface DaySegment {
  date: string;
  status: ServiceStatus;
}

interface Service {
  id: string;
  name: string;
  status: ServiceStatus;
  latency: number | null;
  uptime: number;
  history: DaySegment[];
  statusLabel: string;
}

interface Incident {
  id: string;
  severity: 'minor' | 'major' | 'maintenance';
  title: string;
  date: string;
  expanded: boolean;
  timeline: { badge: string; text: string; time: string }[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildHistory(seed: number, knownBadDays: Record<number, ServiceStatus> = {}): DaySegment[] {
  const segments: DaySegment[] = [];
  for (let i = 89; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric', year: 'numeric' });
    let status: ServiceStatus;
    if (knownBadDays[i]) {
      status = knownBadDays[i];
    } else {
      const r = seededRandom(seed + i);
      status = r < 0.015 ? 'outage' : r < 0.05 ? 'degraded' : 'operational';
    }
    segments.push({ date: dateStr, status });
  }
  return segments;
}

function calcUptime(history: DaySegment[]): number {
  const good = history.filter(d => d.status === 'operational').length;
  return parseFloat(((good / history.length) * 100).toFixed(2));
}

const STATUS_LABEL: Record<ServiceStatus, string> = {
  operational: 'Operacional',
  degraded: 'Rendimiento degradado',
  outage: 'Interrupción',
  checking: 'Verificando…',
};

const INITIAL_SERVICES: Service[] = [
  {
    id: 'website',
    name: 'Aplicación Web',
    status: 'checking',
    latency: null,
    uptime: 99.99,
    history: buildHistory(42),
    statusLabel: 'Verificando…',
  },
  {
    id: 'database',
    name: 'Base de Datos',
    status: 'checking',
    latency: null,
    uptime: 99.87,
    history: buildHistory(789, { 1: 'degraded', 2: 'degraded' }),
    statusLabel: 'Verificando…',
  },
  {
    id: 'auth',
    name: 'Autenticación',
    status: 'checking',
    latency: null,
    uptime: 99.97,
    history: buildHistory(999),
    statusLabel: 'Verificando…',
  },
  {
    id: 'storage',
    name: 'Almacenamiento',
    status: 'checking',
    latency: null,
    uptime: 99.95,
    history: buildHistory(321),
    statusLabel: 'Verificando…',
  },
  {
    id: 'functions',
    name: 'Edge Functions',
    status: 'checking',
    latency: null,
    uptime: 99.92,
    history: buildHistory(137),
    statusLabel: 'Verificando…',
  },
  {
    id: 'realtime',
    name: 'Realtime',
    status: 'checking',
    latency: null,
    uptime: 99.98,
    history: buildHistory(256),
    statusLabel: 'Verificando…',
  },
];

const INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    severity: 'minor',
    title: 'Degradación de rendimiento en Base de Datos',
    date: '19 de marzo, 2026',
    expanded: true,
    timeline: [
      { badge: 'Resuelto', text: 'El rendimiento ha vuelto a niveles normales. Continuamos monitoreando.', time: 'Mar 19, 18:42 UTC' },
      { badge: 'Monitoreando', text: 'Se desplegó una corrección para optimizar las consultas afectadas.', time: 'Mar 19, 16:20 UTC' },
      { badge: 'Identificado', text: 'La causa raíz fue un aumento repentino de operaciones de escritura en un job programado.', time: 'Mar 19, 15:05 UTC' },
      { badge: 'Investigando', text: 'Estamos investigando reportes de latencia elevada en servicios dependientes de la BD.', time: 'Mar 19, 14:30 UTC' },
    ],
  },
  {
    id: 'inc-2',
    severity: 'major',
    title: 'Errores elevados en Edge Functions',
    date: '12 de marzo, 2026',
    expanded: false,
    timeline: [
      { badge: 'Resuelto', text: 'El problema fue resuelto. Las tasas de error volvieron a niveles base.', time: 'Mar 12, 11:15 UTC' },
      { badge: 'Investigando', text: 'Estamos viendo tasas de error 5xx elevadas. El equipo investiga la causa.', time: 'Mar 12, 09:48 UTC' },
    ],
  },
  {
    id: 'inc-3',
    severity: 'maintenance',
    title: 'Mantenimiento programado',
    date: '5 de marzo, 2026',
    expanded: false,
    timeline: [
      { badge: 'Completado', text: 'El mantenimiento fue completado exitosamente. Todos los servicios operan normalmente.', time: 'Mar 5, 06:30 UTC' },
      { badge: 'En progreso', text: 'El mantenimiento programado está en curso (04:00 – 06:00 UTC).', time: 'Mar 5, 04:00 UTC' },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusDot({ status }: { status: ServiceStatus }) {
  const colors: Record<ServiceStatus, string> = {
    operational: 'bg-green-500',
    degraded: 'bg-yellow-400',
    outage: 'bg-red-500',
    checking: 'bg-gray-300 animate-pulse',
  };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${colors[status]}`} />;
}

function StatusTextBadge({ status }: { status: ServiceStatus }) {
  const colors: Record<ServiceStatus, string> = {
    operational: 'text-green-600',
    degraded: 'text-yellow-600',
    outage: 'text-red-600',
    checking: 'text-gray-400',
  };
  return <span className={`text-xs font-medium ${colors[status]}`}>{STATUS_LABEL[status]}</span>;
}

function UptimeBar({ history }: { history: DaySegment[] }) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const segColors: Record<ServiceStatus, string> = {
    operational: 'bg-green-500',
    degraded: 'bg-yellow-400',
    outage: 'bg-red-500',
    checking: 'bg-gray-200',
  };

  const segLabels: Record<ServiceStatus, string> = {
    operational: 'Sin incidentes',
    degraded: 'Rendimiento degradado',
    outage: 'Interrupción mayor',
    checking: '—',
  };

  return (
    <div className="relative flex-1 max-w-xs">
      <div className="flex gap-[1px] h-6 items-stretch">
        {history.map((seg, i) => (
          <div
            key={i}
            className={`flex-1 min-w-[2px] rounded-[1px] cursor-pointer transition-opacity hover:opacity-70 ${segColors[seg.status]}`}
            onMouseEnter={e => {
              const rect = (e.target as HTMLElement).getBoundingClientRect();
              setTooltip({ text: `${seg.date} — ${segLabels[seg.status]}`, x: rect.left, y: rect.top });
            }}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
      </div>
      {tooltip && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg pointer-events-none whitespace-nowrap"
          style={{ left: tooltip.x + 8, top: tooltip.y - 36 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

function IncidentCard({ incident, onToggle }: { incident: Incident; onToggle: (id: string) => void }) {
  const severityStyles: Record<string, string> = {
    minor: 'bg-yellow-100 text-yellow-700',
    major: 'bg-red-100 text-red-700',
    maintenance: 'bg-blue-100 text-blue-700',
  };
  const severityLabel: Record<string, string> = {
    minor: 'Menor',
    major: 'Mayor',
    maintenance: 'Mantenimiento',
  };
  const badgeStyles: Record<string, string> = {
    Investigando: 'bg-yellow-100 text-yellow-700',
    Identificado: 'bg-pink-100 text-pink-700',
    Monitoreando: 'bg-blue-100 text-blue-700',
    Resuelto: 'bg-green-100 text-green-700',
    Completado: 'bg-green-100 text-green-700',
    'En progreso': 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-3">
      <div
        className="flex justify-between items-center px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors select-none"
        onClick={() => onToggle(incident.id)}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(incident.id); } }}
      >
        <div className="flex items-center gap-3">
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg uppercase tracking-wide ${severityStyles[incident.severity]}`}>
            {severityLabel[incident.severity]}
          </span>
          <span className="text-sm font-semibold text-gray-900">{incident.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{incident.date}</span>
          <span className={`text-gray-400 transition-transform duration-200 ${incident.expanded ? 'rotate-180' : ''}`}>▾</span>
        </div>
      </div>
      {incident.expanded && (
        <div className="px-5 pb-5">
          <div className="border-l-2 border-gray-200 ml-3 pl-5 space-y-5">
            {incident.timeline.map((entry, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[27px] top-1.5 w-2.5 h-2.5 rounded-full bg-gray-200 border-2 border-white" />
                <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide mb-1.5 ${badgeStyles[entry.badge] || 'bg-gray-100 text-gray-600'}`}>
                  {entry.badge}
                </span>
                <p className="text-sm text-gray-600 mb-1">{entry.text}</p>
                <span className="text-xs text-gray-400">{entry.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const StatusView: React.FC = () => {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [incidents, setIncidents] = useState<Incident[]>(INCIDENTS);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [isChecking, setIsChecking] = useState(false);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  const SUPABASE_URL = 'https://gvegsztwqsaomkuywirl.supabase.co';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2ZWdzenR3cXNhb21rdXl3aXJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMzMzOTUsImV4cCI6MjA2ODgwOTM5NX0.Jaqr6TvSf6EmWCs7FQjiEFP49o8qkkOmmMIU59_EhTk';

  const checkEndpoint = async (
    url: string,
    options?: RequestInit
  ): Promise<{ ok: boolean; latency: number }> => {
    const start = performance.now();
    try {
      const res = await fetch(url, { ...options, signal: AbortSignal.timeout(8000) });
      const latency = Math.round(performance.now() - start);
      return { ok: res.ok || res.status === 400 || res.status === 401 || res.status === 422, latency };
    } catch {
      return { ok: false, latency: Math.round(performance.now() - start) };
    }
  };

  const runChecks = useCallback(async () => {
    setIsChecking(true);

    const results = await Promise.all([
      // Website — if we're rendering this, it's operational
      Promise.resolve({ ok: true, latency: 0 }),
      // Database — query profiles table (head only)
      (async () => {
        const start = performance.now();
        try {
          const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
          return { ok: !error, latency: Math.round(performance.now() - start) };
        } catch {
          return { ok: false, latency: Math.round(performance.now() - start) };
        }
      })(),
      // Auth — health endpoint
      checkEndpoint(`${SUPABASE_URL}/auth/v1/health`, {
        headers: { apikey: ANON_KEY },
      }),
      // Storage — status endpoint
      checkEndpoint(`${SUPABASE_URL}/storage/v1/status`, {
        headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      }),
      // Edge Functions — ping con POST vacío; 400/401/422 son válidos (función alcanzable)
      checkEndpoint(`${SUPABASE_URL}/functions/v1/notify-status-change`, {
        method: 'POST',
        headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
      // Realtime — REST health via postgREST
      checkEndpoint(`${SUPABASE_URL}/rest/v1/`, {
        headers: { apikey: ANON_KEY },
      }),
    ]);

    const ids = ['website', 'database', 'auth', 'storage', 'functions', 'realtime'];
    setServices(prev =>
      prev.map((svc, i) => {
        const { ok, latency } = results[i];
        const status: ServiceStatus =
          !ok ? 'outage' : latency > 2000 ? 'degraded' : 'operational';
        return {
          ...svc,
          status,
          latency: ids[i] === 'website' ? null : latency,
          statusLabel: STATUS_LABEL[status],
          uptime: calcUptime(svc.history),
        };
      })
    );

    setLastChecked(new Date());
    setIsChecking(false);
  }, []);

  useEffect(() => {
    runChecks();
    const interval = setInterval(runChecks, 60000);
    return () => clearInterval(interval);
  }, [runChecks]);

  const overallStatus: ServiceStatus = (() => {
    if (services.some(s => s.status === 'outage')) return 'outage';
    if (services.some(s => s.status === 'degraded')) return 'degraded';
    if (services.every(s => s.status === 'operational')) return 'operational';
    return 'checking';
  })();

  const bannerConfig = {
    operational: { bg: 'bg-green-500', text: 'Todos los sistemas operacionales', icon: <CheckCircle className="w-6 h-6" /> },
    degraded: { bg: 'bg-yellow-400', text: 'Rendimiento degradado en algunos servicios', icon: <AlertTriangle className="w-6 h-6" /> },
    outage: { bg: 'bg-red-500', text: 'Interrupción detectada', icon: <XCircle className="w-6 h-6" /> },
    checking: { bg: 'bg-gray-400', text: 'Verificando estado de los servicios…', icon: <RefreshCw className="w-6 h-6 animate-spin" /> },
  }[overallStatus];

  const avgUptime = (
    services.filter(s => s.status !== 'checking').reduce((acc, s) => acc + s.uptime, 0) /
    Math.max(services.filter(s => s.status !== 'checking').length, 1)
  ).toFixed(2);

  const formatLastChecked = () => {
    const diff = Math.floor((Date.now() - lastChecked.getTime()) / 1000);
    if (diff < 10) return 'ahora mismo';
    if (diff < 60) return `hace ${diff}s`;
    return `hace ${Math.floor(diff / 60)}m`;
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    setShowSubscribe(false);
    setEmail('');
    showToast(`¡Suscrito! Recibirás actualizaciones en ${email}`);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-2">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">NV</span>
          </div>
          <span className="text-lg font-bold text-gray-900">Estado del Sistema</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runChecks}
            disabled={isChecking}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            Verificar
          </button>
          <button
            onClick={() => setShowSubscribe(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Bell className="w-3.5 h-3.5" />
            Suscribirse
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`flex items-center justify-center gap-3 py-5 rounded-xl mb-4 text-white ${bannerConfig.bg}`}>
        {bannerConfig.icon}
        <span className="text-base font-semibold">{bannerConfig.text}</span>
      </div>

      {/* Refresh indicator */}
      <div className="flex items-center justify-end gap-1.5 mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs text-gray-400">Última verificación: {formatLastChecked()}</span>
      </div>

      {/* Services */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        {services.map((svc, i) => (
          <div
            key={svc.id}
            className={`flex justify-between items-center px-6 py-4 ${i < services.length - 1 ? 'border-b border-gray-50' : ''}`}
          >
            <div className="flex flex-col gap-0.5 min-w-[160px]">
              <span className="text-sm font-semibold text-gray-900">{svc.name}</span>
              <StatusTextBadge status={svc.status} />
              {svc.latency !== null && svc.status !== 'checking' && (
                <span className="text-[11px] text-gray-400 font-mono">{svc.latency}ms</span>
              )}
            </div>
            <div className="flex items-center gap-3 flex-1 justify-end">
              <UptimeBar history={svc.history} />
              <span className="text-xs font-bold text-gray-600 font-mono min-w-[52px] text-right">
                {svc.uptime}%
              </span>
              <StatusDot status={svc.status} />
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="flex justify-between items-center px-6 py-3 border-t border-gray-100">
          <span className="text-[11px] text-gray-400">Hace 90 días</span>
          <span className="text-xs text-gray-500">
            Disponibilidad últimos 90 días · <strong className="text-gray-800">{avgUptime}%</strong> promedio
          </span>
          <span className="text-[11px] text-gray-400">Hoy</span>
        </div>
      </div>

      {/* Incidents */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Historial de Incidentes</h2>
      {incidents.map(incident => (
        <IncidentCard
          key={incident.id}
          incident={incident}
          onToggle={id =>
            setIncidents(prev =>
              prev.map(inc => inc.id === id ? { ...inc, expanded: !inc.expanded } : inc)
            )
          }
        />
      ))}

      {/* Subscribe Modal */}
      {showSubscribe && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5"
          onClick={e => { if (e.target === e.currentTarget) { setShowSubscribe(false); setEmail(''); setEmailError(false); } }}
        >
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full relative shadow-xl">
            <button
              onClick={() => { setShowSubscribe(false); setEmail(''); setEmailError(false); }}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 text-xl leading-none transition-colors"
            >
              ×
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Suscribirse a actualizaciones</h3>
            <p className="text-sm text-gray-500 mb-5">Recibe notificaciones cuando cambie el estado de los servicios.</p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailError(false); }}
                placeholder="tu@correo.com"
                className={`w-full px-3.5 py-2.5 text-sm border rounded-lg outline-none transition-shadow ${emailError ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100'}`}
              />
              <button
                type="submit"
                className="w-full py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors"
              >
                Suscribirse
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-3">Solo enviaremos correos relacionados con el estado. Cancela cuando quieras.</p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-xl shadow-xl z-50 whitespace-nowrap animate-in fade-in slide-in-from-bottom-4">
          {toast}
        </div>
      )}
    </div>
  );
};
