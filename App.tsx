
import React, { useState, useEffect, useMemo } from 'react';
import { 
  HashRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate,
  Navigate
} from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  User, 
  LogOut, 
  ChevronRight, 
  Check, 
  X,
  PlusCircle,
  Clock,
  MapPin,
  Phone,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from './firebase';
import { Dish, CartItem, Category } from './types';

// --- Helpers ---
const formatPrice = (price: number) => `${price} ₴`;

// --- Components ---

const Navbar = ({ cartCount, user }: { cartCount: number, user: FirebaseUser | null }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#121212]/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-black tracking-tighter text-[#39FF14] flex items-center gap-2">
        <ShoppingBag className="w-8 h-8" />
        HOME KITCHEN
      </Link>
      <div className="flex items-center gap-6">
        <Link to="/admin" className="text-white/60 hover:text-[#FF007F] transition-colors flex items-center gap-2">
          {user ? <LayoutDashboard size={20} /> : <User size={20} />}
          <span className="hidden md:inline">{user ? 'Панель' : 'Увійти'}</span>
        </Link>
        <button className="relative group p-2">
          <ShoppingCart className="text-white group-hover:text-[#39FF14] transition-colors" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#FF007F] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};

const Hero = () => (
  <section className="relative h-[80vh] flex items-center justify-center pt-20 overflow-hidden">
    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30 blur-sm"></div>
    <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-[#121212]/80"></div>
    
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative z-10 text-center px-4"
    >
      <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
        <span className="text-[#39FF14]">КІБЕР</span> <br className="md:hidden" /> СМАК
      </h1>
      <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
        Автентична українська кухня у сучасному виконанні. <br /> 
        Швидка доставка. Гарячі страви. Потужні емоції.
      </p>
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <button className="bg-[#39FF14] text-black px-8 py-4 rounded-none font-black text-lg cyber-glow-green hover:translate-x-1 hover:-translate-y-1 transition-transform">
          ЗАМОВИТИ ЗАРАЗ
        </button>
        <button className="border-2 border-[#FF007F] text-[#FF007F] px-8 py-4 rounded-none font-black text-lg hover:bg-[#FF007F] hover:text-white transition-all">
          ПЕРЕГЛЯНУТИ МЕНЮ
        </button>
      </div>
    </motion.div>
  </section>
);

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError('Помилка авторизації. Перевірте дані.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#121212]">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-[#1a1a1a] p-8 border border-white/10 shadow-2xl"
      >
        <h2 className="text-3xl font-black mb-8 text-[#FF007F] text-center tracking-tighter">ВХІД АДМІНІСТРАТОРА</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs uppercase text-white/40 mb-2 font-bold">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-white/10 p-3 text-white focus:border-[#39FF14] outline-none transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase text-white/40 mb-2 font-bold">Пароль</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-white/10 p-3 text-white focus:border-[#39FF14] outline-none transition-colors"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#39FF14] text-black font-black py-4 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'ЗАВАНТАЖЕННЯ...' : 'УВІЙТИ В ПАНЕЛЬ'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const AdminPanel = ({ dishes }: { dishes: Dish[] }) => {
  const [newDish, setNewDish] = useState({ name: '', description: '', price: '', category: 'Основні' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return alert('Будь ласка, оберіть фото страви');
    
    setUploading(true);
    try {
      const storageRef = ref(storage, `dishes/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const imageURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'dishes'), {
        ...newDish,
        price: Number(newDish.price),
        imageURL,
        isAvailable: true,
        createdAt: new Date().toISOString()
      });

      setNewDish({ name: '', description: '', price: '', category: 'Основні' });
      setImageFile(null);
      alert('Страву додано успішно!');
    } catch (err) {
      console.error(err);
      alert('Помилка при додаванні страви');
    } finally {
      setUploading(false);
    }
  };

  const deleteDish = async (id: string) => {
    if (confirm('Видалити цю страву?')) {
      await deleteDoc(doc(db, 'dishes', id));
    }
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'dishes', id), { isAvailable: !current });
  };

  return (
    <div className="pt-24 px-6 pb-20 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black text-[#39FF14] tracking-tighter">КЕРУВАННЯ МЕНЮ</h1>
        <button onClick={() => signOut(auth)} className="text-white/40 hover:text-white flex items-center gap-2">
          <LogOut size={20} /> Вийти
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <div className="bg-[#1a1a1a] p-8 border border-white/10 sticky top-24">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
              <PlusCircle className="text-[#FF007F]" /> ДОДАТИ СТРАВУ
            </h2>
            <form onSubmit={handleAddDish} className="space-y-4">
              <input 
                type="text" placeholder="Назва страви" required
                value={newDish.name} onChange={e => setNewDish({...newDish, name: e.target.value})}
                className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-[#39FF14]"
              />
              <textarea 
                placeholder="Опис" required
                value={newDish.description} onChange={e => setNewDish({...newDish, description: e.target.value})}
                className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-[#39FF14] h-24"
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" placeholder="Ціна (₴)" required
                  value={newDish.price} onChange={e => setNewDish({...newDish, price: e.target.value})}
                  className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-[#39FF14]"
                />
                <select 
                  value={newDish.category} onChange={e => setNewDish({...newDish, category: e.target.value as Category})}
                  className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-[#39FF14]"
                >
                  <option value="Основні">Основні</option>
                  <option value="Закуски">Закуски</option>
                  <option value="Напої">Напої</option>
                  <option value="Десерти">Десерти</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-white/40 mb-1 uppercase font-bold">Фото страви</label>
                <input 
                  type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-white/40 file:bg-[#FF007F] file:border-none file:text-white file:px-4 file:py-2 file:mr-4 file:cursor-pointer"
                />
              </div>
              <button 
                type="submit" disabled={uploading}
                className="w-full bg-[#39FF14] text-black font-black py-4 mt-4 hover:opacity-90 disabled:opacity-50"
              >
                {uploading ? 'ЗАВАНТАЖЕННЯ...' : 'ЗБЕРЕГТИ СТРАВУ'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-black mb-6">АКТИВНЕ МЕНЮ ({dishes.length})</h2>
          {dishes.map(dish => (
            <div key={dish.id} className="bg-[#1a1a1a] border border-white/10 p-4 flex items-center gap-4 group">
              <img src={dish.imageURL} alt={dish.name} className="w-20 h-20 object-cover border border-white/10" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{dish.name}</h3>
                  <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/40">{dish.category}</span>
                </div>
                <p className="text-sm text-white/40 line-clamp-1">{dish.description}</p>
                <p className="text-[#39FF14] font-bold text-sm">{formatPrice(dish.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleAvailability(dish.id, dish.isAvailable)}
                  className={`p-2 border ${dish.isAvailable ? 'border-[#39FF14] text-[#39FF14]' : 'border-white/10 text-white/20'} hover:bg-white/5 transition-colors`}
                  title={dish.isAvailable ? "В наявності" : "Немає в наявності"}
                >
                  {dish.isAvailable ? <Check size={18} /> : <X size={18} />}
                </button>
                <button 
                  onClick={() => deleteDish(dish.id)}
                  className="p-2 border border-[#FF007F] text-[#FF007F] hover:bg-[#FF007F] hover:text-white transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CartSidebar = ({ 
  cart, 
  setCart, 
  isOpen, 
  setIsOpen 
}: { 
  cart: CartItem[], 
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
  isOpen: boolean,
  setIsOpen: (open: boolean) => void
}) => {
  const [isCheckout, setIsCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '', address: '' });

  const total = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('ORDER RECEIVED:', { ...checkoutForm, items: cart, total });
    alert('Дякуємо! Ваше замовлення прийнято в обробку. Наш менеджер зв\'яжеться з вами найближчим часом.');
    setCart([]);
    setIsCheckout(false);
    setIsOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
          />
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#121212] border-l border-white/10 z-[70] flex flex-col"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-black text-[#39FF14] tracking-tighter uppercase">КОШИК</h2>
          <button onClick={() => setIsOpen(false)} className="p-2 text-white/40 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <ShoppingBag size={80} />
              <p className="mt-4 font-bold">Кошик порожній</p>
            </div>
          ) : isCheckout ? (
            <form onSubmit={handleCheckout} className="space-y-6">
              <h3 className="text-[#FF007F] font-black text-xl mb-4">ОФОРМЛЕННЯ</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] text-white/40 uppercase mb-1">Ім'я</label>
                  <input 
                    type="text" required
                    className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-[#39FF14]"
                    value={checkoutForm.name} onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/40 uppercase mb-1">Телефон</label>
                  <input 
                    type="tel" required placeholder="+380..."
                    className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-[#39FF14]"
                    value={checkoutForm.phone} onChange={e => setCheckoutForm({...checkoutForm, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/40 uppercase mb-1">Адреса доставки</label>
                  <textarea 
                    required
                    className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-[#39FF14] h-24"
                    value={checkoutForm.address} onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})}
                  />
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <div className="flex justify-between mb-4">
                  <span className="text-white/60">До сплати:</span>
                  <span className="text-[#39FF14] font-black text-xl">{formatPrice(total)}</span>
                </div>
                <button type="submit" className="w-full bg-[#39FF14] text-black font-black py-4 cyber-glow-green">
                  ПІДТВЕРДИТИ ЗАМОВЛЕННЯ
                </button>
                <button type="button" onClick={() => setIsCheckout(false)} className="w-full text-white/40 py-4 text-xs font-bold uppercase mt-2">
                  Повернутись до кошика
                </button>
              </div>
            </form>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4 group">
                <img src={item.imageURL} alt={item.name} className="w-20 h-20 object-cover border border-white/10" />
                <div className="flex-1">
                  <h3 className="font-bold text-sm">{item.name}</h3>
                  <p className="text-[#39FF14] font-bold text-xs">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 border border-white/10 flex items-center justify-center hover:border-[#FF007F] text-xs">-</button>
                    <span className="text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 border border-white/10 flex items-center justify-center hover:border-[#39FF14] text-xs">+</button>
                  </div>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-white/20 hover:text-[#FF007F] transition-colors p-2">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && !isCheckout && (
          <div className="p-6 border-t border-white/10 bg-black/20">
            <div className="flex justify-between items-center mb-6">
              <span className="text-white/60 font-medium">Разом:</span>
              <span className="text-[#39FF14] text-2xl font-black">{formatPrice(total)}</span>
            </div>
            <button 
              onClick={() => setIsCheckout(true)}
              className="w-full bg-[#39FF14] text-black font-black py-4 flex items-center justify-center gap-2 cyber-glow-green"
            >
              ОФОРМИТИ ЗАМОВЛЕННЯ <ChevronRight size={20} />
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
};

const MenuGrid = ({ dishes, addToCart }: { dishes: Dish[], addToCart: (dish: Dish) => void }) => {
  const [activeCategory, setActiveCategory] = useState<string>('Усі');
  const categories = ['Усі', 'Основні', 'Закуски', 'Напої', 'Десерти'];

  const filtered = dishes.filter(d => (activeCategory === 'Усі' || d.category === activeCategory) && d.isAvailable);

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <h2 className="text-4xl font-black tracking-tighter">
          НАШЕ <span className="text-[#FF007F]">МЕНЮ</span>
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 border text-xs font-bold uppercase transition-all whitespace-nowrap ${
                activeCategory === cat ? 'bg-[#39FF14] text-black border-[#39FF14] cyber-glow-green' : 'border-white/10 text-white/40 hover:border-white/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(dish => (
          <motion.div 
            layout
            key={dish.id} 
            className="group bg-[#1a1a1a] border border-white/5 hover:border-[#39FF14]/50 transition-all duration-300"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img 
                src={dish.imageURL} 
                alt={dish.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
              />
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 text-[#39FF14] font-black text-sm border border-white/10">
                {formatPrice(dish.price)}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 group-hover:text-[#39FF14] transition-colors">{dish.name}</h3>
              <p className="text-white/40 text-sm mb-6 line-clamp-2 h-10">{dish.description}</p>
              <button 
                onClick={() => addToCart(dish)}
                className="w-full border-2 border-[#39FF14] text-[#39FF14] py-3 font-black text-sm uppercase flex items-center justify-center gap-2 group-hover:bg-[#39FF14] group-hover:text-black transition-all"
              >
                <Plus size={18} /> До кошика
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const InfoSection = () => (
  <section className="py-20 bg-black/40 border-y border-white/5 px-6">
    <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-[#39FF14]/10 rounded-full flex items-center justify-center text-[#39FF14] mb-6">
          <Clock size={32} />
        </div>
        <h4 className="font-black text-lg mb-2">ШВИДКО</h4>
        <p className="text-white/40 text-sm italic">Доставка до 45 хвилин у будь-яку точку міста</p>
      </div>
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-[#FF007F]/10 rounded-full flex items-center justify-center text-[#FF007F] mb-6">
          <MapPin size={32} />
        </div>
        <h4 className="font-black text-lg mb-2">ЛОКАЛЬНО</h4>
        <p className="text-white/40 text-sm italic">Використовуємо лише фермерські продукти України</p>
      </div>
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mb-6">
          <Phone size={32} />
        </div>
        <h4 className="font-black text-lg mb-2">ПІДТРИМКА</h4>
        <p className="text-white/40 text-sm italic">Цілодобовий зв'язок з нашими кібер-кур'єрами</p>
      </div>
    </div>
  </section>
);

// --- Main App ---

export default function App() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    // Sync Auth State
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => setUser(u));
    
    // Sync Menu from Firestore
    const q = query(collection(db, 'dishes'));
    const unsubscribeDishes = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Dish[];
      setDishes(data);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeDishes();
    };
  }, []);

  const addToCart = (dish: Dish) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === dish.id);
      if (existing) {
        return prev.map(item => item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...dish, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Router>
      <div className="min-h-screen">
        <Navbar cartCount={totalCartItems} user={user} />
        
        <Routes>
          <Route path="/" element={
            <main>
              <Hero />
              <MenuGrid dishes={dishes} addToCart={addToCart} />
              <InfoSection />
              <footer className="py-20 px-6 border-t border-white/10 text-center">
                <div className="text-[#39FF14] font-black text-4xl tracking-tighter mb-4 italic">HOME KITCHEN</div>
                <p className="text-white/20 text-xs tracking-widest uppercase">© 2025 Домашня Кухня. Made for Cyber-Ukraine.</p>
              </footer>
            </main>
          } />
          
          <Route path="/admin" element={
            user ? <AdminPanel dishes={dishes} /> : <AdminLogin />
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <CartSidebar 
          cart={cart} 
          setCart={setCart} 
          isOpen={isCartOpen} 
          setIsOpen={setIsCartOpen} 
        />
        
        {/* Floating Cart Button for Mobile */}
        {totalCartItems > 0 && !isCartOpen && (
          <motion.button 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-8 right-8 z-40 bg-[#39FF14] text-black p-4 rounded-full cyber-glow-green shadow-2xl md:hidden"
          >
            <ShoppingCart size={24} />
            <span className="absolute -top-1 -right-1 bg-[#FF007F] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {totalCartItems}
            </span>
          </motion.button>
        )}
      </div>
    </Router>
  );
}
