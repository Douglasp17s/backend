'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bus, LogOut } from 'lucide-react';
import { useUsuarioAlmacen } from '../../almacen/usuario.almacen';
import { authServicio } from '../../services/auth.servicio';

export default function LayoutChofer({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { usuario, token } = useUsuarioAlmacen();
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => { setHidratado(true); }, []);

  useEffect(() => {
    if (!hidratado) return;
    if (!token) { router.push('/autenticacion/iniciar-sesion'); return; }
    const rol = usuario?.rol as string;
    if (rol !== 'DRIVER') router.push('/panel');
  }, [hidratado, token, usuario, router]);

  if (!hidratado || !token) return null;

  const handleLogout = async () => {
    await authServicio.logout();
    router.push('/autenticacion/iniciar-sesion');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050507', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        padding: '0 1.5rem', height: 54, flexShrink: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#0d0d0f', borderBottom: '1px solid #1e1e22',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(0,217,146,0.12)', border: '1px solid rgba(0,217,146,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bus size={15} color="#00d992" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f2f2f2' }}>
            Transit<span style={{ color: '#00d992' }}>AI</span>
            <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#555', fontWeight: 400 }}>— Conductor</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {usuario && (
            <span style={{ fontSize: '0.8125rem', color: '#8b949e' }}>{usuario.nombreCompleto}</span>
          )}
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(251,86,91,0.08)', border: '1px solid rgba(251,86,91,0.2)',
              borderRadius: 8, padding: '0.375rem 0.625rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              fontSize: '0.8125rem', color: '#fb565b',
            }}
          >
            <LogOut size={13} /> Salir
          </button>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  );
}
