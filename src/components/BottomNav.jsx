import { Home, ShoppingCart, Package, DollarSign, Settings } from 'lucide-react'

const tabs = [
  { id: 'dashboard', label: 'Início',   icon: Home },
  { id: 'vender',    label: 'Vender',   icon: ShoppingCart },
  { id: 'estoque',   label: 'Estoque',  icon: Package },
  { id: 'dinheiro',  label: 'Dinheiro', icon: DollarSign },
  { id: 'config',    label: 'Config',   icon: Settings },
]

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav className="bottom-nav">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={`nav-item ${activeTab === id ? 'nav-active' : ''}`}
          onClick={() => setActiveTab(id)}
        >
          <Icon size={21} strokeWidth={activeTab === id ? 2.5 : 1.8} />
          <span className="nav-label">{label}</span>
          {activeTab === id && <div className="nav-indicator" />}
        </button>
      ))}
    </nav>
  )
}
