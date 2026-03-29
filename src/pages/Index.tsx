import React, { useState, useEffect } from 'react';
import { Leaf, Recycle, Users, Star, ArrowRight, TrendingUp, CheckCircle } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfiles';
import { UserProfileLink } from '@/components/user/UserProfileLink';
import { GuiasPreviewSection } from '@/components/guias/GuiasPreviewSection';

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const { getProfileById } = useProfiles();
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated && user?.id) {
      getProfileById(user.id).then(profile => {
        setUserProfile(profile);
      });
    }
  }, [isAuthenticated, user?.id, getProfileById]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getFirstName = (fullName: string): string => {
    if (!fullName) return 'Usuario';
    return fullName.trim().split(' ')[0];
  };

  return (
    <div className="min-h-screen bg-[#050f08]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,300&family=DM+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', Georgia, serif; }
        .font-body { font-family: 'DM Sans', system-ui, sans-serif; }
        @keyframes float-a {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(6deg); }
        }
        @keyframes float-b {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(-8deg); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.7; }
        }
        .float-a { animation: float-a 7s ease-in-out infinite; }
        .float-b { animation: float-b 9s ease-in-out infinite 1.5s; }
        .float-c { animation: float-a 11s ease-in-out infinite 3s; }
        .glow-pulse { animation: glow-pulse 5s ease-in-out infinite; }
        .card-lift { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .card-lift:hover { transform: translateY(-10px); box-shadow: 0 28px 56px rgba(22,163,74,0.12); }
        .nav-link { position: relative; }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -3px; left: 0;
          width: 0; height: 1px;
          background: #4ade80;
          transition: width 0.3s ease;
        }
        .nav-link:hover::after { width: 100%; }
        .gradient-text {
          background: linear-gradient(135deg, #ffffff 0%, #86efac 50%, #4ade80 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .stat-gradient {
          background: linear-gradient(135deg, #4ade80, #86efac);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .dot-grid {
          background-image: radial-gradient(circle, #4ade80 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .line-grid {
          background-image: linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(90deg, #4ade80 1px, transparent 1px);
          background-size: 64px 64px;
        }
      `}</style>

      {/* ── Navbar ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#050f08]/90 backdrop-blur-xl border-b border-green-900/30 shadow-xl shadow-black/30'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <Leaf className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">NatuVital</span>
            </div>

            {/* Nav links */}
            <nav className="hidden md:flex items-center space-x-8">
              {[
                { label: 'Guías', to: '/guias' },
                { label: 'Órdenes', to: '/ordenes' },
                { label: 'Productos', to: '/productos' },
                { label: 'Lotes', to: '/lotes' },
              ].map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="nav-link font-body text-sm text-green-300/70 hover:text-green-300 transition-colors duration-200"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Auth */}
            <div>
              {isAuthenticated ? (
                <div className="[&_a]:!text-green-300 [&_a:hover]:!text-green-100 [&_span]:!text-green-300 [&_a:hover]:!no-underline px-4 py-2 rounded-full border border-green-500/30 hover:border-green-400/50 hover:bg-green-500/10 transition-all duration-200">
                  <UserProfileLink
                    userId={user?.id || ''}
                    userName={
                      userProfile
                        ? getFirstName(userProfile.full_name)
                        : getFirstName(user?.email?.split('@')[0] || '')
                    }
                    className="flex items-center space-x-2 font-body font-medium"
                    showIcon={true}
                    size="sm"
                  />
                </div>
              ) : (
                <Link to="/auth">
                  <button className="font-body text-sm font-semibold px-5 py-2.5 rounded-full bg-green-500 text-white hover:bg-green-400 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5">
                    Iniciar Sesión
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050f08] via-[#0a1f0f] to-[#0d2d15]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-green-600/8 blur-[140px] glow-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[100px]" />
        <div className="absolute inset-0 line-grid opacity-[0.025]" />

        {/* Floating icons */}
        <div className="absolute top-28 left-12 float-a opacity-[0.15]">
          <Leaf className="w-20 h-20 text-green-400" />
        </div>
        <div className="absolute top-52 right-16 float-b opacity-[0.12]">
          <Recycle className="w-14 h-14 text-emerald-400" />
        </div>
        <div className="absolute bottom-36 left-24 float-c opacity-[0.08]">
          <Leaf className="w-32 h-32 text-green-300" />
        </div>
        <div className="absolute top-72 right-1/3 float-a opacity-[0.15]">
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="absolute bottom-1/3 right-12 float-b">
          <div className="w-8 h-8 rounded-full border border-green-500/30" />
        </div>
        <div className="absolute top-1/2 left-8 float-c opacity-20">
          <div className="w-5 h-5 rounded-full border-2 border-green-500/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/25 bg-green-500/8 text-green-400 text-xs font-body font-medium mb-10 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Economía Circular · Residuos Orgánicos Aprovechables
          </div>

          <h1 className="font-display font-black leading-[0.92] mb-8">
            <span className="block text-6xl md:text-8xl gradient-text">Transforma</span>
            <span className="block text-6xl md:text-8xl text-white">tus Residuos</span>
            <span className="block text-6xl md:text-8xl text-green-400">en Valor</span>
          </h1>

          <p className="font-body text-green-200/60 text-lg md:text-xl max-w-2xl mx-auto mb-14 leading-relaxed">
            Conectamos generadores y transformadores de Residuos Orgánicos Aprovechables,
            creando un ecosistema circular sostenible para un futuro mejor.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link to="/auth">
                  <button className="font-body inline-flex items-center gap-2 px-9 py-4 rounded-full bg-green-500 text-white font-semibold text-base hover:bg-green-400 transition-all duration-200 hover:shadow-2xl hover:shadow-green-500/30 hover:-translate-y-0.5">
                    Comenzar Ahora <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to="/lotes">
                  <button className="font-body inline-flex items-center gap-2 px-9 py-4 rounded-full border border-green-500/35 text-green-300 font-medium text-base hover:border-green-400/60 hover:bg-green-500/8 transition-all duration-200">
                    Explorar R.O.A
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/lotes">
                  <button className="font-body inline-flex items-center gap-2 px-9 py-4 rounded-full bg-green-500 text-white font-semibold text-base hover:bg-green-400 transition-all duration-200 hover:shadow-2xl hover:shadow-green-500/30">
                    Mis Lotes <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to="/lotes">
                  <button className="font-body inline-flex items-center gap-2 px-9 py-4 rounded-full border border-green-500/35 text-green-300 font-medium text-base hover:border-green-400/60 hover:bg-green-500/8 transition-all duration-200">
                    Buscar R.O.A
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
            <span className="font-body text-green-400 text-[10px] tracking-[0.3em] uppercase">Descubrir</span>
            <div className="w-px h-10 bg-gradient-to-b from-green-400 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="inline-block font-body text-[10px] tracking-[0.25em] uppercase text-green-600 font-semibold mb-5 px-3.5 py-1.5 rounded-full bg-green-50 border border-green-100">
              La Plataforma
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-5 leading-tight">
              ¿Cómo funciona NatuVital?
            </h2>
            <p className="font-body text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
              Una plataforma integral para gestionar, intercambiar y aprovechar Residuos Orgánicos,
              creando alternativas naturales para la salud y el bienestar.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="card-lift rounded-2xl border border-gray-100 bg-white p-8 shadow-sm cursor-default">
              <div className="inline-flex p-3.5 rounded-2xl bg-green-50 border border-green-100 mb-6">
                <Recycle className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900 mb-3">Registro de Lotes R.O.A</h3>
              <p className="font-body text-gray-400 text-sm leading-relaxed mb-6">
                Los generadores registran sus lotes de residuos orgánicos con ubicación, peso y tipo de material.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Cáscara de fruta', 'Semillas', 'Restos vegetales'].map(tag => (
                  <span key={tag} className="font-body text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Card 2 */}
            <div className="card-lift rounded-2xl border border-gray-100 bg-white p-8 shadow-sm cursor-default">
              <div className="inline-flex p-3.5 rounded-2xl bg-blue-50 border border-blue-100 mb-6">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900 mb-3">Intercambio y Órdenes</h3>
              <p className="font-body text-gray-400 text-sm leading-relaxed mb-6">
                Los transformadores solicitan lotes y productos, generando órdenes de intercambio gestionadas por la plataforma.
              </p>
              <div className="space-y-2.5">
                {[['Órdenes pendientes', '24'], ['Completadas', '156']].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="font-body text-sm text-gray-400">{label}</span>
                    <span className="font-body text-sm font-bold text-gray-800">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3 */}
            <div className="card-lift rounded-2xl border border-gray-100 bg-white p-8 shadow-sm cursor-default">
              <div className="inline-flex p-3.5 rounded-2xl bg-amber-50 border border-amber-100 mb-6">
                <Star className="h-7 w-7 text-amber-500" />
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900 mb-3">Sistema de Calificaciones</h3>
              <p className="font-body text-gray-400 text-sm leading-relaxed mb-6">
                Califica los intercambios y construye buena reputación en la comunidad natural. Tu opinión es vital.
              </p>
              <div className="flex items-center gap-2.5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="font-body text-sm font-bold text-gray-700">5.0</span>
                <span className="font-body text-sm text-gray-400">(48 reseñas)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-28 bg-[#071a0c] relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-[0.035]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-green-500/5 blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">Nuestro Impacto</h2>
            <p className="font-body text-green-300/40 text-lg">Transformando residuos en oportunidades reales</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {[
              { value: '180+', label: 'Lotes R.O.A', icon: <Recycle className="w-5 h-5" /> },
              { value: '24', label: 'Órdenes activas', icon: <TrendingUp className="w-5 h-5" /> },
              { value: '156', label: 'Completadas', icon: <CheckCircle className="w-5 h-5" /> },
              { value: '5.0★', label: 'Calificación', icon: <Star className="w-5 h-5" /> },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-green-500/10 text-green-400 mb-5 group-hover:bg-green-500/20 transition-colors duration-300">
                  {stat.icon}
                </div>
                <div className="stat-gradient font-display text-5xl md:text-6xl font-black mb-2 leading-none">
                  {stat.value}
                </div>
                <div className="font-body text-green-300/40 text-sm tracking-wide mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Guides ── */}
      <section className="bg-[#f5f8f5]">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <div className="text-center mb-14">
            <span className="inline-block font-body text-[10px] tracking-[0.25em] uppercase text-green-600 font-semibold mb-5 px-3.5 py-1.5 rounded-full bg-green-50 border border-green-100">
              Aprende
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">Guías R.O.A</h2>
            <p className="font-body text-gray-400 text-lg">
              Conoce cómo sacar el máximo provecho de los residuos orgánicos
            </p>
          </div>
          <GuiasPreviewSection />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#14532d] via-[#166534] to-[#15803d]" />
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #ffffff 0, #ffffff 1px, transparent 0, transparent 50%)',
          backgroundSize: '18px 18px',
        }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-black/10 blur-[80px]" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display text-5xl md:text-7xl font-black text-white mb-6 leading-[0.95]">
            ¿Listo para la<br />economía circular?
          </h2>
          <p className="font-body text-white/60 text-xl mb-14 max-w-xl mx-auto leading-relaxed">
            Únete a nuestra comunidad de generadores y transformadores de R.O.A
          </p>

          {!isAuthenticated ? (
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth">
                <button className="font-body inline-flex items-center gap-2 px-10 py-4 rounded-full bg-white text-green-800 font-bold text-base hover:bg-green-50 transition-all duration-200 hover:shadow-2xl hover:-translate-y-1">
                  Registrarse ahora <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/lotes">
                <button className="font-body inline-flex items-center gap-2 px-10 py-4 rounded-full border-2 border-white/30 text-white font-semibold text-base hover:border-white/60 hover:bg-white/8 transition-all duration-200">
                  Ver Lotes R.O.A
                </button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/lotes">
                <button className="font-body inline-flex items-center gap-2 px-10 py-4 rounded-full bg-white text-green-800 font-bold text-base hover:bg-green-50 transition-all duration-200 hover:shadow-2xl hover:-translate-y-1">
                  Gestionar Lotes <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/productos">
                <button className="font-body inline-flex items-center gap-2 px-10 py-4 rounded-full border-2 border-white/30 text-white font-semibold text-base hover:border-white/60 hover:bg-white/8 transition-all duration-200">
                  Ver Productos
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#050f08] border-t border-green-900/20">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
                  <Leaf className="h-4 w-4 text-white" />
                </div>
                <span className="font-display text-lg font-bold text-white">NatuVital</span>
              </div>
              <p className="font-body text-green-300/35 text-sm leading-relaxed">
                Conectando la comunidad de R.O.A para un futuro más sostenible y saludable.
              </p>
            </div>

            {/* Links */}
            {[
              {
                title: 'Plataforma',
                links: [
                  { label: 'Buscar R.O.A', to: '/lotes' },
                  { label: 'Productos', to: '/productos' },
                  { label: 'Lotes', to: '/lotes' },
                  { label: 'Órdenes', to: '/ordenes' },
                ],
              },
              {
                title: 'Soporte',
                links: [
                  { label: 'Centro de Ayuda', to: '#' },
                  { label: 'Guías R.O.A', to: '#' },
                  { label: 'Contacto', to: '#' },
                  { label: 'FAQ', to: '#' },
                ],
              },
              {
                title: 'Legal',
                links: [
                  { label: 'Términos de Uso', to: '/terminos' },
                  { label: 'Tratamiento de Datos', to: '/tratamiento-datos' },
                  { label: 'Cookies', to: '#' },
                ],
              },
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-body text-[10px] tracking-[0.25em] uppercase text-green-400/50 font-semibold mb-6">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map(link => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="font-body text-sm text-green-300/40 hover:text-green-300/80 transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-green-900/25 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-body text-green-300/25 text-sm">© 2025 NatuVital. Todos los derechos reservados.</p>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="font-body text-green-400/30 text-xs tracking-wide">Sistema activo</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
