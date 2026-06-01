import React, { useState, useEffect } from 'react';

function App() {
  // Theme State (Persists in localStorage)
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    // Default to dark mode for premium aesthetics if no preference, or let's use light as default
    return 'light';
  });

  // Mobile Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active Section State (for Navbar scroll highlighting)
  const [activeSection, setActiveSection] = useState('home');

  // Simulator Tab State
  const [simTab, setSimTab] = useState('financiamento');

  // Simulator Inputs
  // 1. Financiamento
  const [finValue, setFinValue] = useState(300000);
  const [finTerm, setFinTerm] = useState(240); // 20 years
  const [finRate, setFinRate] = useState(9.8); // 9.8% p.a.
  
  // 2. Consórcio
  const [consValue, setConsValue] = useState(150000);
  const [consTerm, setConsTerm] = useState(120); // 10 years
  const [consFee, setConsFee] = useState(15); // 15% administration fee

  // 3. Investimentos
  const [invInitial, setInvInitial] = useState(10000);
  const [invMonthly, setInvMonthly] = useState(500);
  const [invYears, setInvYears] = useState(15);
  const [invRate, setInvRate] = useState(11.2); // 11.2% p.a. (approx Selic/CDI)

  // Contact Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formService, setFormService] = useState('Financiamentos');
  const [formMessage, setFormMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Apply Theme class to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Handle Scroll to highlight active link
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'servicos', 'simulacao', 'sobre', 'contato'];
      const scrollPosition = window.scrollY + 120; // offset

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Theme Toggle Handler
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Form Submission Handler
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Create WhatsApp message
    const formattedText = `Olá Heron! Vim pelo site da Continental Consultoria e gostaria de uma assessoria.
    
*Nome:* ${formName}
*E-mail:* ${formEmail}
*Telefone:* ${formPhone}
*Interesse:* ${formService}
*Mensagem:* ${formMessage}`;

    const whatsappUrl = `https://api.whatsapp.com/send/?phone=5543996263069&text=${encodeURIComponent(formattedText)}&type=phone_number&app_absent=0`;
    
    setFormSubmitted(true);
    
    // Open in new tab
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      // Reset form
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormMessage('');
      setFormSubmitted(false);
    }, 1500);
  };

  // Format currency in BRL
  const formatBRL = (val) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatBRLDecimals = (val) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  // Simulator Calculations
  
  // 1. Financiamento (PRICE Table Amortization)
  const calculateFinancing = () => {
    const principal = finValue;
    const monthlyRate = (finRate / 100) / 12;
    const payments = finTerm;
    
    if (monthlyRate === 0) {
      const payment = principal / payments;
      return {
        installment: payment,
        totalPaid: principal,
        totalInterest: 0
      };
    }
    
    const installment = principal * (monthlyRate * Math.pow(1 + monthlyRate, payments)) / (Math.pow(1 + monthlyRate, payments) - 1);
    const totalPaid = installment * payments;
    const totalInterest = totalPaid - principal;
    
    return {
      installment,
      totalPaid,
      totalInterest
    };
  };

  // 2. Consórcio
  const calculateConsorcio = () => {
    const principal = consValue;
    const totalFeeValue = principal * (consFee / 100);
    const totalPaid = principal + totalFeeValue;
    const installment = totalPaid / consTerm;

    return {
      installment,
      totalPaid,
      totalFeeValue
    };
  };

  // 3. Investimentos (Compound Interest with Monthly Deposits)
  const calculateInvestimento = () => {
    const principal = invInitial;
    const monthlyDeposit = invMonthly;
    const years = invYears;
    const months = years * 12;
    const monthlyRate = Math.pow(1 + (invRate / 100), 1/12) - 1; // Effective monthly rate

    // FV = PV * (1 + r)^n + PMT * [((1 + r)^n - 1) / r]
    const fvInitial = principal * Math.pow(1 + monthlyRate, months);
    let fvMonthly = 0;
    if (monthlyRate > 0) {
      fvMonthly = monthlyDeposit * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    } else {
      fvMonthly = monthlyDeposit * months;
    }
    
    const totalFutureValue = fvInitial + fvMonthly;
    const totalInvested = principal + (monthlyDeposit * months);
    const totalInterest = totalFutureValue - totalInvested;

    return {
      totalFutureValue,
      totalInvested,
      totalInterest
    };
  };

  const finResults = calculateFinancing();
  const consResults = calculateConsorcio();
  const invResults = calculateInvestimento();

  // Handle WhatsApp simulation share
  const handleShareSimulation = () => {
    let msgText = '';
    if (simTab === 'financiamento') {
      msgText = `Olá Heron! Fiz uma simulação de Financiamento pelo site:
- Valor do Bem: ${formatBRL(finValue)}
- Prazo: ${finTerm} meses
- Taxa estimada: ${finRate}% a.a.
*Parcela Mensal Estimada:* ${formatBRLDecimals(finResults.installment)}
*Total Pago:* ${formatBRLDecimals(finResults.totalPaid)}`;
    } else if (simTab === 'consorcio') {
      msgText = `Olá Heron! Fiz uma simulação de Consórcio pelo site:
- Crédito Desejado: ${formatBRL(consValue)}
- Prazo: ${consTerm} meses
- Taxa de Adm: ${consFee}%
*Parcela Mensal Estimada:* ${formatBRLDecimals(consResults.installment)}
*Total de Taxas:* ${formatBRLDecimals(consResults.totalFeeValue)}`;
    } else {
      msgText = `Olá Heron! Fiz uma simulação de Investimento pelo site:
- Aporte Inicial: ${formatBRL(invInitial)}
- Depósito Mensal: ${formatBRL(invMonthly)}
- Prazo: ${invYears} anos
- Rentabilidade: ${invRate}% a.a.
*Patrimônio Acumulado Estimado:* ${formatBRLDecimals(invResults.totalFutureValue)}
*Total Investido do Bolso:* ${formatBRLDecimals(invResults.totalInvested)}`;
    }

    const shareUrl = `https://api.whatsapp.com/send/?phone=5543996263069&text=${encodeURIComponent(msgText)}&type=phone_number&app_absent=0`;
    window.open(shareUrl, '_blank');
  };

  return (
    <>
      {/* Header */}
      <header>
        <nav>
          <div className="logo">
            <img src="/continental-logo-1.png" alt="Continental Consultoria" className="logo-img" />
          </div>
          
          <button 
            className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Theme Toggle in Desktop Navbar */}
          <button 
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Alternar tema"
          >
            <i className={theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'}></i>
          </button>

          <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
            <li>
              <a 
                href="#home" 
                className={activeSection === 'home' ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </a>
            </li>
            <li>
              <a 
                href="#servicos" 
                className={activeSection === 'servicos' ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Serviços
              </a>
            </li>
            <li>
              <a 
                href="#simulacao" 
                className={activeSection === 'simulacao' ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Simulador
              </a>
            </li>
            <li>
              <a 
                href="#sobre" 
                className={activeSection === 'sobre' ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Sobre
              </a>
            </li>
            <li>
              <a 
                href="#contato" 
                className={activeSection === 'contato' ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contato
              </a>
            </li>
            <li>
              <a 
                href="https://loja.franq.com.br/pb/heron-semensato" 
                target="_blank" 
                rel="noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="cta-button"
                style={{ 
                  padding: '0.6rem 1.2rem', 
                  fontSize: '0.85rem',
                  marginTop: '0',
                  boxShadow: 'none',
                  color: 'var(--text-inverse)'
                }}
              >
                Simulação Completa
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section id="home" class="hero">
          <div className="hero-content">
            <h1>Soluções Financeiras <span>Completas</span> para Você e Sua Empresa</h1>
            <p>Consultoria especializada em financiamentos, investimentos, seguros, consórcios e planejamento financeiro de alto padrão.</p>
            <div className="hero-buttons">
              <a 
                href="https://api.whatsapp.com/send/?phone=5543996263069&text=Ol%C3%A1%2C+vim+pelo+site+e+gostaria+de+conhecer+mais+seu+trabalho.&type=phone_number&app_absent=0" 
                className="cta-button"
                target="_blank" 
                rel="noreferrer"
              >
                <i className="fab fa-whatsapp"></i> Fale Conosco
              </a>
              <a href="#simulacao" className="secondary-button">
                <i className="fas fa-calculator"></i> Simular Agora
              </a>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="servicos" className="services">
          <div className="section-header">
            <h2>Nossos Serviços</h2>
            <p>Soluções estruturadas e personalizadas para proteger e expandir seu patrimônio.</p>
          </div>
          
          <div className="services-grid">
            <div className="service-card">
              <i className="fas fa-home"></i>
              <h3>Financiamentos</h3>
              <p>
                • Imóveis residenciais e comerciais<br />
                • Veículos de passeio, utilitários e motos<br />
                • Equipamentos industriais e agrícolas
              </p>
            </div>
            
            <div className="service-card">
              <i className="fas fa-handshake"></i>
              <h3>Consórcios</h3>
              <p>
                • Planejamento inteligente de imóveis<br />
                • Automóveis e frotas corporativas<br />
                • Serviços e reformas estruturadas
              </p>
            </div>
            
            <div className="service-card">
              <i className="fas fa-shield-alt"></i>
              <h3>Seguros</h3>
              <p>
                • Seguros habitacionais e de imóveis<br />
                • Veículos de alto padrão e frotas<br />
                • Vida individual e em grupo<br />
                • Patrimonial e de responsabilidade civil
              </p>
            </div>
            
            <div className="service-card">
              <i className="fas fa-heartbeat"></i>
              <h3>Planos de Saúde</h3>
              <p>
                • Planos individuais e familiares<br />
                • Planos de saúde corporativos (PME)<br />
                • Assistência odontológica premium
              </p>
            </div>
            
            <div className="service-card">
              <i className="fas fa-chart-pie"></i>
              <h3>Investimentos</h3>
              <p>
                • Renda Fixa privada e pública<br />
                • Ações e fundos multimercados<br />
                • Acesso ao mercado internacional<br />
                • Alocação estratégica de capital
              </p>
            </div>
            
            <div className="service-card">
              <i className="fas fa-chess-king"></i>
              <h3>Planejamento</h3>
              <p>
                • Planejamento sucessório corporativo<br />
                • Estruturação de patrimônio familiar<br />
                • Previdência privada complementar
              </p>
            </div>
          </div>
        </section>

        {/* Simulator Section (Interactive Component!) */}
        <section id="simulacao" className="simulator-section" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '30px' }}>
          <div className="section-header">
            <h2>Simulador Financeiro Inteligente</h2>
            <p>Faça simulações em tempo real de suas metas financeiras, aportes ou parcelamentos de forma interativa.</p>
          </div>

          <div className="simulator-container">
            <div className="simulator-tabs">
              <button 
                className={`sim-tab-btn ${simTab === 'financiamento' ? 'active' : ''}`}
                onClick={() => setSimTab('financiamento')}
              >
                Financiamentos
              </button>
              <button 
                className={`sim-tab-btn ${simTab === 'consorcio' ? 'active' : ''}`}
                onClick={() => setSimTab('consorcio')}
              >
                Consórcio
              </button>
              <button 
                className={`sim-tab-btn ${simTab === 'investimento' ? 'active' : ''}`}
                onClick={() => setSimTab('investimento')}
              >
                Investimento / Previdência
              </button>
            </div>

            {/* TAB: FINANCIAMENTO */}
            {simTab === 'financiamento' && (
              <div className="sim-content-layout">
                <div className="sim-form">
                  <div className="sim-group">
                    <label>
                      Valor do Financiamento <span>{formatBRL(finValue)}</span>
                    </label>
                    <input 
                      type="range" 
                      min="20000" 
                      max="2000000" 
                      step="10000" 
                      value={finValue}
                      onChange={(e) => setFinValue(Number(e.target.value))}
                    />
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input 
                        type="number" 
                        value={finValue}
                        onChange={(e) => setFinValue(Number(e.target.value))}
                        style={{ marginTop: '0.5rem' }}
                      />
                    </div>
                  </div>

                  <div className="sim-group">
                    <label>
                      Prazo de Pagamento <span>{finTerm} meses ({Math.round(finTerm / 12)} anos)</span>
                    </label>
                    <input 
                      type="range" 
                      min="12" 
                      max="420" 
                      step="12" 
                      value={finTerm}
                      onChange={(e) => setFinTerm(Number(e.target.value))}
                    />
                  </div>

                  <div className="sim-group">
                    <label>
                      Taxa de Juros Estimada <span>{finRate}% a.a.</span>
                    </label>
                    <input 
                      type="range" 
                      min="4" 
                      max="18" 
                      step="0.1" 
                      value={finRate}
                      onChange={(e) => setFinRate(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="sim-results">
                  <div>
                    <div className="sim-result-header">
                      <h4>Parcela Mensal Estimada</h4>
                      <div className="sim-result-value">{formatBRLDecimals(finResults.installment)}</div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>*Tabela PRICE. Sem encargos adicionais (seguro/adm)</span>
                    </div>

                    <div className="sim-result-details">
                      <div className="sim-detail-row">
                        <span>Valor financiado:</span>
                        <span>{formatBRL(finValue)}</span>
                      </div>
                      <div className="sim-detail-row">
                        <span>Total de juros pagos:</span>
                        <span style={{ color: 'var(--accent-color)' }}>{formatBRLDecimals(finResults.totalInterest)}</span>
                      </div>
                      <div className="sim-detail-row">
                        <span>Custo Total do Bem:</span>
                        <span>{formatBRLDecimals(finResults.totalPaid)}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleShareSimulation} 
                    className="cta-button sim-cta"
                  >
                    <i className="fab fa-whatsapp"></i> Falar com Heron sobre a Simulação
                  </button>
                </div>
              </div>
            )}

            {/* TAB: CONSÓRCIO */}
            {simTab === 'consorcio' && (
              <div className="sim-content-layout">
                <div className="sim-form">
                  <div className="sim-group">
                    <label>
                      Carta de Crédito Desejada <span>{formatBRL(consValue)}</span>
                    </label>
                    <input 
                      type="range" 
                      min="20000" 
                      max="1500000" 
                      step="10000" 
                      value={consValue}
                      onChange={(e) => setConsValue(Number(e.target.value))}
                    />
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input 
                        type="number" 
                        value={consValue}
                        onChange={(e) => setConsValue(Number(e.target.value))}
                        style={{ marginTop: '0.5rem' }}
                      />
                    </div>
                  </div>

                  <div className="sim-group">
                    <label>
                      Prazo do Consórcio <span>{consTerm} meses ({Math.round(consTerm / 12)} anos)</span>
                    </label>
                    <input 
                      type="range" 
                      min="24" 
                      max="240" 
                      step="12" 
                      value={consTerm}
                      onChange={(e) => setConsTerm(Number(e.target.value))}
                    />
                  </div>

                  <div className="sim-group">
                    <label>
                      Taxa de Administração Total <span>{consFee}%</span>
                    </label>
                    <input 
                      type="range" 
                      min="8" 
                      max="25" 
                      step="0.5" 
                      value={consFee}
                      onChange={(e) => setConsFee(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="sim-results">
                  <div>
                    <div className="sim-result-header">
                      <h4>Parcela Mensal Estimada</h4>
                      <div className="sim-result-value">{formatBRLDecimals(consResults.installment)}</div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>*Sem fundo de reserva. Sujeito a reajustes contratuais</span>
                    </div>

                    <div className="sim-result-details">
                      <div className="sim-detail-row">
                        <span>Valor do crédito:</span>
                        <span>{formatBRL(consValue)}</span>
                      </div>
                      <div className="sim-detail-row">
                        <span>Taxa de administração cobrada:</span>
                        <span style={{ color: 'var(--accent-color)' }}>{formatBRLDecimals(consResults.totalFeeValue)}</span>
                      </div>
                      <div className="sim-detail-row">
                        <span>Total a pagar ao final:</span>
                        <span>{formatBRLDecimals(consResults.totalPaid)}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleShareSimulation} 
                    className="cta-button sim-cta"
                  >
                    <i className="fab fa-whatsapp"></i> Falar com Heron sobre o Consórcio
                  </button>
                </div>
              </div>
            )}

            {/* TAB: INVESTIMENTOS */}
            {simTab === 'investimento' && (
              <div className="sim-content-layout">
                <div className="sim-form">
                  <div className="sim-group">
                    <label>
                      Aporte Inicial Único <span>{formatBRL(invInitial)}</span>
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max="500000" 
                      step="5000" 
                      value={invInitial}
                      onChange={(e) => setInvInitial(Number(e.target.value))}
                    />
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input 
                        type="number" 
                        value={invInitial}
                        onChange={(e) => setInvInitial(Number(e.target.value))}
                        style={{ marginTop: '0.5rem' }}
                      />
                    </div>
                  </div>

                  <div className="sim-group">
                    <label>
                      Aporte Mensal Recorrente <span>{formatBRL(invMonthly)}</span>
                    </label>
                    <input 
                      type="range" 
                      min="50" 
                      max="20000" 
                      step="50" 
                      value={invMonthly}
                      onChange={(e) => setInvMonthly(Number(e.target.value))}
                    />
                  </div>

                  <div className="sim-group">
                    <label>
                      Período de Acumulação <span>{invYears} anos ({invYears * 12} meses)</span>
                    </label>
                    <input 
                      type="range" 
                      min="1" 
                      max="40" 
                      step="1" 
                      value={invYears}
                      onChange={(e) => setInvYears(Number(e.target.value))}
                    />
                  </div>

                  <div className="sim-group">
                    <label>
                      Rentabilidade Anual Estimada (Líquida) <span>{invRate}% a.a.</span>
                    </label>
                    <input 
                      type="range" 
                      min="2" 
                      max="18" 
                      step="0.1" 
                      value={invRate}
                      onChange={(e) => setInvRate(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="sim-results">
                  <div>
                    <div className="sim-result-header">
                      <h4>Patrimônio Estimado Acumulado</h4>
                      <div className="sim-result-value" style={{ color: '#10b981' }}>{formatBRLDecimals(invResults.totalFutureValue)}</div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>*Projeção líquida de juros compostos simulados</span>
                    </div>

                    <div className="sim-result-details">
                      <div className="sim-detail-row">
                        <span>Total de capital investido:</span>
                        <span>{formatBRL(invResults.totalInvested)}</span>
                      </div>
                      <div className="sim-detail-row">
                        <span>Total de rendimentos gerados:</span>
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>{formatBRLDecimals(invResults.totalInterest)}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleShareSimulation} 
                    className="cta-button sim-cta"
                    style={{ background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', boxShadow: '0 10px 25px -10px rgba(16, 185, 129, 0.4)' }}
                  >
                    <i className="fab fa-whatsapp"></i> Falar com Heron sobre os Investimentos
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* About Section */}
        <section id="sobre" className="about-section">
          <div className="about">
            <div className="about-content">
              <div>
                <div className="section-header" style={{ textAlign: 'left', marginBottom: '2.5rem', display: 'inline-block' }}>
                  <h2 style={{ textAlign: 'left' }}>Sobre Nós</h2>
                  <p style={{ margin: '0' }}>Excelência, solidez e parcerias duradouras para a sua tranquilidade.</p>
                </div>
                
                <div className="about-text">
                  <p>A <strong>Continental Consultoria</strong> é especializada em oferecer soluções financeiras completas, robustas e altamente personalizadas.</p>
                  <p>Nossa expertise e credibilidade abrangem desde a originação de financiamentos imobiliários e consórcios tradicionais até a alocação em investimentos sofisticados e planejamento de proteção patrimonial/sucessória.</p>
                  <p>Com profissionais altamente qualificados e credenciados como assessores de excelência parceiros da <strong>Franq Open Banking</strong>, trabalhamos incansavelmente para desenhar e garantir as melhores estruturas fiscais e condições de juros para nossos clientes, sejam pessoas físicas ou jurídicas.</p>
                </div>
              </div>
              <div className="about-image" aria-label="Escritório Continental Consultoria"></div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contato" className="contact">
          <div className="section-header">
            <h2>Entre em Contato</h2>
            <p>Fale diretamente com nossa assessoria e receba uma análise do seu perfil sem custo.</p>
          </div>

          <div className="contact-layout">
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon-box">
                  <i className="fas fa-phone"></i>
                </div>
                <div className="contact-text-box">
                  <h4>Telefone & WhatsApp</h4>
                  <p>
                    <a href="https://api.whatsapp.com/send/?phone=5543996263069&text=Ol%C3%A1%2C+vim+pelo+site+e+gostaria+de+conhecer+mais+seu+trabalho.&type=phone_number&app_absent=0" target="_blank" rel="noreferrer">
                      (43) 9 9626-3069
                    </a>
                  </p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon-box">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="contact-text-box">
                  <h4>E-mail Corporativo</h4>
                  <p>
                    <a href="mailto:continentalconsultoria2@outlook.com">
                      continentalconsultoria2@outlook.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon-box">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div className="contact-text-box">
                  <h4>Escritório & Atendimento</h4>
                  <p>
                    <a href="https://g.co/kgs/fqzfVd2" target="_blank" rel="noreferrer">
                      Londrina, PR - Atendimento Nacional & Internacional
                    </a>
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem' }}>Canais Sociais e Plataformas</h4>
                <div className="social-links">
                  <a href="https://instagram.com/continental.consultoria" className="social-link-card" target="_blank" rel="noreferrer">
                    <i className="fab fa-instagram"></i> Instagram
                  </a>
                  <a href="https://linktr.ee/continentalconsultoria" className="social-link-card" target="_blank" rel="noreferrer">
                    <i className="fas fa-link"></i> Linktree
                  </a>
                  <a href="https://loja.franq.com.br/pb/heron-semensato" className="social-link-card" target="_blank" rel="noreferrer">
                    <i className="fas fa-handshake"></i> Plataforma Franq
                  </a>
                  <a href="https://bit.ly/hs-reuniao-assessoria" className="social-link-card" target="_blank" rel="noreferrer">
                    <i className="fas fa-calendar-alt"></i> Agendar Reunião
                  </a>
                </div>
              </div>
            </div>

            {/* Premium Interactive Contact Form */}
            <div className="contact-form-container">
              <h3>Fale com um Especialista</h3>
              <p>Envie sua mensagem e retornaremos em poucos minutos via WhatsApp ou E-mail.</p>
              
              {formSubmitted && (
                <div className="toast-success">
                  <i className="fas fa-check-circle"></i> Mensagem preenchida! Abrindo conversa direta no WhatsApp...
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Nome Completo</label>
                  <input 
                    type="text" 
                    id="name" 
                    required 
                    placeholder="Seu nome"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">E-mail</label>
                    <input 
                      type="email" 
                      id="email" 
                      required 
                      placeholder="Ex: seuemail@dominio.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">DDD + Celular (WhatsApp)</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      required 
                      placeholder="Ex: (43) 99999-9999"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="service">Área de Interesse</label>
                  <select 
                    id="service"
                    value={formService}
                    onChange={(e) => setFormService(e.target.value)}
                  >
                    <option value="Financiamentos">Financiamento (Imóvel/Veículo)</option>
                    <option value="Consórcios">Consórcio de Alto Padrão</option>
                    <option value="Seguros">Seguros Corporativos e Pessoais</option>
                    <option value="Planos de Saúde">Planos de Saúde (PME / Individual)</option>
                    <option value="Investimentos">Investimentos & Previdência Privada</option>
                    <option value="Planejamento Sucessório">Planejamento Patrimonial e Sucessório</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Detalhes da sua Solicitação</label>
                  <textarea 
                    id="message" 
                    rows="4" 
                    required 
                    placeholder="Como podemos te ajudar hoje?"
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                  ></textarea>
                </div>

                <button type="submit" className="cta-button" style={{ border: 'none', cursor: 'pointer' }}>
                  <i className="fab fa-whatsapp"></i> Iniciar Assessoria no WhatsApp
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="footer-logo">
          <img src="/continental-logo-1.png" alt="Continental Consultoria" />
        </div>
        <p>&copy; {new Date().getFullYear()} Continental Consultoria. Todos os direitos reservados. by <a href="https://premiss.io" target="_blank" rel="noopener noreferrer">
          <b className='dev'>Premiss.io</b>
        </a></p>
        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#64748b' }}>
          Parceiro Franq Open Banking. Assessoria de investimentos autorizada.
        </p>
      </footer>
    </>
  );
}

export default App;
