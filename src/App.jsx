import { useState } from 'react'
import DashboardTab from './components/DashboardTab'
import VenderTab from './components/VenderTab'
import EstoqueTab from './components/EstoqueTab'
import DinheiroTab from './components/DinheiroTab'
import ConfigTab from './components/ConfigTab'
import BottomNav from './components/BottomNav'
import { initialProducts, initialSales } from './data/mockData'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [products, setProducts] = useState(initialProducts)
  const [sales, setSales] = useState(initialSales)
  const [toast, setToast] = useState(null)
  const [storeName, setStoreName] = useState('Minha Loja')

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSale = (cartItems, paymentMethod, customerName) => {
    const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
    const totalCost = cartItems.reduce((sum, item) => sum + item.cost * item.qty, 0)

    setProducts(prev =>
      prev.map(p => {
        const cartItem = cartItems.find(ci => ci.id === p.id)
        if (cartItem) return { ...p, qty: p.qty - cartItem.qty }
        return p
      })
    )

    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const mins = String(now.getMinutes()).padStart(2, '0')

    const newSale = {
      id: Date.now(),
      date: now.toISOString().split('T')[0],
      time: `${hours}:${mins}`,
      customerName: customerName && customerName.trim() ? customerName.trim() : 'Consumidor (Balcão)',
      total,
      cost: totalCost,
      profit: total - totalCost,
      paymentMethod,
      items: cartItems,
    }
    setSales(prev => [newSale, ...prev])
    showToast('🎉 Venda Registrada no Histórico!', 'success')
  }

  const handleDeleteSale = (saleId) => {
    setSales(prev => prev.filter(s => s.id !== saleId))
    showToast('🗑️ Venda excluída do histórico!', 'error')
  }

  const handleAddProduct = (newProduct) => {
    setProducts(prev => [...prev, { id: Date.now(), ...newProduct }])
    showToast('✅ Produto cadastrado!', 'success')
  }

  const handleUpdateProduct = (id, data) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
    showToast('✏️ Produto atualizado!', 'success')
  }

  const handleDeleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id))
    showToast('🗑️ Produto excluído!', 'error')
  }

  const handleUpdateStock = (productId, newQty) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, qty: newQty } : p))
  }

  // Shared financial summaries
  const today = new Date().toISOString().split('T')[0]
  const todaySales   = sales.filter(s => s.date === today)
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0)
  const todayCost    = todaySales.reduce((sum, s) => sum + s.cost, 0)
  const todayProfit  = todayRevenue - todayCost

  return (
    <div className="app-shell">
      <div className="phone-frame">
        <div className="phone-notch" />
        <div className="phone-screen">

          {/* ── HEADER ─────────────────────────────────── */}
          <header className="app-header">
            <div className="header-left">
              <span className="logo-icon">🛍️</span>
              <span className="logo-text">VendaFácil</span>
            </div>
          </header>

          {/* ── TAB CONTENT ────────────────────────────── */}
          <main className="tab-content">
            {activeTab === 'dashboard' && (
              <DashboardTab
                products={products}
                sales={sales}
                storeName={storeName}
                setActiveTab={setActiveTab}
              />
            )}
            {activeTab === 'vender' && (
              <VenderTab
                products={products}
                sales={sales}
                onSale={handleSale}
                showToast={showToast}
                setActiveTab={setActiveTab}
              />
            )}
            {activeTab === 'estoque' && (
              <EstoqueTab
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onUpdateStock={handleUpdateStock}
              />
            )}
            {activeTab === 'dinheiro' && (
              <DinheiroTab
                sales={sales}
                todayRevenue={todayRevenue}
                todayCost={todayCost}
                todayProfit={todayProfit}
                onDeleteSale={handleDeleteSale}
              />
            )}
            {activeTab === 'config' && (
              <ConfigTab
                productCount={products.length}
                storeName={storeName}
                onStoreNameChange={setStoreName}
              />
            )}
          </main>

          {/* ── BOTTOM NAV ─────────────────────────────── */}
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Toast */}
        {toast && (
          <div className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        )}
      </div>

      {/* Desktop background label */}
      <div className="desktop-label">
        <h1>VendaFácil</h1>
        <p>Gestão empresarial sem complicação</p>
        <p className="desktop-hint">↑ Protótipo interativo — clique nas abas para navegar</p>
      </div>
    </div>
  )
}

export default App
