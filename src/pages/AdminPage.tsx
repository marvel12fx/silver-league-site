import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { LogoMark } from '@/components/Logo';
import { formatPrice } from '@/lib/utils';
import { Lock, AlertCircle, LogOut, LayoutDashboard, Package, ShoppingBag, FolderOpen, Menu, X, Upload, Plus, Trash2, MessageCircle, TrendingUp, Clock, CheckCircle, Home, Info, Sparkles, Quote, Phone, Briefcase } from 'lucide-react';
import { Link } from '@/lib/router';
import { AdminHomepage, AdminAbout, AdminServices, AdminTestimonials, AdminContact, AdminPortfolio } from './AdminContent';

const WHATSAPP_NUMBER = '2349010480020';
const ADMIN_EMAIL = 'marveldital@gmail.com';

export function AdminPage() {
  const [session, useStateSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      if (s && s.user?.email !== ADMIN_EMAIL) {
        supabase.auth.signOut();
        setAccessDenied(true);
      }
      useStateSession(s);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s && s.user?.email !== ADMIN_EMAIL) {
        setAccessDenied(true);
      } else {
        setAccessDenied(false);
      }
      useStateSession(s);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setNeedsSetup(false);
    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      setAuthError('This account does not have admin access.');
      setAuthLoading(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes('invalid login') || error.message.toLowerCase().includes('not confirmed')) {
        setNeedsSetup(true);
      }
      setAuthError(error.message);
    }
    setAuthLoading(false);
  };

  const handleCreateAccount = async () => {
    setAuthLoading(true);
    setAuthError(null);
    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      setAuthError('This account does not have admin access.');
      setAuthLoading(false);
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      setAuthLoading(false);
      return;
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setAuthError(error.message);
      setAuthLoading(false);
      return;
    }
    if (data.session) {
      useStateSession(data.session);
    } else {
      setAuthError('Account created. Please sign in with your new password.');
      setNeedsSetup(false);
    }
    setAuthLoading(false);
  };

  const handleLogout = () => supabase.auth.signOut();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-burgundy-dark">
        <div className="w-12 h-12 border-2 border-cream border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-burgundy-dark flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <LogoMark color="#F7F3EF" className="mx-auto" />
            <p className="text-[10px] tracking-wider-luxe uppercase text-silver mt-4">Admin Portal</p>
          </div>
          {accessDenied && (
            <div className="bg-red-900/40 text-cream text-sm p-3 mb-4 flex items-center gap-2 border border-red-700/50">
              <AlertCircle size={16} /> This account does not have admin access.
            </div>
          )}
          <form onSubmit={handleLogin} className="bg-cream p-8 space-y-4">
            <div>
              <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-sm text-burgundy-dark border border-gray-300 outline-none focus:border-burgundy transition-colors bg-white"
                placeholder="Enter your admin email"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-sm text-burgundy-dark border border-gray-300 outline-none focus:border-burgundy transition-colors bg-white"
              />
            </div>
            {authError && (
              <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-3">
                <AlertCircle size={16} />
                {authError}
              </div>
            )}
            {needsSetup && (
              <div className="bg-burgundy/10 border border-burgundy/20 p-3 text-xs text-burgundy-dark space-y-2">
                <p>This is your first time signing in. Click below to set your admin password.</p>
                <button
                  onClick={handleCreateAccount}
                  disabled={authLoading}
                  className="w-full bg-burgundy text-cream py-3 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors disabled:opacity-50"
                >
                  {authLoading ? 'Creating Account...' : 'Set Password & Create Account'}
                </button>
              </div>
            )}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-burgundy text-cream py-4 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors disabled:opacity-50"
            >
              {authLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-silver text-xs mt-6">
            Authorised personnel only. SILVER LEAGUE admin access.
          </p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Overview' },
    { key: 'products', label: 'Products', icon: Package, desc: 'Manage your items' },
    { key: 'orders', label: 'Orders', icon: ShoppingBag, desc: 'View and update orders' },
    { key: 'collections', label: 'Collections', icon: FolderOpen, desc: 'Organise your collections' },
    { key: 'homepage', label: 'Homepage', icon: Home, desc: 'Edit homepage hero' },
    { key: 'about', label: 'About', icon: Info, desc: 'Edit brand story' },
    { key: 'services', label: 'Services', icon: Sparkles, desc: 'Add and edit services' },
    { key: 'testimonials', label: 'Testimonials', icon: Quote, desc: 'Customer reviews' },
    { key: 'contact', label: 'Contact & Socials', icon: Phone, desc: 'Email, phone, socials' },
    { key: 'portfolio', label: 'Portfolio', icon: Briefcase, desc: 'Project details' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-burgundy-dark text-cream z-40 transition-transform duration-300 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-burgundy-light/30">
          <Link to="/" className="block">
            <LogoMark color="#F7F3EF" />
          </Link>
          <p className="text-[10px] tracking-wider-luxe uppercase text-silver mt-3">Admin Dashboard</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-start gap-3 px-4 py-3 text-sm transition-colors text-left ${
                  activeTab === item.key
                    ? 'bg-burgundy-light/30 text-cream'
                    : 'text-cream/60 hover:text-cream hover:bg-burgundy-light/10'
                }`}
              >
                <Icon size={18} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p>{item.label}</p>
                  <p className="text-[10px] text-cream/40">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-burgundy-light/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-cream/60 hover:text-cream transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-30" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <button className="lg:hidden text-burgundy-dark" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <h1 className="font-display text-xl text-burgundy-dark capitalize">
            {menuItems.find((m) => m.key === activeTab)?.label}
          </h1>
          <div className="text-xs text-silver-dark hidden md:block">
            {session.user.email}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-8">
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'products' && <AdminProducts />}
          {activeTab === 'orders' && <AdminOrders />}
          {activeTab === 'collections' && <AdminCollections />}
          {activeTab === 'homepage' && <AdminHomepage />}
          {activeTab === 'about' && <AdminAbout />}
          {activeTab === 'services' && <AdminServices />}
          {activeTab === 'testimonials' && <AdminTestimonials />}
          {activeTab === 'contact' && <AdminContact />}
          {activeTab === 'portfolio' && <AdminPortfolio />}
        </div>
      </div>
    </div>
  );
}

// === Dashboard ===
function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [{ count: productCount }, { data: orders }] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
      ]);
      const orderList = orders || [];
      const revenue = orderList.reduce((sum, o) => sum + Number(o.total), 0);
      const pending = orderList.filter((o) => o.status === 'pending').length;
      setStats({
        products: productCount || 0,
        orders: orderList.length,
        revenue,
        pending,
      });
      setRecentOrders(orderList);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-silver-dark text-sm">Loading...</div>;

  const cards = [
    { label: 'Total Products', value: String(stats.products), icon: Package },
    { label: 'Recent Orders', value: String(stats.orders), icon: ShoppingBag },
    { label: 'Revenue (recent)', value: formatPrice(stats.revenue), icon: TrendingUp },
    { label: 'Pending Orders', value: String(stats.pending), icon: Clock },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] tracking-luxe uppercase text-silver-dark">{card.label}</span>
                <Icon size={18} className="text-burgundy" />
              </div>
              <p className="font-display text-2xl text-burgundy-dark">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-display text-xl text-burgundy-dark">Recent Orders</h2>
        </div>
        {recentOrders.length === 0 ? (
          <p className="p-6 text-sm text-silver-dark">No orders yet.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-display text-sm text-burgundy-dark">{order.order_number}</p>
                  <p className="text-xs text-silver-dark">{order.customer_name}{order.customer_phone ? ` · ${order.customer_phone}` : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-burgundy-dark">{formatPrice(Number(order.total))}</p>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// === Products ===
function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    const [{ data: prods }, { data: cats }, { data: cols }] = await Promise.all([
      supabase.from('products').select('*, categories(*), collections(*), product_sizes(*), product_colours(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
      supabase.from('collections').select('*').order('name'),
    ]);
    setProducts(prods || []);
    setCategories(cats || []);
    setCollections(cols || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This will remove it from your website. This cannot be undone.')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchData();
  };

  if (showForm) {
    return (
      <ProductForm
        product={editing}
        categories={categories}
        collections={collections}
        onClose={() => { setShowForm(false); setEditing(null); }}
        onSave={fetchData}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-silver-dark">{products.length} products in your store</p>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 bg-burgundy text-cream px-6 py-3 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors"
        >
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {loading ? (
        <p className="text-silver-dark text-sm">Loading...</p>
      ) : products.length === 0 ? (
        <div className="bg-white border border-gray-100 p-12 text-center">
          <Package size={32} className="text-silver mx-auto mb-4" />
          <p className="text-silver-dark text-sm mb-4">No products yet. Add your first product to get started.</p>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="inline-flex items-center gap-2 bg-burgundy text-cream px-6 py-3 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors"
          >
            <Plus size={16} /> Add New Product
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream text-[10px] tracking-luxe uppercase text-silver-dark">
              <tr>
                <th className="text-left p-4">Product</th>
                <th className="text-left p-4 hidden md:table-cell">Category</th>
                <th className="text-right p-4">Price</th>
                <th className="text-center p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-cream/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0] || ''} alt={p.name} className="w-12 h-16 object-cover bg-cream" />
                      <div>
                        <p className="font-display text-burgundy-dark">{p.name}</p>
                        <div className="flex gap-1 mt-1">
                          {p.is_new && <span className="text-[9px] bg-burgundy text-cream px-2 py-0.5 tracking-luxe uppercase">New</span>}
                          {p.is_featured && <span className="text-[9px] bg-cream-dark text-burgundy px-2 py-0.5 tracking-luxe uppercase">Featured</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-silver-dark">{p.categories?.name || '—'}</td>
                  <td className="p-4 text-right text-burgundy-dark">{formatPrice(Number(p.price))}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => { setEditing(p); setShowForm(true); }}
                        className="text-xs text-burgundy hover:underline"
                      >
                        Edit
                      </button>
                      <span className="text-silver">|</span>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProductForm({ product, categories, collections, onClose, onSave }: {
  product: any;
  categories: any[];
  collections: any[];
  onClose: () => void;
  onSave: () => void;
}) {
  const existingSizes: { size: string; stock: number }[] = product?.product_sizes?.map((ps: any) => ({ size: ps.size, stock: ps.stock })) || [];
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price ? String(product.price) : '',
    compare_at_price: product?.compare_at_price ? String(product.compare_at_price) : '',
    sku: product?.sku || '',
    category_id: product?.category_id || '',
    collection_id: product?.collection_id || '',
    images: (product?.images || []) as string[],
    is_new: product?.is_new || false,
    is_featured: product?.is_featured || false,
  });
  const [sizeInput, setSizeInput] = useState('');
  const [sizes, setSizes] = useState<{ size: string; stock: number }[]>(existingSizes);
  const [colourInput, setColourInput] = useState('');
  const [colours, setColours] = useState<{ id?: string; name: string; images: string[] }[]>(
    (product?.product_colours || []).map((c: any) => ({ id: c.id, name: c.name, images: c.images || [] }))
  );
  const [uploadingColour, setUploadingColour] = useState<number | null>(null);
  const colourFileRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadImages = async (files: FileList) => {
    setUploading(true);
    setError(null);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);
      if (uploadError) {
        setError(`Failed to upload ${file.name}: ${uploadError.message}`);
        continue;
      }
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      uploaded.push(urlData.publicUrl);
    }
    setForm((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const addSize = () => {
    const trimmed = sizeInput.trim();
    if (!trimmed) return;
    if (sizes.some((s) => s.size.toLowerCase() === trimmed.toLowerCase())) {
      setSizeInput('');
      return;
    }
    setSizes((prev) => [...prev, { size: trimmed, stock: 0 }]);
    setSizeInput('');
  };

  const removeSize = (index: number) => {
    setSizes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateStock = (index: number, stock: number) => {
    setSizes((prev) => prev.map((s, i) => (i === index ? { ...s, stock: Math.max(0, stock) } : s)));
  };

  const addColour = () => {
    const trimmed = colourInput.trim();
    if (!trimmed) return;
    if (colours.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setColourInput('');
      return;
    }
    setColours((prev) => [...prev, { name: trimmed, images: [] }]);
    setColourInput('');
  };

  const removeColour = (index: number) => {
    setColours((prev) => prev.filter((_, i) => i !== index));
  };

  const renameColour = (index: number, name: string) => {
    setColours((prev) => prev.map((c, i) => (i === index ? { ...c, name } : c)));
  };

  const handleUploadColourImages = async (index: number, files: FileList) => {
    setUploadingColour(index);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);
      if (uploadError) continue;
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      uploaded.push(urlData.publicUrl);
    }
    setColours((prev) => prev.map((c, i) => (i === index ? { ...c, images: [...c.images, ...uploaded] } : c)));
    setUploadingColour(null);
  };

  const removeColourImage = (colourIndex: number, imageIndex: number) => {
    setColours((prev) => prev.map((c, i) => (i === colourIndex ? { ...c, images: c.images.filter((_, j) => j !== imageIndex) } : c)));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    if (!form.name.trim()) {
      setError('Please enter a product name.');
      setSaving(false);
      return;
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      setError('Please enter a valid price.');
      setSaving(false);
      return;
    }

    const slug = (product?.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    const sizeStrings = sizes.map((s) => s.size);

    const payload: any = {
      name: form.name,
      slug,
      description: form.description,
      price: parseFloat(form.price) || 0,
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      sku: form.sku,
      category_id: form.category_id || null,
      collection_id: form.collection_id || null,
      images: form.images,
      sizes: sizeStrings,
      is_new: form.is_new,
      is_featured: form.is_featured,
    };

    let productId = product?.id;

    if (product) {
      const { error: updateError } = await supabase.from('products').update(payload).eq('id', product.id);
      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
    } else {
      const { data: newProduct, error: insertError } = await supabase.from('products').insert(payload).select().single();
      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }
      productId = newProduct.id;
    }

    // Sync product_sizes
    if (productId) {
      await supabase.from('product_sizes').delete().eq('product_id', productId);
      if (sizes.length > 0) {
        const sizeRecords = sizes.map((s) => ({
          product_id: productId,
          size: s.size,
          stock: s.stock,
        }));
        await supabase.from('product_sizes').insert(sizeRecords);
      }

      // Sync product_colours — delete existing, insert fresh
      await supabase.from('product_colours').delete().eq('product_id', productId);
      if (colours.length > 0) {
        const colourRecords = colours.map((c) => ({
          product_id: productId,
          name: c.name,
          images: c.images,
        }));
        await supabase.from('product_colours').insert(colourRecords);
      }
    }

    setSaving(false);
    onSave();
    onClose();
  };

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-2xl text-burgundy-dark">{product ? 'Edit Product' : 'Add New Product'}</h2>
        <button onClick={onClose} className="text-silver-dark hover:text-burgundy transition-colors">
          <X size={22} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 mb-4 flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Product Name */}
        <AdminInput label="Product Name" value={form.name} onChange={(v) => update('name', v)} placeholder="e.g. Silver Silk Dress" />

        {/* Description */}
        <AdminTextarea label="Description" value={form.description} onChange={(v) => update('description', v)} rows={4} placeholder="Describe the product — fabric, fit, style details..." />

        {/* Price */}
        <div className="grid grid-cols-2 gap-4">
          <AdminInput label="Price (₦)" value={form.price} onChange={(v) => update('price', v)} type="number" placeholder="e.g. 45000" />
          <AdminInput label="Original Price (₦) — optional" value={form.compare_at_price} onChange={(v) => update('compare_at_price', v)} type="number" placeholder="e.g. 60000" />
        </div>
        {form.compare_at_price && parseFloat(form.compare_at_price) > 0 && (
          <p className="text-xs text-silver-dark -mt-2">This shows a strikethrough original price next to the selling price.</p>
        )}

        {/* SKU */}
        <AdminInput label="SKU (Product Code) — optional" value={form.sku} onChange={(v) => update('sku', v)} placeholder="e.g. SL-DRESS-001" />

        {/* Category & Collection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Category</label>
            <select
              value={form.category_id}
              onChange={(e) => update('category_id', e.target.value)}
              className="w-full border border-gray-300 px-4 py-3 text-sm text-burgundy-dark outline-none focus:border-burgundy bg-white"
            >
              <option value="">No category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Collection</label>
            <select
              value={form.collection_id}
              onChange={(e) => update('collection_id', e.target.value)}
              className="w-full border border-gray-300 px-4 py-3 text-sm text-burgundy-dark outline-none focus:border-burgundy bg-white"
            >
              <option value="">No collection</option>
              {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Product Photos</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer hover:border-burgundy transition-colors"
          >
            <Upload size={24} className="text-silver mx-auto mb-2" />
            <p className="text-sm text-burgundy-dark">{uploading ? 'Uploading...' : 'Click to upload photos'}</p>
            <p className="text-xs text-silver-dark mt-1">PNG or JPG files</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={(e) => e.target.files && handleUploadImages(e.target.files)}
            className="hidden"
          />
          {form.images.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mt-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img} alt={`Product photo ${i + 1}`} className="w-full h-24 object-cover border border-gray-200" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-burgundy text-cream w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colours */}
        <div>
          <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Colours & Photos</label>
          <p className="text-xs text-silver-dark mb-3">Add colour options for this product. Upload photos for each colour so customers see the right images when they pick a colour.</p>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={colourInput}
              onChange={(e) => setColourInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addColour(); } }}
              placeholder="Type a colour name (e.g. Burgundy)"
              className="flex-1 border border-gray-300 px-4 py-2 text-sm text-burgundy-dark outline-none focus:border-burgundy"
            />
            <button
              onClick={addColour}
              type="button"
              className="bg-burgundy text-cream px-4 py-2 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors"
            >
              Add
            </button>
          </div>
          {colours.map((colour, ci) => (
            <div key={ci} className="bg-cream p-4 mb-3">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={colour.name}
                  onChange={(e) => renameColour(ci, e.target.value)}
                  className="flex-1 border border-gray-300 px-3 py-2 text-sm font-display text-burgundy-dark outline-none focus:border-burgundy"
                  placeholder="Colour name"
                />
                <button
                  onClick={() => removeColour(ci)}
                  type="button"
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => colourFileRefs.current[ci]?.click()}
                  type="button"
                  className="inline-flex items-center gap-1 text-xs text-burgundy hover:underline"
                >
                  <Upload size={14} /> Upload photos for {colour.name || 'this colour'}
                </button>
                {uploadingColour === ci && <span className="text-xs text-silver-dark">Uploading...</span>}
              </div>
              <input
                ref={(el) => { colourFileRefs.current[ci] = el; }}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={(e) => e.target.files && handleUploadColourImages(ci, e.target.files)}
                className="hidden"
              />
              {colour.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {colour.images.map((img, ii) => (
                    <div key={ii} className="relative group">
                      <img src={img} alt={`${colour.name} ${ii + 1}`} className="w-full h-20 object-cover border border-gray-200" />
                      <button
                        onClick={() => removeColourImage(ci, ii)}
                        type="button"
                        className="absolute top-0.5 right-0.5 bg-burgundy text-cream w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {colour.images.length === 0 && (
                <p className="text-xs text-silver-dark">No photos yet for this colour. Customers will see the main product photos.</p>
              )}
            </div>
          ))}
          {colours.length === 0 && (
            <p className="text-xs text-silver-dark">No colours added yet. Add colours if this product comes in multiple colour options.</p>
          )}
        </div>

        {/* Sizes & Stock */}
        <div>
          <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Sizes & Stock</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSize(); } }}
              placeholder="Type a size (e.g. S, M, L, XL)"
              className="flex-1 border border-gray-300 px-4 py-2 text-sm text-burgundy-dark outline-none focus:border-burgundy"
            />
            <button
              onClick={addSize}
              type="button"
              className="bg-burgundy text-cream px-4 py-2 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors"
            >
              Add
            </button>
          </div>
          {sizes.length > 0 && (
            <div className="space-y-2">
              {sizes.map((s, i) => (
                <div key={i} className="flex items-center gap-3 bg-cream p-3">
                  <span className="font-display text-sm text-burgundy-dark min-w-[2rem]">{s.size}</span>
                  <label className="text-xs text-silver-dark">Stock:</label>
                  <input
                    type="number"
                    min={0}
                    value={s.stock}
                    onChange={(e) => updateStock(i, parseInt(e.target.value) || 0)}
                    className="w-20 border border-gray-300 px-2 py-1 text-sm text-burgundy-dark outline-none focus:border-burgundy"
                  />
                  <button
                    onClick={() => removeSize(i)}
                    type="button"
                    className="ml-auto text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {sizes.length === 0 && (
            <p className="text-xs text-silver-dark">No sizes added yet. Add sizes so customers can pick their size.</p>
          )}
        </div>

        {/* Toggles */}
        <div className="flex gap-6 pt-2">
          <label className="flex items-center gap-2 text-sm text-burgundy-dark cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_new}
              onChange={(e) => update('is_new', e.target.checked)}
              className="w-4 h-4 accent-burgundy"
            />
            New Arrival
          </label>
          <label className="flex items-center gap-2 text-sm text-burgundy-dark cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => update('is_featured', e.target.checked)}
              className="w-4 h-4 accent-burgundy"
            />
            Featured
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-burgundy-dark py-3 text-xs tracking-luxe uppercase hover:bg-cream transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-burgundy text-cream py-3 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

// === Orders ===
function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    fetchOrders();
    if (selectedOrder?.id === id) {
      setSelectedOrder({ ...selectedOrder, status });
    }
  };

  const contactCustomerWhatsApp = (order: any) => {
    const msg = `Hello ${order.customer_name}, this is SILVER LEAGUE regarding your order ${order.order_number}.`;
    window.open(`https://wa.me/${order.customer_phone?.replace(/[^0-9]/g, '') || WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (selectedOrder) {
    return (
      <div className="max-w-2xl mx-auto">
        <button onClick={() => setSelectedOrder(null)} className="text-sm text-burgundy hover:underline mb-6">
          ← Back to Orders
        </button>
        <div className="bg-white border border-gray-100 p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="font-display text-2xl text-burgundy-dark">{selectedOrder.order_number}</p>
              <p className="text-sm text-silver-dark">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
            </div>
            <OrderStatusBadge status={selectedOrder.status} />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-100">
            <div>
              <p className="text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Customer</p>
              <p className="text-sm text-burgundy-dark">{selectedOrder.customer_name}</p>
              {selectedOrder.customer_phone && <p className="text-sm text-silver-dark">{selectedOrder.customer_phone}</p>}
              <button
                onClick={() => contactCustomerWhatsApp(selectedOrder)}
                className="inline-flex items-center gap-2 text-xs text-burgundy hover:underline mt-2"
              >
                <MessageCircle size={14} /> Contact on WhatsApp
              </button>
            </div>
            <div>
              <p className="text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Delivery Address</p>
              <p className="text-sm text-burgundy-dark">{selectedOrder.shipping_address?.line1}</p>
              {selectedOrder.shipping_address?.line2 && <p className="text-sm text-silver-dark">{selectedOrder.shipping_address.line2}</p>}
              <p className="text-sm text-silver-dark">
                {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}
              </p>
              <p className="text-sm text-silver-dark">{selectedOrder.shipping_address?.country}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[10px] tracking-luxe uppercase text-silver-dark mb-3">Items</p>
            <div className="space-y-3">
              {(selectedOrder.order_items || []).map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex gap-3">
                    {item.product_image && <img src={item.product_image} alt="" className="w-12 h-16 object-cover bg-cream" />}
                    <div>
                      <p className="text-burgundy-dark">{item.product_name}</p>
                      <p className="text-xs text-silver-dark">{item.colour && <>Colour: {item.colour} · </>}Size: {item.size} · Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-burgundy-dark">{formatPrice(Number(item.price * item.quantity))}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-gray-100 mb-6">
            <div className="flex justify-between text-sm text-silver-dark">
              <span>Subtotal</span><span>{formatPrice(Number(selectedOrder.subtotal))}</span>
            </div>
            <div className="flex justify-between text-sm text-silver-dark">
              <span>Shipping</span><span>{formatPrice(Number(selectedOrder.shipping_cost))}</span>
            </div>
            <div className="flex justify-between font-display text-lg text-burgundy-dark">
              <span>Total</span><span>{formatPrice(Number(selectedOrder.total))}</span>
            </div>
          </div>

          {selectedOrder.notes && (
            <div className="mb-6 p-4 bg-cream">
              <p className="text-[10px] tracking-luxe uppercase text-silver-dark mb-1">Order Notes</p>
              <p className="text-sm text-burgundy-dark">{selectedOrder.notes}</p>
            </div>
          )}

          <div>
            <p className="text-[10px] tracking-luxe uppercase text-silver-dark mb-3">Update Order Status</p>
            <div className="flex flex-wrap gap-2">
              {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(selectedOrder.id, status)}
                  className={`px-4 py-2 text-xs tracking-luxe uppercase border transition-colors ${
                    selectedOrder.status === status
                      ? 'bg-burgundy text-cream border-burgundy'
                      : 'border-gray-300 text-burgundy-dark hover:border-burgundy'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-silver-dark mb-6">{orders.length} orders</p>
      {loading ? (
        <p className="text-silver-dark text-sm">Loading...</p>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-gray-100 p-12 text-center">
          <ShoppingBag size={32} className="text-silver mx-auto mb-4" />
          <p className="text-silver-dark text-sm">No orders yet. When customers place orders, they will appear here.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream text-[10px] tracking-luxe uppercase text-silver-dark">
              <tr>
                <th className="text-left p-4">Order</th>
                <th className="text-left p-4 hidden md:table-cell">Customer</th>
                <th className="text-left p-4 hidden lg:table-cell">Date</th>
                <th className="text-right p-4">Total</th>
                <th className="text-center p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className="hover:bg-cream/50 transition-colors cursor-pointer"
                >
                  <td className="p-4 font-display text-burgundy-dark">{o.order_number}</td>
                  <td className="p-4 hidden md:table-cell text-silver-dark">{o.customer_name}</td>
                  <td className="p-4 hidden lg:table-cell text-silver-dark">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right text-burgundy-dark">{formatPrice(Number(o.total))}</td>
                  <td className="p-4 text-center"><OrderStatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// === Collections ===
function AdminCollections() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const fetchCollections = async () => {
    const { data } = await supabase.from('collections').select('*').order('created_at', { ascending: false });
    setCollections(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCollections(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection? Products in it will remain but will no longer be grouped under this collection.')) return;
    await supabase.from('collections').delete().eq('id', id);
    fetchCollections();
  };

  if (showForm) {
    return (
      <CollectionForm
        collection={editing}
        onClose={() => { setShowForm(false); setEditing(null); }}
        onSave={fetchCollections}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-silver-dark">{collections.length} collections</p>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 bg-burgundy text-cream px-6 py-3 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors"
        >
          <Plus size={16} /> Add New Collection
        </button>
      </div>

      {loading ? (
        <p className="text-silver-dark text-sm">Loading...</p>
      ) : collections.length === 0 ? (
        <div className="bg-white border border-gray-100 p-12 text-center">
          <FolderOpen size={32} className="text-silver mx-auto mb-4" />
          <p className="text-silver-dark text-sm mb-4">No collections yet. Collections help you group related products together.</p>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="inline-flex items-center gap-2 bg-burgundy text-cream px-6 py-3 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors"
          >
            <Plus size={16} /> Add New Collection
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {collections.map((c) => (
            <div key={c.id} className="bg-white border border-gray-100 p-4 flex gap-4">
              {c.cover_image && <img src={c.cover_image} alt={c.name} className="w-20 h-24 object-cover bg-cream" />}
              <div className="flex-1">
                <p className="font-display text-lg text-burgundy-dark">{c.name}</p>
                <p className="text-xs text-silver-dark line-clamp-2 mt-1">{c.description}</p>
                {c.is_featured && <span className="text-[9px] bg-cream-dark text-burgundy px-2 py-0.5 tracking-luxe uppercase mt-2 inline-block">Featured</span>}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { setEditing(c); setShowForm(true); }} className="text-xs text-burgundy hover:underline">Edit</button>
                  <span className="text-silver">|</span>
                  <button onClick={() => handleDelete(c.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CollectionForm({ collection, onClose, onSave }: {
  collection: any;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    name: collection?.name || '',
    description: collection?.description || '',
    cover_image: collection?.cover_image || '',
    editorial_image: collection?.editorial_image || '',
    is_featured: collection?.is_featured || false,
  });
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingEditorial, setUploadingEditorial] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const editorialInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File, field: 'cover_image' | 'editorial_image') => {
    const setUploading = field === 'cover_image' ? setUploadingCover : setUploadingEditorial;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);
    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      setForm((prev) => ({ ...prev, [field]: urlData.publicUrl }));
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const payload = {
      name: form.name,
      slug,
      description: form.description,
      cover_image: form.cover_image || null,
      editorial_image: form.editorial_image || null,
      is_featured: form.is_featured,
    };

    if (collection) {
      await supabase.from('collections').update(payload).eq('id', collection.id);
    } else {
      await supabase.from('collections').insert(payload);
    }

    setSaving(false);
    onSave();
    onClose();
  };

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-2xl text-burgundy-dark">{collection ? 'Edit Collection' : 'Add New Collection'}</h2>
        <button onClick={onClose} className="text-silver-dark hover:text-burgundy"><X size={22} /></button>
      </div>
      <div className="space-y-5">
        <AdminInput label="Collection Name" value={form.name} onChange={(v) => update('name', v)} placeholder="e.g. Summer 2026" />
        <AdminTextarea label="Description" value={form.description} onChange={(v) => update('description', v)} rows={3} placeholder="What is this collection about?" />

        {/* Cover Image */}
        <div>
          <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Cover Photo</label>
          <div onClick={() => coverInputRef.current?.click()} className="border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer hover:border-burgundy transition-colors">
            {form.cover_image ? (
              <img src={form.cover_image} alt="Cover" className="w-full h-32 object-cover" />
            ) : (
              <>
                <Upload size={20} className="text-silver mx-auto mb-1" />
                <p className="text-sm text-burgundy-dark">{uploadingCover ? 'Uploading...' : 'Click to upload'}</p>
              </>
            )}
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], 'cover_image')}
            className="hidden"
          />
        </div>

        {/* Editorial Image */}
        <div>
          <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Editorial Photo (optional)</label>
          <div onClick={() => editorialInputRef.current?.click()} className="border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer hover:border-burgundy transition-colors">
            {form.editorial_image ? (
              <img src={form.editorial_image} alt="Editorial" className="w-full h-32 object-cover" />
            ) : (
              <>
                <Upload size={20} className="text-silver mx-auto mb-1" />
                <p className="text-sm text-burgundy-dark">{uploadingEditorial ? 'Uploading...' : 'Click to upload'}</p>
              </>
            )}
          </div>
          <input
            ref={editorialInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], 'editorial_image')}
            className="hidden"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-burgundy-dark cursor-pointer">
          <input type="checkbox" checked={form.is_featured} onChange={(e) => update('is_featured', e.target.checked)} className="w-4 h-4 accent-burgundy" />
          Featured Collection (shows on homepage)
        </label>
        <div className="flex gap-3 pt-4">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-burgundy-dark py-3 text-xs tracking-luxe uppercase hover:bg-cream transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 bg-burgundy text-cream py-3 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Collection'}
          </button>
        </div>
      </div>
    </div>
  );
}

// === Shared UI ===
function OrderStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`text-[9px] tracking-luxe uppercase px-2 py-1 ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

function AdminInput({ label, value, onChange, type = 'text', placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 px-4 py-3 text-sm text-burgundy-dark outline-none focus:border-burgundy transition-colors"
      />
    </div>
  );
}

function AdminTextarea({ label, value, onChange, rows = 3, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full border border-gray-300 px-4 py-3 text-sm text-burgundy-dark outline-none focus:border-burgundy transition-colors resize-none"
      />
    </div>
  );
}
