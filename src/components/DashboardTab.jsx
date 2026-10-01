import {
  TrendingUp, TrendingDown, ShoppingBag, Package,
  DollarSign, AlertTriangle, Bell, ArrowRight,
  BarChart2, ShoppingCart, Star, PlusCircle, Sparkles
} from 'lucide-react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function DashboardTab({ products = [], sales = [], storeName, setActiveTab }) {
  const today = new Date().toISOString().split('T')[0]
  const todaySales = sales.filter(s => s.date === today)
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0)
  const todayCost   = todaySales.reduce((sum, s) => sum + s.cost, 0)
  const todayProfit = todayRevenue - todayCost
  const todayCount  = todaySales.length

  // Yesterday for comparison
  const yday = new Date(); yday.setDate(yday.getDate() - 1)
  const ydayStr = yday.toISOString().split('T')[0]
  const ydaySales   = sales.filter(s => s.date === ydayStr)
  const ydayRevenue = ydaySales.reduce((sum, s) => sum + s.total, 0)
  const revDiff     = ydayRevenue > 0 ? ((todayRevenue - ydayRevenue) / ydayRevenue) * 100 : null

  // Stock stats
  const totalUnits   = products.reduce((sum, p) => sum + p.qty, 0)
  const lowStock     = products.filter(p => p.qty > 0 && p.qty <= 3)
  const outOfStock   = products.filter(p => p.qty === 0)

  const fmtBRL = v => `R$ ${(v || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`

  const hasAlerts = lowStock.length > 0 || outOfStock.length > 0
  const isFreshStore = products.length === 0 && sales.length === 0

  return (
    <div className="tab-scroll dash-scroll">

      {/* Greeting */}
      <div className="dash-greeting">
        <div>
          <p className="greeting-text">{getGreeting()}, 👋</p>
          <p className="greeting-store">{storeName || 'Minha Loja'}</p>
        </div>
        <div className="greeting-date">
          {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </div>
      </div>

      {/* Onboarding Welcome Card for First Time */}
      {isFreshStore && (
        <div className="onboarding-card">
          <div className="onboarding-badge">
            <Sparkles size={13} /> Primeiro Acesso
          </div>
          <h3 className="onboarding-title">Bem-vindo ao VendaFácil! 🎉</h3>
          <p className="onboarding-sub">Sua loja está pronta para começar. Siga os passos simples para fazer sua gestão:</p>
          
          <div className="onboarding-steps">
            <div className="onboarding-step" onClick={() => setActiveTab('estoque')}>
              <div className="step-num">1</div>
              <div className="step-info">
                <strong>Cadastre seu Primeiro Produto</strong>
                <span>Adicione custos, preços e quantidades no estoque</span>
              </div>
              <ArrowRight size={16} className="step-arrow" />
            </div>

            <div className="onboarding-step" onClick={() => setActiveTab('vender')}>
              <div className="step-num">2</div>
              <div className="step-info">
                <strong>Registre sua Primeiras Venda</strong>
                <span>Selecione os produtos e anote o nome do cliente</span>
              </div>
              <ArrowRight size={16} className="step-arrow" />
            </div>
          </div>
        </div>
      )}

      {/* ── KPI HERO ─────────────────────────────────── */}
      <div className="dash-hero">
        <p className="dash-hero-label">💰 Lucro de Hoje</p>
        <p className={`dash-hero-value ${todayProfit < 0 ? 'hero-neg' : ''}`}>
          {fmtBRL(todayProfit)}
        </p>
        <div className="dash-hero-sub">
          <span>{todayCount} venda{todayCount !== 1 ? 's' : ''} realizadas</span>
          {revDiff !== null && (
            <span className={`hero-diff ${revDiff >= 0 ? 'diff-up' : 'diff-down'}`}>
              {revDiff >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(revDiff).toFixed(0)}% vs ontem
            </span>
          )}
        </div>
      </div>

      {/* ── METRIC CARDS ─────────────────────────────── */}
      <div className="dash-cards">
        <div className="dash-card">
          <div className="dash-card-icon" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
            <ShoppingBag size={18} color="white" />
          </div>
          <p className="dash-card-label">Vendas Hoje</p>
          <p className="dash-card-value">{fmtBRL(todayRevenue)}</p>
          <p className="dash-card-sub">{todayCount} pedido{todayCount !== 1 ? 's' : ''}</p>
        </div>

        <div className="dash-card">
          <div className="dash-card-icon" style={{ background: 'linear-gradient(135deg,#43e97b,#38f9d7)' }}>
            <Package size={18} color="white" />
          </div>
          <p className="dash-card-label">Em Estoque</p>
          <p className="dash-card-value">{totalUnits}</p>
          <p className="dash-card-sub">{products.length} produto{products.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* ── NOTIFICATION CENTER ───────────────────────── */}
      <div className="notif-section">
        <div className="notif-header">
          <div className="notif-title">
            <Bell size={15} />
            Central de Notificações
            {hasAlerts && (
              <span className="notif-count">{outOfStock.length + lowStock.length}</span>
            )}
          </div>
        </div>

        {!hasAlerts && (
          <div className="notif-empty">
            <span>✅</span>
            <p>Tudo certo! Nenhum alerta de estoque no momento.</p>
          </div>
        )}

        {outOfStock.map(p => (
          <div key={p.id} className="notif-card notif-danger">
            <div className="notif-icon-wrap danger-icon">❌</div>
            <div className="notif-body">
              <p className="notif-msg"><strong>{p.name}</strong> está sem estoque!</p>
              <p className="notif-hint">Reponha o produto o quanto antes.</p>
            </div>
            <button className="notif-action" onClick={() => setActiveTab('estoque')}>
              <ArrowRight size={14} />
            </button>
          </div>
        ))}

        {lowStock.map(p => (
          <div key={p.id} className="notif-card notif-warning">
            <div className="notif-icon-wrap warning-icon">⚠️</div>
            <div className="notif-body">
              <p className="notif-msg"><strong>{p.name}</strong> — só {p.qty} restante{p.qty > 1 ? 's' : ''}!</p>
              <p className="notif-hint">Estoque crítico. Considere repor.</p>
            </div>
            <button className="notif-action" onClick={() => setActiveTab('estoque')}>
              <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* ── QUICK ACTIONS ────────────────────────────── */}
      <div className="quick-actions">
        <p className="quick-title">Atalhos Rápidos</p>
        <div className="quick-grid">
          <button className="quick-btn" onClick={() => setActiveTab('vender')}>
            <ShoppingBag size={20} />
            Nova Venda
          </button>
          <button className="quick-btn quick-btn-stock" onClick={() => setActiveTab('estoque')}>
            <Package size={20} />
            Estoque
          </button>
          <button className="quick-btn quick-btn-money" onClick={() => setActiveTab('dinheiro')}>
            <BarChart2 size={20} />
            Relatório
          </button>
        </div>
      </div>

    </div>
  )
}
