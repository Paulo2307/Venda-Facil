import { useState } from 'react'
import { Plus, Minus, ShoppingBag, Trash2, CreditCard, Banknote, Smartphone, User, UserCheck, PackagePlus } from 'lucide-react'

const paymentMethods = [
  { id: 'Pix', label: 'Pix', icon: Smartphone, color: '#00b894' },
  { id: 'Cartão', label: 'Cartão', icon: CreditCard, color: '#6c5ce7' },
  { id: 'Dinheiro', label: 'Dinheiro', icon: Banknote, color: '#fdcb6e' },
]

export default function VenderTab({ products = [], sales = [], onSale, setActiveTab }) {
  const [cart, setCart] = useState([])
  const [payment, setPayment] = useState('Pix')
  const [customerName, setCustomerName] = useState('')
  const [success, setSuccess] = useState(false)
  const [lastSaleCustomer, setLastSaleCustomer] = useState('')

  // Get unique registered customer names from sales history for quick selection
  const existingCustomers = Array.from(
    new Set(
      sales
        .map(s => s.customerName)
        .filter(name => name && name !== 'Consumidor (Balcão)')
    )
  ).slice(0, 4)

  const addToCart = (product) => {
    if (product.qty <= 0) return
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        if (existing.qty >= product.qty) return prev
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { id: product.id, name: product.name, emoji: product.emoji, price: product.price, cost: product.cost, qty: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCart(prev => {
      const item = prev.find(i => i.id === id)
      if (item && item.qty > 1) {
        return prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i)
      }
      return prev.filter(i => i.id !== id)
    })
  }

  const deleteFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id))
  }

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)

  const handleSale = () => {
    if (cart.length === 0) return
    const finalCustomer = customerName.trim() || 'Consumidor (Balcão)'
    setLastSaleCustomer(finalCustomer)
    onSale(cart, payment, customerName)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setCart([])
      setCustomerName('')
    }, 2500)
  }

  if (success) {
    return (
      <div className="success-screen">
        <div className="success-icon">🎉</div>
        <h2 className="success-title">Venda Realizada!</h2>
        <p className="success-subtitle">Estoque atualizado e venda gravada no histórico</p>
        
        <div className="success-customer-badge">
          <User size={14} /> Cliente: <strong>{lastSaleCustomer}</strong>
        </div>

        <div className="success-amount">
          R$ {cartTotal.toFixed(2).replace('.', ',')}
        </div>
        <p className="success-payment">via {payment}</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="tab-scroll">
        <div className="vender-empty-container">
          <div className="vender-empty-icon">🛍️</div>
          <h3>Nenhum Produto Cadastrado</h3>
          <p>Para começar a realizar vendas, primeiro você precisa cadastrar produtos no seu estoque.</p>
          <button className="btn-go-to-stock" onClick={() => setActiveTab && setActiveTab('estoque')}>
            <PackagePlus size={18} /> Cadastrar Produtos no Estoque
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="tab-scroll">
      {/* Section: Products */}
      <div className="section-header">
        <span className="section-title">🛍️ Selecione os Produtos</span>
        {cartCount > 0 && (
          <span className="cart-badge">{cartCount} item{cartCount > 1 ? 's' : ''} no carrinho</span>
        )}
      </div>

      <div className="product-list">
        {products.map(product => {
          const cartItem = cart.find(i => i.id === product.id)
          const inCart = cartItem ? cartItem.qty : 0
          const isLow = product.qty <= 3
          const isOut = product.qty === 0

          return (
            <div key={product.id} className={`product-card ${isOut ? 'product-out' : ''}`}>
              <div className="product-emoji">{product.emoji}</div>
              <div className="product-info">
                <p className="product-name">{product.name}</p>
                <p className="product-price">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                <div className="product-stock-row">
                  <span className={`stock-badge ${isOut ? 'stock-out' : isLow ? 'stock-low' : 'stock-ok'}`}>
                    {isOut ? '❌ Sem estoque' : isLow ? `⚠️ ${product.qty} restantes` : `✅ ${product.qty} em estoque`}
                  </span>
                </div>
              </div>
              <div className="product-actions">
                {inCart > 0 ? (
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => removeFromCart(product.id)}>
                      <Minus size={14} />
                    </button>
                    <span className="qty-value">{inCart}</span>
                    <button
                      className="qty-btn qty-btn-add"
                      onClick={() => addToCart(product)}
                      disabled={inCart >= product.qty}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    className={`add-btn ${isOut ? 'add-btn-disabled' : ''}`}
                    onClick={() => addToCart(product)}
                    disabled={isOut}
                  >
                    <Plus size={16} />
                    Vender
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="cart-section">
          <div className="section-header">
            <span className="section-title">🛒 Detalhes do Pedido</span>
            <span className="cart-total">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
          </div>

          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <span className="cart-item-emoji">{item.emoji}</span>
                <div className="cart-item-info">
                  <span className="cart-item-name">{item.name}</span>
                  <span className="cart-item-subtotal">
                    {item.qty}x R$ {item.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <span className="cart-item-total">
                  R$ {(item.qty * item.price).toFixed(2).replace('.', ',')}
                </span>
                <button className="cart-delete" onClick={() => deleteFromCart(item.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Customer Registration Input */}
          <div className="customer-section">
            <label className="customer-label">
              <User size={15} color="#6c5ce7" />
              <span>Cliente / Cadastro</span>
              <span className="customer-opt-tag">Opcional</span>
            </label>
            <div className="customer-input-wrapper">
              <input
                type="text"
                className="customer-input"
                placeholder="Digite o nome do cliente (ex: Maria Silva)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              {customerName.trim() && (
                <span className="customer-registered-badge">
                  <UserCheck size={13} /> Cadastrado
                </span>
              )}
            </div>

            {/* Existing Customers Quick Chips */}
            {existingCustomers.length > 0 && (
              <div className="customer-chips">
                <span className="chips-label">Clientes frequentes:</span>
                <div className="chips-list">
                  {existingCustomers.map(name => (
                    <button
                      key={name}
                      type="button"
                      className={`customer-chip ${customerName === name ? 'chip-active' : ''}`}
                      onClick={() => setCustomerName(name === customerName ? '' : name)}
                    >
                      👤 {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Payment method */}
          <div className="payment-section">
            <p className="payment-label">💳 Forma de Pagamento</p>
            <div className="payment-options">
              {paymentMethods.map(pm => (
                <button
                  key={pm.id}
                  className={`payment-btn ${payment === pm.id ? 'payment-active' : ''}`}
                  style={payment === pm.id ? { borderColor: pm.color, color: pm.color } : {}}
                  onClick={() => setPayment(pm.id)}
                >
                  <pm.icon size={16} />
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          {/* Confirm button */}
          <button className="confirm-btn" onClick={handleSale}>
            <ShoppingBag size={20} />
            Concluir Venda — R$ {cartTotal.toFixed(2).replace('.', ',')}
          </button>
        </div>
      )}

      {cart.length === 0 && (
        <div className="empty-cart">
          <ShoppingBag size={40} strokeWidth={1} />
          <p>Toque em <strong>Vender</strong> para adicionar produtos ao carrinho</p>
        </div>
      )}
    </div>
  )
}
