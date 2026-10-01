import { Check, Zap, Star, Lock, MessageCircle, Store } from 'lucide-react'
import { useState } from 'react'

const freePlanFeatures = [
  'Até 30 produtos',
  'Registro de vendas',
  'Controle de estoque',
  'Relatório do dia',
]

const proPlanFeatures = [
  'Produtos ilimitados',
  'Relatório mensal completo',
  'Backup automático na nuvem',
  'Alerta de estoque no celular',
  'Exportar dados para Excel',
]


export default function ConfigTab({ productCount = 0, storeName = '', onStoreNameChange }) {
  const [showProModal, setShowProModal] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(storeName)
  const PLAN_LIMIT = 30
  const usagePercent = Math.min((productCount / PLAN_LIMIT) * 100, 100).toFixed(0)

  const handleSaveName = () => {
    if (nameInput.trim()) onStoreNameChange(nameInput.trim())
    setEditingName(false)
  }

  return (
    <div className="tab-scroll">

      {/* Store name */}
      <div className="store-name-section">
        <div className="store-name-label">
          <Store size={15} />
          Nome da Sua Loja
        </div>
        {editingName ? (
          <div className="store-name-edit">
            <input
              className="form-input"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveName()}
              autoFocus
              placeholder="Ex: Boutique da Maria"
            />
            <button className="store-save-btn" onClick={handleSaveName}>Salvar</button>
          </div>
        ) : (
          <div className="store-name-display" onClick={() => { setNameInput(storeName); setEditingName(true) }}>
            <span className="store-name-value">{storeName || 'Minha Loja'}</span>
            <span className="store-name-edit-hint">Toque para editar</span>
          </div>
        )}
      </div>

      {/* Plan banner */}
      <div className="current-plan-banner">
        <div className="plan-badge-free">PLANO GRÁTIS</div>
        <p className="plan-status">Você usa <strong>{productCount} de {PLAN_LIMIT}</strong> produtos</p>
        <div className="plan-progress-bar">
          <div className="plan-progress-fill" style={{ width: `${usagePercent}%` }} />
        </div>
        <p className="plan-hint">{productCount} produto{productCount !== 1 ? 's' : ''} cadastrado{productCount !== 1 ? 's' : ''}</p>
      </div>

      {/* Free plan features */}
      <div className="plan-section">
        <p className="plan-section-title">✅ Seu plano atual inclui</p>
        {freePlanFeatures.map(f => (
          <div key={f} className="feature-row">
            <Check size={16} color="#00b894" />
            <span>{f}</span>
          </div>
        ))}
      </div>

      {/* PRO Plan upgrade card */}
      <div className="upgrade-card" onClick={() => setShowProModal(true)}>
        <div className="upgrade-header">
          <div className="upgrade-badge">
            <Zap size={14} />
            PLANO PRO
          </div>
          <div className="upgrade-price">
            <span className="price-main">R$ 19,90</span>
            <span className="price-period">/mês</span>
          </div>
        </div>
        <p className="upgrade-tagline">Faça sua loja crescer sem limites 🚀</p>
        <div className="upgrade-features">
          {proPlanFeatures.map(f => (
            <div key={f} className="upgrade-feature-row">
              <Check size={14} color="#6c5ce7" />
              <span>{f}</span>
            </div>
          ))}
        </div>
        <button className="upgrade-btn">
          <Zap size={18} />
          Assinar Plano Pro
        </button>
      </div>

      {/* Testimonial */}
      <div className="testimonial-card">
        <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
        <p className="testimonial-text">
          "Nunca fui de planilha. Agora sei exatamente o que vendi e quanto ganhei todo dia. Incrível!"
        </p>
        <p className="testimonial-author">— Maria Silva, Boutique da Maria – SP</p>
      </div>

      {/* Support */}
      <div className="support-section">
        <p className="support-label">💬 Precisa de ajuda?</p>
        <button className="support-btn">Falar com o Suporte</button>
        <p className="version-text">VendaFácil v1.0.0 — MVP Hackathon 2026</p>
      </div>
    </div>
  )
}
