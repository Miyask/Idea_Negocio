/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Home, 
  Zap, 
  Layers, 
  FileText, 
  Bell, 
  Plus, 
  Play, 
  CheckCircle2,
  RefreshCw,
  Bug,
  Wand2,
  Rocket,
  ArrowRight,
  Lock,
  AtSign,
  Eye,
  Terminal,
  Send,
  ChevronDown,
  Sparkles,
  Search,
  MoreVertical,
  LogOut,
  CreditCard,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { User, Flow, Activity } from './types';

// --- Context ---
const AuthContext = createContext<{
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}>({
  user: null,
  login: async () => false,
  logout: () => {},
  loading: true,
});

const useAuth = () => useContext(AuthContext);

// --- API Helpers ---
const api = {
  async getFlows(userId: string): Promise<Flow[]> {
    const res = await fetch(`/api/flows/${userId}`);
    return res.json();
  },
  async getActivities(userId: string): Promise<Activity[]> {
    const res = await fetch(`/api/activities/${userId}`);
    return res.json();
  },
  async createFlow(flow: Partial<Flow>): Promise<Flow> {
    const res = await fetch('/api/flows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flow),
    });
    return res.json();
  }
};

// --- Components ---

function TopBar() {
  const { user, logout } = useAuth();
  return (
    <header className="bg-surface sticky top-0 z-50 flex justify-between items-center px-6 py-4 w-full border-b border-outline-variant/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30">
          <img 
            alt="User profile" 
            className="w-full h-full object-cover" 
            src={`https://picsum.photos/seed/${user?.email}/100/100`} 
            referrerPolicy="no-referrer"
          />
        </div>
        <span className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-primary to-secondary font-headline">
          FlowCraft AI
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button className="text-on-surface-variant hover:bg-surface-container-highest transition-colors p-2 rounded-full relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
        </button>
        <button 
          onClick={logout}
          className="text-on-surface-variant hover:bg-surface-container-highest transition-colors p-2 rounded-full"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

function NavBar() {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/services', label: 'Servicios', icon: Zap },
    { path: '/flows', label: 'Flujos', icon: Layers },
    { path: '/requests', label: 'Nueva', icon: FileText },
  ];

  return (
    <>
      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-surface-container/80 backdrop-blur-xl border-t border-outline-variant/10">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center p-2 transition-all active:scale-95",
                isActive ? "text-primary" : "text-on-surface-variant"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive && "fill-primary/20")} />
              <span className="text-[10px] uppercase font-bold tracking-widest mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 flex-col gap-6 p-4 glass-panel rounded-r-2xl border-y border-r border-outline-variant/10 z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path}
              to={item.path}
              className={cn(
                "p-3 rounded-xl transition-all group relative",
                isActive ? "text-primary bg-surface-container-highest" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-highest"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="absolute left-full ml-4 px-3 py-1 rounded bg-surface-container-highest text-on-surface text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pl-20">
      <TopBar />
      <NavBar />
      <main className="max-w-7xl mx-auto px-6 pt-8">
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState<User | null>({
    id: '1',
    email: 'alex@flowcraft.ai',
    name: 'Alex'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // No login required, user is pre-set
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('fc_user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fc_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      <BrowserRouter>
        <Routes>
          <Route 
            path="/*" 
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/flows" element={<FlowsPage />} />
                  <Route path="/requests" element={<NewRequestPage />} />
                  {/* Fallback to dashboard */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Layout>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

// --- Pages ---

function StatCard({ icon: Icon, color, label, value, trend }: any) {
  return (
    <div className={cn(
      "bg-surface-container-low p-8 rounded-2xl border-l-4 group hover:bg-surface-container-high transition-all duration-300",
      color === 'primary' ? "border-primary" : color === 'secondary' ? "border-secondary" : "border-tertiary"
    )}>
      <div className="flex items-center justify-between mb-4">
        <Icon className={cn("w-8 h-8", color === 'primary' ? "text-primary" : color === 'secondary' ? "text-secondary" : "text-tertiary")} />
        {trend && (
          <span className={cn(
            "px-2 py-1 rounded text-[10px] font-bold",
            color === 'primary' ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
          )}>{trend}</span>
        )}
      </div>
      <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">{label}</p>
      <p className="text-4xl font-bold font-headline tracking-tighter">{value}</p>
    </div>
  );
}

function DashboardPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (user) {
      api.getActivities(user.id).then(setActivities);
    }
  }, [user]);

  return (
    <div className="space-y-12">
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-2 block">Panel de Control</span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface font-headline">Bienvenido de nuevo, {user?.name}</h1>
          </div>
          <div className="flex gap-3">
            <Link to="/requests" className="bg-surface-container-highest hover:bg-surface-bright text-on-surface px-6 py-3 rounded-xl flex items-center gap-2 transition-all text-sm font-medium border border-outline-variant/10">
              <Plus className="w-4 h-4" /> Nuevo Flujo
            </Link>
            <button className="bg-gradient-to-br from-primary to-secondary text-surface font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 text-sm">
              Ejecutar Todo
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={RefreshCw} color="primary" label="Automatizaciones Activas" value="8" trend="+12%" />
        <StatCard icon={Clock} color="secondary" label="Horas Ahorradas (Mes)" value="142h" trend="OPTIMIZADO" />
        <StatCard icon={CreditCard} color="tertiary" label="Próxima Facturación" value="15/10/2023" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-7 bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant/10">
          <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
            <h2 className="text-xl font-bold font-headline">Actividad Reciente</h2>
            <span className="text-xs text-primary font-medium hover:underline cursor-pointer">Ver Historial</span>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {activities.map((act) => (
              <div key={act.id} className="flex items-center gap-4 p-6 hover:bg-surface-container-highest transition-all group">
                <div className={cn(
                  "w-12 h-12 flex items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                  act.type === 'BACKUP' ? "bg-green-500/10 text-green-400" : act.type === 'REPORT' ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                )}>
                  {act.type === 'BACKUP' ? <CheckCircle2 className="w-6 h-6" /> : act.type === 'REPORT' ? <FileText className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-on-surface">{act.title}</h3>
                  <p className="text-xs text-on-surface-variant">{act.time} • {act.status}</p>
                </div>
                <div>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-surface-container-highest text-on-surface-variant border border-outline-variant/20 uppercase tracking-widest">{act.type}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-5 space-y-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/80 to-secondary/80 rounded-3xl p-8 text-surface h-full min-h-[240px] flex flex-col justify-end group">
            <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4 scale-150 transition-transform group-hover:scale-175">
              <Rocket className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold font-headline mb-2">Potencia tu Flujo</h3>
              <p className="text-sm opacity-90 mb-4 max-w-[240px]">Hemos detectado que puedes ahorrar 20h extra optimizando tu renderizado.</p>
              <button className="bg-surface text-primary px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-on-surface hover:text-surface transition-all">Ver Análisis</button>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6 font-label">Estado del Sistema</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">Latencia de Red</span>
                  <span className="text-primary font-bold">12ms</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '15%' }} className="bg-primary h-full"></motion.div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">Uso de API (IA)</span>
                  <span className="text-secondary font-bold">42%</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '42%' }} className="bg-secondary h-full"></motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
function ServicesPage() {
  const services = [
    { id: 's1', name: 'Copia de Seguridad de Assets', desc: 'Sincronización automática de archivos Unity y Blender en tiempo real.', price: '29€', icon: RefreshCw, color: 'text-primary', bg: 'bg-primary/10' },
    { id: 's2', name: 'Feedback con IA', desc: 'Análisis semántico avanzado que resume y categoriza automáticamente los comentarios.', price: '19€', icon: Wand2, color: 'text-secondary', bg: 'bg-secondary/10' },
    { id: 's3', name: 'Generador de Documentación', desc: 'Crea GDDs profesionales y técnicos de forma automática a partir de tus notas.', price: '49€', icon: FileText, color: 'text-tertiary', bg: 'bg-tertiary/10' },
  ];

  return (
    <div className="space-y-12 pb-12">
      <section className="relative overflow-hidden rounded-3xl bg-surface-container-low p-8 md:p-12 border border-outline-variant/10">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-l from-primary/40 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-headline font-bold text-on-surface tracking-tight mb-4">Servicios Disponibles</h2>
          <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed">
            Potencia tu flujo de trabajo creativo con herramientas de automatización diseñadas específicamente para arquitectos digitales y desarrolladores.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s) => (
          <div key={s.id} className="bg-surface-container-low rounded-2xl p-8 flex flex-col h-full hover:bg-surface-container-highest transition-all duration-300 group border border-outline-variant/5">
            <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", s.bg, s.color)}>
              <s.icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-2">{s.name}</h3>
            <p className="text-on-surface-variant text-sm mb-8 flex-grow leading-relaxed">{s.desc}</p>
            <div className="mt-auto">
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-headline font-black text-on-surface">{s.price}</span>
                <span className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold">/ mes</span>
              </div>
              <button className="w-full py-4 px-6 rounded-xl bg-gradient-to-br from-primary to-secondary text-surface font-bold text-sm tracking-wide active:scale-95 transition-all shadow-lg shadow-primary/20">
                Suscribirse
              </button>
            </div>
          </div>
        ))}
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10 relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-4 block">Próximamente</span>
            <h3 className="text-2xl font-headline font-bold text-on-surface mb-4">Renderizado en la Nube con IA</h3>
            <p className="text-on-surface-variant mb-8 max-w-md">Estamos preparando una integración directa para renderizar escenas cinemáticas optimizadas por redes neuronales.</p>
            <div className="flex gap-4">
              <span className="px-4 py-2 bg-surface-container-highest rounded-full text-[10px] font-bold text-primary uppercase tracking-widest">Unreal Engine 5</span>
              <span className="px-4 py-2 bg-surface-container-highest rounded-full text-[10px] font-bold text-primary uppercase tracking-widest">Blender 4.0</span>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/10 blur-[100px] rounded-full"></div>
        </div>
        <div className="lg:col-span-4 bg-gradient-to-br from-surface-container-high to-surface-container-low rounded-3xl p-8 border border-outline-variant/10 flex flex-col items-center justify-center text-center">
          <Sparkles className="text-secondary w-12 h-12 mb-4" />
          <h3 className="text-xl font-headline font-bold text-on-surface mb-2">Plan Enterprise</h3>
          <p className="text-on-surface-variant text-sm mb-6">Soluciones personalizadas para estudios de gran escala.</p>
          <a className="text-primary font-bold text-sm underline underline-offset-8 decoration-primary/30 hover:decoration-primary transition-all" href="#">Contactar Ventas</a>
        </div>
      </section>
    </div>
  );
}

function FlowsPage() {
  const { user } = useAuth();
  const [flows, setFlows] = useState<Flow[]>([]);

  useEffect(() => {
    if (user) {
      api.getFlows(user.id).then(setFlows);
    }
  }, [user]);

  return (
    <div className="space-y-12 pb-12 text-on-surface">
      <div className="mb-10">
        <h2 className="text-4xl md:text-5xl font-headline font-bold tracking-tight mb-2">Mis Automatizaciones</h2>
        <p className="text-on-surface-variant text-lg">Orquesta y supervisa tus flujos de trabajo de alto rendimiento.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="md:col-span-2 p-8 rounded-2xl bg-surface-container-low border border-outline-variant/5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4 block">Rendimiento General</span>
            <h3 className="text-4xl font-headline font-bold mb-2">98.4% Éxito</h3>
          </div>
          <div className="flex gap-1 mt-6 h-12 items-end">
            {[20, 40, 30, 60, 100].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                className="w-full bg-primary/20 bg-gradient-to-t from-primary/20 to-primary rounded-t-sm"
              ></motion.div>
            ))}
          </div>
        </div>
        <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-outline-variant/20 flex flex-col justify-center items-center text-center">
          <Zap className="w-10 h-10 text-primary mb-3 fill-primary/20" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Flujos Activos</span>
          <span className="text-4xl font-headline font-bold">{flows.length}</span>
        </div>
      </div>

      <div className="space-y-4">
        {flows.map((flow) => (
          <div key={flow.id} className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/5 hover:bg-surface-container-highest transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-primary border border-outline-variant/10">
                {flow.type === 'sync' ? <RefreshCw className="w-6 h-6" /> : flow.type === 'bug_report' ? <Bug className="w-6 h-6" /> : <Wand2 className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="text-lg font-headline font-bold">{flow.name}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className={cn(
                    "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    flow.status === 'Activo' ? "bg-green-500/10 text-green-400" : flow.status === 'Pausado' ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"
                  )}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", flow.status === 'Activo' && "bg-green-400 animate-pulse", flow.status === 'Pausado' && "bg-amber-400", flow.status === 'Configurando' && "bg-blue-400")}></span>
                    {flow.status}
                  </span>
                  <span className="text-xs text-on-surface-variant">Última Ejecución: {flow.lastRun}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between md:justify-end gap-8">
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-surface-container-highest cursor-pointer">
                <div className={cn("h-4 w-4 rounded-full bg-white transition-all transform", flow.status === 'Activo' ? "translate-x-6 bg-primary" : "translate-x-1")}></div>
              </div>
              <button className="px-6 py-2 rounded-xl bg-surface-container-highest text-on-surface font-bold text-sm hover:bg-surface-variant transition-colors">
                Ver Detalles
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewRequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: 'Automatización de Assets',
    desc: '',
    date: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await api.createFlow({
      userId: user.id,
      name: formData.name,
      type: 'sync'
    });
    navigate('/flows');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      <div className="text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-on-surface mb-2">Nueva Solicitud</h1>
        <p className="text-on-surface-variant text-lg">Define tu flujo de trabajo y deja que nuestra IA haga el resto.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-widest text-primary ml-1">Tipo de Servicio</label>
              <div className="relative">
                <select 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-on-surface focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
                >
                  <option>Automatización de Assets</option>
                  <option>Análisis de Datos</option>
                  <option>Generación de Contenido</option>
                  <option>Otro</option>
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-widest text-primary ml-1">Descripción</label>
              <textarea 
                value={formData.desc}
                onChange={(e) => setFormData({...formData, desc: e.target.value})}
                className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-on-surface focus:ring-2 focus:ring-primary/30 placeholder:text-outline-variant/30 resize-none min-h-[160px]" 
                placeholder="Describe tu necesidad..."
                required
              ></textarea>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-widest text-primary ml-1">Fecha Límite</label>
              <input 
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-on-surface focus:ring-2 focus:ring-primary/30 cursor-pointer" 
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                type="submit"
                className="flex-1 bg-gradient-to-br from-primary to-secondary text-surface font-bold py-5 rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
              >
                <Send className="w-5 h-5" />
                Enviar Solicitud
              </button>
              <button 
                type="button" 
                onClick={() => navigate(-1)}
                className="flex-1 border border-outline-variant/30 hover:bg-surface-container-high text-on-surface font-bold py-5 rounded-2xl active:scale-[0.98] transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        <div className="md:col-span-4 space-y-6">
          <div className="bg-surface-container-high p-8 rounded-3xl space-y-4 border border-outline-variant/10">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Sparkles className="text-primary w-6 h-6" />
            </div>
            <h3 className="font-headline font-bold text-xl">Sugerencia de IA</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Para automatizaciones de assets, recomendamos adjuntar muestras de estilo para que el motor de FlowCraft aprenda tus preferencias visuales.
            </p>
            <div className="pt-2">
              <div className="h-1 w-full bg-surface-container-low rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-primary"></motion.div>
              </div>
              <p className="text-[10px] text-on-surface-variant mt-2 uppercase tracking-widest font-bold">Precisión estimada: 85%</p>
            </div>
          </div>
          
          <div className="relative aspect-square rounded-3xl overflow-hidden group shadow-2xl">
            <img 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
               src="https://picsum.photos/seed/tech/400/400" 
               referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary mb-1">Inspiración</p>
              <p className="text-sm text-on-surface font-medium leading-tight">Flujos complejos, resultados simples.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

