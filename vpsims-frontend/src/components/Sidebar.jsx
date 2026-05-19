import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Truck, 
  ShoppingCart, 
  LogOut, 
  Settings,
  Sun,
  Moon,
  FileText
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/parts', icon: Package, label: 'Parts Inventory' },
  { to: '/categories', icon: FolderTree, label: 'Categories' },
  { to: '/suppliers', icon: Truck, label: 'Suppliers' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/financials', icon: FileText, label: 'Financial Ledger' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 16px' }}>
        <img 
          src="/icon.png" 
          alt="VPSIMS" 
          style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '6px', 
            backgroundColor: 'white',
            padding: '4px',
            display: 'block'
          }} 
        />
        <span className="brand-text" style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>VPSIMS</span>
      </div>

      <div className="nav-section">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to === '/financials' ? (user?.role === 'Admin' ? '/admin/invoices' : '/staff/invoices') : item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-icon" strokeWidth={2} />
              <span className="nav-label">{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* ── Theme Toggle ── */}
        <button 
          className="btn btn-secondary" 
          onClick={toggleTheme}
          style={{ width: '100%', gap: '12px', justifyContent: 'flex-start', borderStyle: 'dashed' }}
        >
          {theme === 'light' ? (
            <><Moon size={16} /> Dark Mode</>
          ) : (
            <><Sun size={16} /> Light Mode</>
          )}
        </button>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 12px 20px' }}>
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-card-hover)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600',
              border: '1px solid var(--border)'
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{user?.role}</p>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', gap: '12px', justifyContent: 'flex-start' }} onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
