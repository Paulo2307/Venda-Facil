import { useState } from 'react'
import {
  TrendingUp, TrendingDown, ShoppingBag, DollarSign,
  Search, User, Calendar, CreditCard, Smartphone, Banknote,
  FileText, X, Share2, Check, Clock, Trash2
} from 'lucide-react'

const COLORS = {
  revenue: '#6c5ce7',
  profit: '#00b894',
}

function MiniBarChart({ sales }) {
  // Get last 7 days
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const daySales = sales.filter(s => s.date === dateStr)
    const revenue = daySales.reduce((sum, s) => sum + s.total, 0)
    const profit = daySales.reduce((sum, s) => sum + s.profit, 0)
    const label = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
    days.push({ label, revenue, profit, dateStr })
  }

  const maxVal = Math.max(...days.map(d => d.revenue), 1)

  return (
    <div className="chart-container">
      <div className="chart-legend">
        <span className="legend-item" style={{ color: COLORS.revenue }}>
          <span className="legend-dot" style={{ background: COLORS.revenue }} /> Vendas
        </span>
        <span className="legend-item" style={{ color: COLORS.profit }}>
          <span className="legend-dot" style={{ background: COLORS.profit }} /> Lucro
        </span>
      </div>
      <div className="chart-bars">
        {days.map((day) => (
          <div key={day.dateStr} className="chart-bar-group">
            <div className="bars-wrapper">
              <div
                className="bar bar-revenue"
                style={{ height: `${(day.revenue / maxVal) * 100}%` }}
                title={`Vendas: R$ ${day.revenue.toFixed(2)}`}
              />
              <div
                className="bar bar-profit"
                style={{ height: `${(day.profit / maxVal) * 100}%` }}
                title={`Lucro: R$ ${day.profit.toFixed(2)}`}
              />
            </div>
            <span className="bar-label">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DinheiroTab({ sales = [], todayRevenue = 0, todayCost = 0, todayProfit = 0, onDeleteSale }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState('Todos')
  const [selectedSale, setSelectedSale] = useState(null)
  const [copiedLink, setCopiedLink] = useState(false)

  const fmtBRL = (v) => `R$ ${(v || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`

  const formatDate = (dateStr, timeStr) => {
    if (!dateStr) return ''
    const todayStr = new Date().toISOString().split('T')[0]
    const parts = dateStr.split('-')
    const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr
    const prefix = dateStr === todayStr ? 'Hoje' : formattedDate
    return timeStr ? `${prefix} às ${timeStr}` : prefix
  }

  // Week stats
  const weekRevenue = sales
    .filter(s => {
      const sDate = new Date(s.date)
      const diff = (new Date() - sDate) / (1000 * 60 * 60 * 24)
      return diff < 7
    })
    .reduce((sum, s) => sum + s.total, 0)

  // Payment breakdown
  const paymentBreakdown = {}
  sales.forEach(s => {
    paymentBreakdown[s.paymentMethod] = (paymentBreakdown[s.paymentMethod] || 0) + s.total
  })

  // Filter sales history
  const filteredSales = sales.filter(sale => {
    const matchesSearch =
      (sale.customerName && sale.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      sale.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesPayment =
      selectedPaymentFilter === 'Todos' || sale.paymentMethod === selectedPaymentFilter

    return matchesSearch && matchesPayment
  })

  const getPaymentIcon = (method) => {
    if (method === 'Pix') return <Smartphone size={14} color="#00b894" />
    if (method === 'Cartão') return <CreditCard size={14} color="#6c5ce7" />
    return <Banknote size={14} color="#fdcb6e" />
  }

  const handleShareReceipt = () => {
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleDelete = (e, saleId) => {
    e.stopPropagation()
    if (onDeleteSale) {
      onDeleteSale(saleId)
    }
    if (selectedSale && selectedSale.id === saleId) {
      setSelectedSale(null)
    }
  }

  return (
    <div className="tab-scroll">
      {/* Today Summary */}
      <div className="money-header">
        <p className="money-date">
          📅 Hoje, {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
        </p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card kpi-primary">
          <div className="kpi-icon"><ShoppingBag size={20} /></div>
          <p className="kpi-label">Quanto vendi hoje?</p>
          <p className="kpi-value">{fmtBRL(todayRevenue)}</p>
          <p className="kpi-sub">{sales.filter(s => s.date === new Date().toISOString().split('T')[0]).length} venda(s)</p>
        </div>
        <div className="kpi-card kpi-cost">
          <div className="kpi-icon"><DollarSign size={20} /></div>
          <p className="kpi-label">Custo dos produtos</p>
          <p className="kpi-value">{fmtBRL(todayCost)}</p>
          <p className="kpi-sub">mercadoria vendida</p>
        </div>
        <div className={`kpi-card ${todayProfit >= 0 ? 'kpi-profit' : 'kpi-loss'}`}>
          <div className="kpi-icon">
            {todayProfit >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          </div>
          <p className="kpi-label">Quanto sobrou?</p>
          <p className="kpi-value">{fmtBRL(todayProfit)}</p>
          <p className="kpi-sub">lucro bruto</p>
        </div>
      </div>

      {/* Week card */}
      <div className="week-card">
        <span className="week-label">📊 Esta semana:</span>
        <span className="week-value">{fmtBRL(weekRevenue)}</span>
      </div>

      {/* Chart */}
      <div className="section-header">
        <span className="section-title">📈 Vendas x Lucro (7 dias)</span>
      </div>
      <MiniBarChart sales={sales} />

      {/* Payment breakdown */}
      {Object.keys(paymentBreakdown).length > 0 && (
        <>
          <div className="section-header" style={{ marginTop: '1.2rem' }}>
            <span className="section-title">💳 Por forma de pagamento</span>
          </div>
          <div className="payment-breakdown">
            {Object.entries(paymentBreakdown).map(([method, total]) => {
              const icons = { Pix: '📱', Cartão: '💳', Dinheiro: '💵' }
              const colors = { Pix: '#00b894', Cartão: '#6c5ce7', Dinheiro: '#fdcb6e' }
              const totalAll = Object.values(paymentBreakdown).reduce((a, b) => a + b, 0) || 1
              return (
                <div key={method} className="breakdown-item">
                  <span className="breakdown-icon">{icons[method] || '💰'}</span>
                  <span className="breakdown-method">{method}</span>
                  <span className="breakdown-bar-wrap">
                    <span
                      className="breakdown-bar"
                      style={{
                        width: `${(total / totalAll) * 100}%`,
                        background: colors[method] || '#a29bfe',
                      }}
                    />
                  </span>
                  <span className="breakdown-total">{fmtBRL(total)}</span>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── SALES HISTORY SECTION ────────────────────────────────── */}
      <div className="section-header" style={{ marginTop: '1.5rem' }}>
        <span className="section-title">🧾 Histórico de Vendas</span>
        <span className="history-count">{sales.length} registrada{sales.length !== 1 ? 's' : ''}</span>
      </div>

      {sales.length > 0 && (
        <div className="history-filters">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por cliente ou produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="search-clear" onClick={() => setSearchTerm('')}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="payment-filter-chips">
            {['Todos', 'Pix', 'Cartão', 'Dinheiro'].map(filter => (
              <button
                key={filter}
                className={`filter-chip ${selectedPaymentFilter === filter ? 'filter-active' : ''}`}
                onClick={() => setSelectedPaymentFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sales List */}
      <div className="sales-history-list">
        {filteredSales.length === 0 ? (
          <div className="history-empty">
            <FileText size={36} strokeWidth={1.2} />
            <p className="empty-history-title">Nenhuma venda no histórico</p>
            <p className="empty-history-sub">
              {sales.length === 0
                ? 'Sua loja é nova! Quando você registrar uma venda na aba "Vender", ela aparecerá aqui com todos os detalhes do cliente e lucro.'
                : 'Nenhuma venda encontrada para os filtros selecionados.'}
            </p>
          </div>
        ) : (
          filteredSales.map(sale => (
            <div
              key={sale.id}
              className="sale-history-card"
              onClick={() => setSelectedSale(sale)}
            >
              <div className="sale-card-header">
                <div className="sale-customer-name">
                  <User size={14} className="customer-icon" />
                  <span>{sale.customerName || 'Consumidor (Balcão)'}</span>
                </div>
                <div className="sale-header-actions">
                  <div className="sale-payment-tag">
                    {getPaymentIcon(sale.paymentMethod)}
                    <span>{sale.paymentMethod}</span>
                  </div>
                  <button
                    className="sale-delete-btn"
                    title="Excluir venda do histórico"
                    onClick={(e) => handleDelete(e, sale.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="sale-card-body">
                <div className="sale-items-list">
                  {sale.items.map((item, idx) => (
                    <span key={idx} className="sale-item-chip">
                      {item.emoji || '📦'} {item.qty}x {item.name}
                    </span>
                  ))}
                </div>

                <div className="sale-card-right">
                  <p className="sale-card-total">{fmtBRL(sale.total)}</p>
                  <p className="sale-card-profit">Lucro +{fmtBRL(sale.profit)}</p>
                </div>
              </div>

              <div className="sale-card-footer">
                <span className="sale-card-date">
                  <Clock size={12} /> {formatDate(sale.date, sale.time)}
                </span>
                <span className="sale-card-receipt-link">
                  Ver comprovante ›
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── SALE DETAILS / RECEIPT MODAL ───────────────────────── */}
      {selectedSale && (
        <div className="modal-overlay" onClick={() => setSelectedSale(null)}>
          <div className="modal-content receipt-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="receipt-title-wrap">
                <FileText size={20} color="#6c5ce7" />
                <h3>Comprovante de Venda</h3>
              </div>
              <button className="modal-close" onClick={() => setSelectedSale(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="receipt-body">
              <div className="receipt-store-banner">
                <span className="store-badge">🛍️ VendaFácil</span>
                <span className="sale-id">ID: #{selectedSale.id}</span>
              </div>

              <div className="receipt-detail-grid">
                <div className="receipt-detail-item">
                  <span className="detail-label"><User size={13} /> Cliente</span>
                  <span className="detail-val bold">{selectedSale.customerName || 'Consumidor (Balcão)'}</span>
                </div>
                <div className="receipt-detail-item">
                  <span className="detail-label"><Calendar size={13} /> Data & Hora</span>
                  <span className="detail-val">{formatDate(selectedSale.date, selectedSale.time)}</span>
                </div>
                <div className="receipt-detail-item">
                  <span className="detail-label">💳 Pagamento</span>
                  <span className="detail-val payment-pill">
                    {getPaymentIcon(selectedSale.paymentMethod)} {selectedSale.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="receipt-divider" />

              <div className="receipt-products-title">Itens Comprados</div>
              <div className="receipt-products-list">
                {selectedSale.items.map((item, idx) => (
                  <div key={idx} className="receipt-product-row">
                    <div className="receipt-prod-left">
                      <span className="receipt-prod-emoji">{item.emoji || '📦'}</span>
                      <div>
                        <p className="receipt-prod-name">{item.name}</p>
                        <p className="receipt-prod-qty">{item.qty}x R$ {(item.price || 0).toFixed(2).replace('.', ',')}</p>
                      </div>
                    </div>
                    <span className="receipt-prod-subtotal">
                      R$ {((item.qty || 1) * (item.price || 0)).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="receipt-divider" />

              <div className="receipt-summary">
                <div className="summary-row">
                  <span>Custo dos produtos:</span>
                  <span>{fmtBRL(selectedSale.cost)}</span>
                </div>
                <div className="summary-row profit-row">
                  <span>Lucro nesta venda:</span>
                  <span className="profit-val">+{fmtBRL(selectedSale.profit)}</span>
                </div>
                <div className="summary-row total-row">
                  <span>Total Pago:</span>
                  <span className="total-val">{fmtBRL(selectedSale.total)}</span>
                </div>
              </div>
            </div>

            <div className="receipt-actions">
              <button className="receipt-btn share-btn" onClick={handleShareReceipt}>
                {copiedLink ? <Check size={16} /> : <Share2 size={16} />}
                {copiedLink ? 'Copiado!' : 'Compartilhar'}
              </button>
              <button className="receipt-btn delete-modal-btn" onClick={(e) => handleDelete(e, selectedSale.id)}>
                <Trash2 size={15} /> Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
