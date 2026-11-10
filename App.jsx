import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ShoppingCart,
  BookOpen,
  Package,
  Bot,
  Search,
  Plus,
  Trash2,
  Printer,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserCheck,
  DollarSign,
  BarChart3,
  Sun,
  Moon,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  CreditCard,
  Building2,
  Users,
  RefreshCw,
  Barcode,
  Camera,
  Check,
  Volume2,
  ChevronRight,
  Menu
} from 'lucide-react';

// --- Initial Mock Data with Real Barcodes ---
const initialProducts = [
  { id: 1, name: 'Samba Rice 5kg', price: 1150, category: 'Groceries', stock: 45, sku: 'GR-001', barcode: '8901001001' },
  { id: 2, name: 'Anchor Milk Powder 400g', price: 1050, category: 'Dairy', stock: 8, sku: 'DY-002', barcode: '8901001002' },
  { id: 3, name: 'Ceylon Black Tea 250g', price: 650, category: 'Beverages', stock: 60, sku: 'BV-003', barcode: '8901001003' },
  { id: 4, name: 'White Sugar 1kg', price: 340, category: 'Groceries', stock: 120, sku: 'GR-004', barcode: '8901001004' },
  { id: 5, name: 'Sunlight Soap 100g', price: 140, category: 'Household', stock: 4, sku: 'HH-005', barcode: '8901001005' },
  { id: 6, name: 'Munchee Super Cream Cracker', price: 220, category: 'Snacks', stock: 35, sku: 'SN-006', barcode: '8901001006' },
  { id: 7, name: 'Coca-Cola 1.5L', price: 480, category: 'Beverages', stock: 25, sku: 'BV-007', barcode: '8901001007' },
  { id: 8, name: 'Knorr Crispy Fried Chicken Mix', price: 190, category: 'Groceries', stock: 50, sku: 'GR-008', barcode: '8901001008' },
];

const initialLedgers = [
  { id: 1, name: 'Nimal Perera', type: 'Customer', balance: 4500, phone: '0771234567', status: 'Pending', lastUpdated: '2026-03-28' },
  { id: 2, name: 'Kamal Distributors', type: 'Supplier', balance: -25000, phone: '0112345678', status: 'Pending', lastUpdated: '2026-03-25' },
  { id: 3, name: 'Sunil Hardware', type: 'Customer', balance: 0, phone: '0719876543', status: 'Settled', lastUpdated: '2026-03-29' },
  { id: 4, name: 'Lanka Wholesale Traders', type: 'Supplier', balance: -12500, phone: '0115554433', status: 'Pending', lastUpdated: '2026-03-20' },
];

const initialTransactions = [
  { id: 'TX-1001', date: '2026-03-30 10:15', account: 'Nimal Perera', type: 'Credit', amount: 1500, note: 'Grocery Purchase on Credit' },
  { id: 'TX-1002', date: '2026-03-30 11:30', account: 'Kamal Distributors', type: 'Debit', amount: 10000, note: 'Partial Stock Payment' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('pos');
  const [darkMode, setDarkMode] = useState(true);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  // Category List Definition
  const categories = ['All', 'Groceries', 'Dairy', 'Beverages', 'Household', 'Snacks'];

  // States
  const [products, setProducts] = useState(initialProducts);
  const [ledgers, setLedgers] = useState(initialLedgers);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [discount, setDiscount] = useState(0);
  const [customerName, setCustomerName] = useState('Cash Customer');
  const [cashTendered, setCashTendered] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastBill, setLastBill] = useState(null);

  // Barcode Scanner States & Hardware Listener
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannerStatus, setScannerStatus] = useState('Camera & Mobile Scanner Ready');
  const [scannerFeedback, setScannerFeedback] = useState(null);
  const [showCamScanner, setShowCamScanner] = useState(false);
  const barcodeInputRef = useRef(null);

  // New Item / Ledger Modal States
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Groceries', stock: '', barcode: '' });
  const [showAddLedger, setShowAddLedger] = useState(false);
  const [newLedger, setNewLedger] = useState({ name: '', type: 'Customer', balance: '', phone: '' });

  // AI Assistant Chat State
  const [aiMessages, setAiMessages] = useState([
    { sender: 'ai', text: 'Hello! Mobile FoodCity POS & AI Ledger is active. Tap items or scan barcodes to start.' }
  ]);
  const [inputAi, setInputAi] = useState('');

  // Sound Effect Simulation for Barcode Scan (Beep)
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.log('Audio error', e);
    }
  };

  // Barcode Scan Handler
  const handleScanBarcode = (scannedCode) => {
    if (!scannedCode) return;
    const cleanCode = scannedCode.trim();
    const matchedProduct = products.find(p => p.barcode === cleanCode || p.sku.toLowerCase() === cleanCode.toLowerCase());

    if (matchedProduct) {
      if (matchedProduct.stock <= 0) {
        setScannerFeedback({ type: 'error', text: `Out of stock: ${matchedProduct.name}` });
      } else {
        addToCart(matchedProduct);
        playBeep();
        setScannerFeedback({ type: 'success', text: `Scanned: ${matchedProduct.name} (Rs. ${matchedProduct.price})` });
      }
    } else {
      setScannerFeedback({ type: 'error', text: `Barcode [${cleanCode}] not found!` });
    }

    setBarcodeInput('');
    setTimeout(() => setScannerFeedback(null), 3000);
  };

  // Global Hardware / Mobile Keyboard Barcode Listener
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e) => {
      const targetTag = e.target.tagName.toLowerCase();
      if (targetTag === 'input' && e.target.id !== 'barcodeSearchInput') return;
      if (targetTag === 'textarea' || targetTag === 'select') return;

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 100) {
        buffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length > 2) {
          handleScanBarcode(buffer);
          e.preventDefault();
        }
        buffer = '';
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products]);

  // Cart calculations
  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
  const tax = useMemo(() => subtotal * 0.02, [subtotal]);
  const total = useMemo(() => Math.max(0, subtotal + tax - discount), [subtotal, tax, discount]);
  const changeDue = useMemo(() => {
    const cash = parseFloat(cashTendered) || 0;
    return Math.max(0, cash - total);
  }, [cashTendered, total]);

  // Cart actions
  const addToCart = (product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));

  // Handle Complete Sale & Print Receipt
  const handleCheckout = (paymentType = 'Cash') => {
    if (cart.length === 0) return;

    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(c => c.id === p.id);
      if (cartItem) {
        return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
      }
      return p;
    }));

    const billData = {
      id: `FC-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
      items: [...cart],
      subtotal,
      tax,
      discount,
      total,
      cashTendered: parseFloat(cashTendered) || total,
      changeDue: paymentType === 'Cash' ? Math.max(0, (parseFloat(cashTendered) || total) - total) : 0,
      customer: customerName,
      paymentType,
      cashier: 'Cashier Mobile #01'
    };

    if (paymentType === 'Credit') {
      setLedgers(prev => prev.map(l => {
        if (l.name.toLowerCase() === customerName.toLowerCase()) {
          return { ...l, balance: l.balance + total, status: 'Pending', lastUpdated: new Date().toISOString().split('T')[0] };
        }
        return l;
      }));
    }

    setLastBill(billData);
    setShowReceipt(true);
    setCart([]);
    setDiscount(0);
    setCashTendered('');
    setMobileCartOpen(false);
  };

  // Add New Product
  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    const added = {
      id: Date.now(),
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      stock: parseInt(newProduct.stock || 0),
      sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
      barcode: newProduct.barcode || `${Math.floor(8900000 + Math.random() * 90000)}`
    };
    setProducts([added, ...products]);
    setShowAddProduct(false);
    setNewProduct({ name: '', price: '', category: 'Groceries', stock: '', barcode: '' });
  };

  // Add New Ledger Account
  const handleCreateLedger = (e) => {
    e.preventDefault();
    if (!newLedger.name) return;
    const added = {
      id: Date.now(),
      name: newLedger.name,
      type: newLedger.type,
      balance: parseFloat(newLedger.balance || 0),
      phone: newLedger.phone || 'N/A',
      status: parseFloat(newLedger.balance || 0) === 0 ? 'Settled' : 'Pending',
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setLedgers([...ledgers, added]);
    setShowAddLedger(false);
    setNewLedger({ name: '', type: 'Customer', balance: '', phone: '' });
  };

  // Simulated AI query handling
  const handleAiSend = (queryText = inputAi) => {
    if (!queryText.trim()) return;
    const userMsg = { sender: 'user', text: queryText };
    setAiMessages(prev => [...prev, userMsg]);
    setInputAi('');

    setTimeout(() => {
      let reply = "I've analyzed your store data: Overall sales are stable. Consider restocking low-stock items soon.";
      const lowStockList = products.filter(p => p.stock < 10).map(p => p.name).join(', ');
      
      const lower = queryText.toLowerCase();
      if (lower.includes('stock') || lower.includes('inventory')) {
        reply = lowStockList 
          ? `⚠️ Low stock on: ${lowStockList}. Reorder recommended!` 
          : '✅ All inventory items are currently at healthy stock levels.';
      } else if (lower.includes('ledger') || lower.includes('debt') || lower.includes('pending')) {
        const pendingCust = ledgers.filter(l => l.type === 'Customer' && l.balance > 0);
        const totalPending = pendingCust.reduce((acc, c) => acc + c.balance, 0);
        reply = `💳 Total pending receivables: Rs. ${totalPending.toLocaleString()} from ${pendingCust.length} customers.`;
      } else if (lower.includes('sale') || lower.includes('best') || lower.includes('prediction')) {
        reply = "📈 AI Forecast: 'Samba Rice 5kg' & 'White Sugar' are top movers this week.";
      }

      setAiMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 500);
  };

  const totalCartCount = useMemo(() => cart.reduce((a, b) => a + b.quantity, 0), [cart]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} transition-colors duration-200 flex flex-col font-sans pb-20 sm:pb-0`}>
      
      {/* Responsive Top Header */}
      <header className={`px-4 py-3 border-b ${darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white'} backdrop-blur sticky top-0 z-40 flex items-center justify-between`}>
        <div className="flex items-center space-x-2.5">
          <div className="bg-gradient-to-tr from-emerald-500 to-teal-500 p-2 rounded-xl shadow-md">
            <Barcode className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg leading-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Sakuni Stores POS
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Smart Barcode & Ledger System</p>
          </div>
        </div>

        {/* Mobile Header Actions */}
        <div className="flex items-center space-x-2">
          {activeTab === 'pos' && (
            <button
              onClick={() => setMobileCartOpen(true)}
              className="relative lg:hidden p-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Rs. {total.toLocaleString()}</span>
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-extrabold">
                  {totalCartCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl border ${darkMode ? 'border-slate-800 bg-slate-900 text-amber-400' : 'border-slate-200 bg-white text-slate-700'}`}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-6 max-w-7xl w-full mx-auto">
        
        {/* --- 1. POS TERMINAL TAB --- */}
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left: Product Catalog & Barcode Scanner */}
            <div className="lg:col-span-7 flex flex-col space-y-3">
              
              {/* Barcode Input Bar optimized for Mobile */}
              <div className={`p-3 sm:p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-2.5 ${darkMode ? 'bg-slate-900/90 border-emerald-500/30' : 'bg-emerald-50/50 border-emerald-200'}`}>
                <div className="flex items-center gap-2.5 w-full">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    <Barcode className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Barcode Scanner</span>
                    <p className="text-[11px] text-slate-400">Type barcode or tap camera scan button</p>
                  </div>
                </div>

                <div className="flex gap-2 w-full">
                  <form onSubmit={(e) => { e.preventDefault(); handleScanBarcode(barcodeInput); }} className="flex gap-1.5 flex-1">
                    <input
                      id="barcodeSearchInput"
                      ref={barcodeInputRef}
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter Barcode (eg 8901001001)..."
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-mono outline-none transition ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-emerald-400 focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500'
                      }`}
                    />
                    <button type="submit" className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-md shrink-0">
                      Scan
                    </button>
                  </form>

                  <button
                    onClick={() => setShowCamScanner(!showCamScanner)}
                    className="px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition flex items-center justify-center shrink-0"
                    title="Camera Scanner"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Feedback toast for Barcode */}
              {scannerFeedback && (
                <div className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                  scannerFeedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}>
                  <span className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" /> {scannerFeedback.text}
                  </span>
                  <X className="w-4 h-4 cursor-pointer" onClick={() => setScannerFeedback(null)} />
                </div>
              )}

              {/* Mobile Quick Barcode Drawer */}
              {showCamScanner && (
                <div className={`p-3 rounded-2xl border text-center relative ${darkMode ? 'bg-slate-900 border-indigo-500/40' : 'bg-indigo-50 border-indigo-200'}`}>
                  <button onClick={() => setShowCamScanner(false)} className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-xs font-bold text-indigo-400 mb-1 flex items-center justify-center gap-1">
                    <Camera className="w-4 h-4" /> Camera Scan Simulator
                  </p>
                  <p className="text-[11px] text-slate-400 mb-2">Tap any item below to scan barcode immediately:</p>
                  <div className="flex flex-wrap gap-1.5 justify-center max-h-36 overflow-y-auto">
                    {products.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { handleScanBarcode(p.barcode); setShowCamScanner(false); }}
                        className="px-2 py-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[10px] font-mono hover:bg-indigo-500/20"
                      >
                        {p.name} [{p.barcode}]
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search & Mobile Category Selector */}
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search item, SKU or barcode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs outline-none transition ${
                      darkMode ? 'bg-slate-900 border-slate-800 text-slate-100 focus:border-emerald-500' : 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500'
                    }`}
                  />
                </div>

                <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition ${
                        selectedCategory === cat
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Touch-optimized Product Grid for Phone */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                {products
                  .filter(p => 
                    (selectedCategory === 'All' || p.category === selectedCategory) &&
                    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.includes(searchQuery) || p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map((product) => {
                    const lowStock = product.stock <= 5;
                    return (
                      <div
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between active:scale-95 ${
                          darkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/50' : 'bg-white border-slate-200 hover:border-emerald-500 shadow-sm'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {product.category}
                            </span>
                            {lowStock && (
                              <span className="text-[9px] text-amber-400 font-bold bg-amber-400/10 px-1 rounded">Low</span>
                            )}
                          </div>
                          <h3 className="font-semibold text-xs line-clamp-1">{product.name}</h3>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                            <span className="font-mono text-slate-500">#{product.barcode}</span>
                            <span>Stock: <strong>{product.stock}</strong></span>
                          </div>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between border-t border-slate-800/40 pt-2">
                          <span className="font-bold text-xs sm:text-sm text-emerald-400">Rs. {product.price.toLocaleString()}</span>
                          <button className="p-1 rounded-lg bg-emerald-600 text-white">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Desktop Side Cart View */}
            <div className={`hidden lg:flex lg:col-span-5 rounded-2xl border p-5 flex-col justify-between ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-md'}`}>
              <CartContent
                cart={cart}
                darkMode={darkMode}
                customerName={customerName}
                setCustomerName={setCustomerName}
                updateCartQuantity={updateCartQuantity}
                removeFromCart={removeFromCart}
                subtotal={subtotal}
                tax={tax}
                discount={discount}
                setDiscount={setDiscount}
                total={total}
                cashTendered={cashTendered}
                setCashTendered={setCashTendered}
                changeDue={changeDue}
                handleCheckout={handleCheckout}
              />
            </div>
          </div>
        )}

        {/* --- 2. LEDGER ACCOUNTS TAB --- */}
        {activeTab === 'ledger' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base sm:text-xl font-bold">Ledger & Debt (ලේජර් ගිණුම්)</h2>
                <p className="text-[11px] text-slate-400">Track customer & supplier credit balances.</p>
              </div>
              <button
                onClick={() => setShowAddLedger(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500"
              >
                <Plus className="w-4 h-4" /> Add Account
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-center text-slate-400 text-xs">
                  <span>Receivables (Customers)</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-lg font-bold text-emerald-400 mt-1">
                  Rs. {ledgers.filter(l => l.type === 'Customer').reduce((a, b) => a + Math.max(0, b.balance), 0).toLocaleString()}
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-center text-slate-400 text-xs">
                  <span>Payables (Suppliers)</span>
                  <Building2 className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-lg font-bold text-rose-400 mt-1">
                  Rs. {Math.abs(ledgers.filter(l => l.type === 'Supplier').reduce((a, b) => a + b.balance, 0)).toLocaleString()}
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-center text-slate-400 text-xs">
                  <span>Pending Balances</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-lg font-bold text-amber-400 mt-1">
                  {ledgers.filter(l => l.status === 'Pending').length} Accounts
                </div>
              </div>
            </div>

            {/* Ledger Cards for Mobile / Table for Desktop */}
            <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b ${darkMode ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Balance</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {ledgers.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/20">
                        <td className="p-3 font-semibold">
                          <div>{item.name}</div>
                          <div className="text-[10px] text-slate-400">{item.phone}</div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] ${item.type === 'Customer' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className={`p-3 font-bold ${item.balance > 0 ? 'text-emerald-400' : item.balance < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                          Rs. {Math.abs(item.balance).toLocaleString()}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setLedgers(ledgers.map(l => l.id === item.id ? { ...l, balance: 0, status: 'Settled' } : l));
                            }}
                            className="px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-200"
                          >
                            Settle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- 3. INVENTORY TAB --- */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base sm:text-xl font-bold">Inventory & Barcodes</h2>
                <p className="text-[11px] text-slate-400">Manage stock and product barcodes.</p>
              </div>
              <button
                onClick={() => setShowAddProduct(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b ${darkMode ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                    <tr>
                      <th className="p-3">Barcode</th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td className="p-3 font-mono text-[10px] text-emerald-400">{p.barcode}</td>
                        <td className="p-3 font-semibold">{p.name}</td>
                        <td className="p-3 font-bold text-emerald-400">Rs. {p.price}</td>
                        <td className="p-3">
                          <span className={`font-bold ${p.stock <= 5 ? 'text-amber-400' : 'text-slate-200'}`}>
                            {p.stock}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- 4. AI ANALYTICS TAB --- */}
        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 space-y-3">
              <h2 className="text-base sm:text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" /> AI Business Assistant
              </h2>

              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className="font-semibold text-xs mb-2">Tap a question for quick AI answers:</h3>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Which products have low stock?",
                    "Summary of customer debts",
                    "Best selling products prediction"
                  ].map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAiSend(q)}
                      className="px-2.5 py-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-[11px]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={`lg:col-span-5 rounded-2xl border p-3 flex flex-col justify-between h-96 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                <Bot className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-xs">AI Assistant</h3>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
                {aiMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-2.5 rounded-xl text-xs ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white'
                        : darkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex gap-1.5">
                <input
                  type="text"
                  placeholder="Ask AI..."
                  value={inputAi}
                  onChange={(e) => setInputAi(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-xl border outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                />
                <button
                  onClick={() => handleAiSend()}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- MOBILE BOT NAV BAR --- */}
      <nav className={`fixed bottom-0 left-0 right-0 border-t ${darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-200'} backdrop-blur z-40 flex justify-around p-2 lg:hidden`}>
        {[
          { id: 'pos', label: 'POS', icon: ShoppingCart },
          { id: 'ledger', label: 'Ledger', icon: BookOpen },
          { id: 'inventory', label: 'Items', icon: Package },
          { id: 'ai', label: 'AI', icon: Bot },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
                active ? 'text-emerald-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* --- MOBILE SLIDE-UP CART MODAL --- */}
      {mobileCartOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col justify-end lg:hidden">
          <div className={`w-full rounded-t-3xl p-4 max-h-[85vh] overflow-y-auto flex flex-col justify-between ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}`}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-400" /> Mobile Cart
              </h3>
              <button onClick={() => setMobileCartOpen(false)} className="p-1 rounded-full bg-slate-800 text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <CartContent
              cart={cart}
              darkMode={darkMode}
              customerName={customerName}
              setCustomerName={setCustomerName}
              updateCartQuantity={updateCartQuantity}
              removeFromCart={removeFromCart}
              subtotal={subtotal}
              tax={tax}
              discount={discount}
              setDiscount={setDiscount}
              total={total}
              cashTendered={cashTendered}
              setCashTendered={setCashTendered}
              changeDue={changeDue}
              handleCheckout={handleCheckout}
            />
          </div>
        </div>
      )}

      {/* --- MODAL 1: ADD PRODUCT --- */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl p-5 border shadow-2xl ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm sm:text-base">Add Product</h3>
              <button onClick={() => setShowAddProduct(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Product Name</label>
                <input required type="text" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className={`w-full p-2 rounded-xl border outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Barcode (EAN/UPC)</label>
                <input required type="text" placeholder="Scan or type barcode" value={newProduct.barcode} onChange={e => setNewProduct({ ...newProduct, barcode: e.target.value })} className={`w-full p-2 rounded-xl border font-mono outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-slate-50 border-slate-200'}`} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Price (Rs.)</label>
                  <input required type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className={`w-full p-2 rounded-xl border outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Stock</label>
                  <input type="number" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} className={`w-full p-2 rounded-xl border outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold mt-2">Save Product</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD LEDGER ACCOUNT --- */}
      {showAddLedger && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl p-5 border shadow-2xl ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm sm:text-base">Add Ledger Account</h3>
              <button onClick={() => setShowAddLedger(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateLedger} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Account Name</label>
                <input required type="text" value={newLedger.name} onChange={e => setNewLedger({ ...newLedger, name: e.target.value })} className={`w-full p-2 rounded-xl border outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Type</label>
                  <select value={newLedger.type} onChange={e => setNewLedger({ ...newLedger, type: e.target.value })} className={`w-full p-2 rounded-xl border outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <option value="Customer">Customer</option>
                    <option value="Supplier">Supplier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Opening Balance</label>
                  <input type="number" value={newLedger.balance} onChange={e => setNewLedger({ ...newLedger, balance: e.target.value })} className={`w-full p-2 rounded-xl border outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold mt-2">Create Account</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: THERMAL RECEIPT --- */}
      {showReceipt && lastBill && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="w-full max-w-xs sm:max-w-sm bg-white text-slate-900 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-2 font-mono text-[11px] leading-tight border border-slate-300">
            <div className="text-center border-b border-dashed border-slate-400 pb-2">
              <h2 className="font-extrabold text-base tracking-wider font-sans">SAKUNI STORES</h2>
              <p className="text-[9px] text-slate-600 font-sans">Supermarket & Retail Store</p>
              
              <div className="mt-2 text-[9px] text-slate-700 flex justify-between border-t border-slate-200 pt-1">
                <span>INV: {lastBill.id}</span>
                <span>{lastBill.date}</span>
              </div>
            </div>

            <div className="space-y-1 border-b border-dashed border-slate-400 pb-2">
              {lastBill.items.map((item, i) => (
                <div key={i} className="flex justify-between text-[10px]">
                  <span className="w-1/2 truncate font-sans">{item.name}</span>
                  <span className="w-1/4 text-center">{item.quantity}×{item.price}</span>
                  <span className="w-1/4 text-right font-bold">{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-right text-[10px] border-b border-dashed border-slate-400 pb-2">
              <div className="flex justify-between font-extrabold text-xs text-slate-900 pt-1">
                <span>TOTAL AMOUNT</span>
                <span>Rs. {lastBill.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>CASH PAID</span>
                <span>Rs. {lastBill.cashTendered.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900">
                <span>CHANGE (ඉතිරි)</span>
                <span>Rs. {lastBill.changeDue.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center pt-1 space-y-1">
              <p className="text-[9px] text-slate-600 font-sans">
                Thank you! ස්තූතියි!
              </p>
            </div>

            <div className="pt-2 flex gap-2 font-sans">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-1 text-xs"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Cart Component
function CartContent({
  cart,
  darkMode,
  customerName,
  setCustomerName,
  updateCartQuantity,
  removeFromCart,
  subtotal,
  tax,
  discount,
  setDiscount,
  total,
  cashTendered,
  setCashTendered,
  changeDue,
  handleCheckout
}) {
  return (
    <div className="flex flex-col h-full justify-between space-y-3">
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
          <h2 className="font-bold text-sm sm:text-base flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-emerald-400" /> Current Cart
          </h2>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
            {cart.reduce((a, b) => a + b.quantity, 0)} items
          </span>
        </div>

        <input
          type="text"
          placeholder="Customer Name (Credit Ledger)"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className={`w-full mt-2 px-3 py-1.5 text-xs rounded-xl border outline-none ${
            darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200'
          }`}
        />

        <div className="mt-2 space-y-2 max-h-52 overflow-y-auto pr-1">
          {cart.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              Cart is empty. Tap items to add.
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-800/30 border border-slate-800/50">
                <div className="flex-1 pr-2">
                  <h4 className="text-xs font-semibold line-clamp-1">{item.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Rs. {item.price} × {item.quantity}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <button onClick={() => updateCartQuantity(item.id, -1)} className="w-5 h-5 rounded bg-slate-700 flex items-center justify-center text-xs font-bold">-</button>
                  <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateCartQuantity(item.id, 1)} className="w-5 h-5 rounded bg-slate-700 flex items-center justify-center text-xs font-bold hover:bg-slate-600">+</button>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-400 ml-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/60 space-y-1.5 text-xs">
        <div className="flex justify-between text-slate-400">
          <span>Subtotal</span>
          <span>Rs. {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-bold text-sm text-emerald-400 pt-1 border-t border-slate-800/40">
          <span>TOTAL</span>
          <span>Rs. {total.toLocaleString()}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label className="text-[9px] text-slate-400 block">Cash Paid</label>
            <input
              type="number"
              placeholder={`Rs. ${total}`}
              value={cashTendered}
              onChange={(e) => setCashTendered(e.target.value)}
              className={`w-full px-2 py-1 text-xs font-bold rounded-xl border outline-none ${
                darkMode ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-slate-50 border-slate-300'
              }`}
            />
          </div>
          <div>
            <label className="text-[9px] text-slate-400 block">Change (ඉතිරි)</label>
            <div className="w-full px-2 py-1 text-xs font-bold text-amber-400 rounded-xl bg-amber-400/10 border border-amber-400/20 text-right">
              Rs. {changeDue.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-2">
          <button
            disabled={cart.length === 0}
            onClick={() => handleCheckout('Cash')}
            className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-md"
          >
            <Printer className="w-3.5 h-3.5" /> Cash Bill
          </button>
          <button
            disabled={cart.length === 0}
            onClick={() => handleCheckout('Credit')}
            className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-md"
          >
            <CreditCard className="w-3.5 h-3.5" /> Ledger Credit
          </button>
        </div>
      </div>
    </div>
  );
}