import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertCircle, Upload, Plus, Trash2, X, CheckCircle, Save } from 'lucide-react';

const ADMIN_EMAIL = 'marveldital@gmail.com';

// ===== Shared upload helper =====
async function uploadFile(file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(fileName, file);
  if (uploadError) return null;
  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName);
  return urlData.publicUrl;
}

// ===== Saved confirmation =====
function SavedToast({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-6 py-4 flex items-center gap-3 shadow-lg animate-fade-in">
      <CheckCircle size={20} /> Saved successfully
    </div>
  );
}

// ===== Homepage Section =====
export function AdminHomepage() {
  const [form, setForm] = useState({
    heading: '',
    subtext: '',
    image: '',
    buttonText: '',
    buttonLink: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase
      .from('site_content')
      .select('data')
      .eq('section', 'hero')
      .maybeSingle()
      .then(({ data: row }) => {
        const d = (row as any)?.data || {};
        setForm({
          heading: d.heading || '',
          subtext: d.subtext || '',
          image: d.image || '',
          buttonText: d.buttonText || '',
          buttonLink: d.buttonLink || '/shop',
        });
        setLoading(false);
      });
  }, []);

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    const url = await uploadFile(files[0]);
    if (url) update('image', url);
    else setError('Failed to upload image.');
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const { error: err } = await supabase
      .from('site_content')
      .upsert({ section: 'hero', data: form });
    if (err) setError(err.message);
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  if (loading) return <p className="text-silver-dark text-sm">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 border border-gray-100">
      <h2 className="font-display text-2xl text-burgundy-dark mb-6">Homepage Hero</h2>
      <p className="text-sm text-silver-dark mb-6">Edit the large banner at the top of your homepage.</p>
      {error && <div className="bg-red-50 text-red-700 text-sm p-3 mb-4 flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}

      <div className="space-y-5">
        <AdminField label="Hero Heading" value={form.heading} onChange={(v) => update('heading', v)} placeholder="WEAR YOUR POWER." />
        <AdminField label="Subtext (small text above heading)" value={form.subtext} onChange={(v) => update('subtext', v)} placeholder="The Autumn / Winter 2026 Collection" />
        <AdminField label="Button Text" value={form.buttonText} onChange={(v) => update('buttonText', v)} placeholder="Shop New Arrivals" />
        <div>
          <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Button Link</label>
          <select
            value={form.buttonLink}
            onChange={(e) => update('buttonLink', e.target.value)}
            className="w-full border border-gray-300 px-4 py-3 text-sm text-burgundy-dark outline-none focus:border-burgundy bg-white"
          >
            <option value="/shop">Shop Page</option>
            <option value="/collections">Collections Page</option>
            <option value="/about">About Page</option>
            <option value="/contact">Contact Page</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Hero Image</label>
          <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer hover:border-burgundy transition-colors">
            {form.image ? (
              <img src={form.image} alt="Hero" className="w-full h-40 object-cover" />
            ) : (
              <>
                <Upload size={20} className="text-silver mx-auto mb-1" />
                <p className="text-sm text-burgundy-dark">{uploading ? 'Uploading...' : 'Click to upload'}</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => e.target.files && handleUpload(e.target.files)} className="hidden" />
        </div>

        <SaveBar saving={saving} onSave={handleSave} saveLabel="Save Homepage" />
      </div>
      <SavedToast show={saved} />
    </div>
  );
}

// ===== About Section =====
export function AdminAbout() {
  const [form, setForm] = useState<Record<string, string>>({
    heroImage: '', sectionTitle: '', storyParagraph1: '', storyParagraph2: '', storyParagraph3: '',
    editorialImage: '', editorialTitle: '', editorialParagraph1: '', editorialParagraph2: '', editorialParagraph3: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const heroRef = useRef<HTMLInputElement>(null);
  const editorialRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from('site_content').select('data').eq('section', 'about').maybeSingle()
      .then(({ data: row }) => {
        const d = (row as any)?.data || {};
        setForm({
          heroImage: d.heroImage || '', sectionTitle: d.sectionTitle || '',
          storyParagraph1: d.storyParagraph1 || '', storyParagraph2: d.storyParagraph2 || '', storyParagraph3: d.storyParagraph3 || '',
          editorialImage: d.editorialImage || '', editorialTitle: d.editorialTitle || '',
          editorialParagraph1: d.editorialParagraph1 || '', editorialParagraph2: d.editorialParagraph2 || '', editorialParagraph3: d.editorialParagraph3 || '',
        });
        setLoading(false);
      });
  }, []);

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleUpload = async (ref: React.RefObject<HTMLInputElement>, field: string) => {
    const file = ref.current?.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (url) update(field, url);
    else setError('Failed to upload image.');
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const { error: err } = await supabase.from('site_content').upsert({ section: 'about', data: form });
    if (err) setError(err.message);
    else { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  };

  if (loading) return <p className="text-silver-dark text-sm">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 border border-gray-100">
      <h2 className="font-display text-2xl text-burgundy-dark mb-6">About SILVER LEAGUE</h2>
      <p className="text-sm text-silver-dark mb-6">Edit your brand story and about page content.</p>
      {error && <div className="bg-red-50 text-red-700 text-sm p-3 mb-4 flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}

      <div className="space-y-5">
        <div>
          <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Brand Hero Image</label>
          <div onClick={() => heroRef.current?.click()} className="border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer hover:border-burgundy transition-colors">
            {form.heroImage ? <img src={form.heroImage} alt="About hero" className="w-full h-40 object-cover" /> : <><Upload size={20} className="text-silver mx-auto mb-1" /><p className="text-sm text-burgundy-dark">Click to upload</p></>}
          </div>
          <input ref={heroRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={() => handleUpload(heroRef, 'heroImage')} className="hidden" />
        </div>

        <AdminField label="Section Title" value={form.sectionTitle} onChange={(v) => update('sectionTitle', v)} placeholder="Clothing as Conviction" />
        <AdminTextArea label="Story Paragraph 1" value={form.storyParagraph1} onChange={(v) => update('storyParagraph1', v)} rows={3} />
        <AdminTextArea label="Story Paragraph 2" value={form.storyParagraph2} onChange={(v) => update('storyParagraph2', v)} rows={3} />
        <AdminTextArea label="Story Paragraph 3" value={form.storyParagraph3} onChange={(v) => update('storyParagraph3', v)} rows={3} />

        <div className="pt-4 border-t border-gray-100">
          <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Editorial Image</label>
          <div onClick={() => editorialRef.current?.click()} className="border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer hover:border-burgundy transition-colors">
            {form.editorialImage ? <img src={form.editorialImage} alt="Editorial" className="w-full h-40 object-cover" /> : <><Upload size={20} className="text-silver mx-auto mb-1" /><p className="text-sm text-burgundy-dark">Click to upload</p></>}
          </div>
          <input ref={editorialRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={() => handleUpload(editorialRef, 'editorialImage')} className="hidden" />
        </div>

        <AdminField label="Editorial Title" value={form.editorialTitle} onChange={(v) => update('editorialTitle', v)} placeholder="She Does Not Wait to Be Invited" />
        <AdminTextArea label="Editorial Paragraph 1" value={form.editorialParagraph1} onChange={(v) => update('editorialParagraph1', v)} rows={2} />
        <AdminTextArea label="Editorial Paragraph 2" value={form.editorialParagraph2} onChange={(v) => update('editorialParagraph2', v)} rows={2} />
        <AdminTextArea label="Editorial Paragraph 3" value={form.editorialParagraph3} onChange={(v) => update('editorialParagraph3', v)} rows={2} />

        <SaveBar saving={saving} onSave={handleSave} saveLabel="Save About Page" />
      </div>
      <SavedToast show={saved} />
    </div>
  );
}

// ===== Services Section =====
export function AdminServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetch = async () => {
    const { data } = await supabase.from('services').select('*').order('sort_order', { ascending: true });
    setServices(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service? This cannot be undone.')) return;
    await supabase.from('services').delete().eq('id', id);
    fetch();
  };

  if (showForm) {
    return <ServiceForm service={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSave={fetch} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-silver-dark">{services.length} services</p>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-2 bg-burgundy text-cream px-6 py-3 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors">
          <Plus size={16} /> Add Service
        </button>
      </div>
      {loading ? <p className="text-silver-dark text-sm">Loading...</p> : services.length === 0 ? (
        <div className="bg-white border border-gray-100 p-12 text-center">
          <p className="text-silver-dark text-sm mb-4">No services yet. Add your first service to display it on your website.</p>
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-2 bg-burgundy text-cream px-6 py-3 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors">
            <Plus size={16} /> Add Service
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {services.map((s) => (
            <div key={s.id} className="bg-white border border-gray-100 p-4 flex gap-4">
              {s.image && <img src={s.image} alt={s.title} className="w-20 h-20 object-cover bg-cream" />}
              <div className="flex-1">
                <p className="font-display text-lg text-burgundy-dark">{s.title}</p>
                <p className="text-xs text-silver-dark line-clamp-2 mt-1">{s.description}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { setEditing(s); setShowForm(true); }} className="text-xs text-burgundy hover:underline">Edit</button>
                  <span className="text-silver">|</span>
                  <button onClick={() => handleDelete(s.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceForm({ service, onClose, onSave }: { service: any; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ title: service?.title || '', description: service?.description || '', image: service?.image || '', sort_order: service?.sort_order ?? 0 });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    const url = await uploadFile(files[0]);
    if (url) update('image', url);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    if (!form.title.trim()) { setError('Please enter a service title.'); setSaving(false); return; }
    if (service) {
      await supabase.from('services').update(form).eq('id', service.id);
    } else {
      await supabase.from('services').insert(form);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); onSave(); onClose(); }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-2xl text-burgundy-dark">{service ? 'Edit Service' : 'Add Service'}</h2>
        <button onClick={onClose} className="text-silver-dark hover:text-burgundy"><X size={22} /></button>
      </div>
      {error && <div className="bg-red-50 text-red-700 text-sm p-3 mb-4 flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}
      <div className="space-y-5">
        <AdminField label="Service Title" value={form.title} onChange={(v) => update('title', v)} placeholder="e.g. Personal Styling" />
        <AdminTextArea label="Description" value={form.description} onChange={(v) => update('description', v)} rows={3} placeholder="Describe this service..." />
        <div>
          <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Service Image (optional)</label>
          <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer hover:border-burgundy transition-colors">
            {form.image ? <img src={form.image} alt="Service" className="w-full h-32 object-cover" /> : <><Upload size={20} className="text-silver mx-auto mb-1" /><p className="text-sm text-burgundy-dark">{uploading ? 'Uploading...' : 'Click to upload'}</p></>}
          </div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => e.target.files && handleUpload(e.target.files)} className="hidden" />
        </div>
        <AdminField label="Display Order (lower shows first)" value={String(form.sort_order)} onChange={(v) => update('sort_order', parseInt(v) || 0)} type="number" />
        <SaveBar saving={saving} onSave={handleSave} saveLabel="Save Service" />
      </div>
      <SavedToast show={saved} />
    </div>
  );
}

// ===== Testimonials Section =====
export function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetch = async () => {
    const { data } = await supabase.from('testimonials').select('*').order('sort_order', { ascending: true });
    setTestimonials(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial? This cannot be undone.')) return;
    await supabase.from('testimonials').delete().eq('id', id);
    fetch();
  };

  if (showForm) {
    return <TestimonialForm testimonial={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSave={fetch} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-silver-dark">{testimonials.length} testimonials</p>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-2 bg-burgundy text-cream px-6 py-3 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors">
          <Plus size={16} /> Add Testimonial
        </button>
      </div>
      {loading ? <p className="text-silver-dark text-sm">Loading...</p> : testimonials.length === 0 ? (
        <div className="bg-white border border-gray-100 p-12 text-center">
          <p className="text-silver-dark text-sm mb-4">No testimonials yet. Add customer reviews to build trust.</p>
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-2 bg-burgundy text-cream px-6 py-3 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors">
            <Plus size={16} /> Add Testimonial
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white border border-gray-100 p-4 flex gap-4">
              {t.image && <img src={t.image} alt={t.customer_name} className="w-16 h-16 object-cover rounded-full bg-cream flex-shrink-0" />}
              <div className="flex-1">
                <p className="font-display text-lg text-burgundy-dark">{t.customer_name}</p>
                <p className="text-sm text-silver-dark line-clamp-3 mt-1 italic">"{t.text}"</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { setEditing(t); setShowForm(true); }} className="text-xs text-burgundy hover:underline">Edit</button>
                  <span className="text-silver">|</span>
                  <button onClick={() => handleDelete(t.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TestimonialForm({ testimonial, onClose, onSave }: { testimonial: any; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ customer_name: testimonial?.customer_name || '', text: testimonial?.text || '', image: testimonial?.image || '', sort_order: testimonial?.sort_order ?? 0 });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    const url = await uploadFile(files[0]);
    if (url) update('image', url);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    if (!form.customer_name.trim()) { setError('Please enter the customer name.'); setSaving(false); return; }
    if (!form.text.trim()) { setError('Please enter the testimonial text.'); setSaving(false); return; }
    const payload = { ...form, image: form.image || null };
    if (testimonial) {
      await supabase.from('testimonials').update(payload).eq('id', testimonial.id);
    } else {
      await supabase.from('testimonials').insert(payload);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); onSave(); onClose(); }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-2xl text-burgundy-dark">{testimonial ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
        <button onClick={onClose} className="text-silver-dark hover:text-burgundy"><X size={22} /></button>
      </div>
      {error && <div className="bg-red-50 text-red-700 text-sm p-3 mb-4 flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}
      <div className="space-y-5">
        <AdminField label="Customer Name" value={form.customer_name} onChange={(v) => update('customer_name', v)} placeholder="e.g. Adaeze K." />
        <AdminTextArea label="Testimonial" value={form.text} onChange={(v) => update('text', v)} rows={4} placeholder="What did the customer say?" />
        <div>
          <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Customer Photo (optional)</label>
          <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer hover:border-burgundy transition-colors">
            {form.image ? <img src={form.image} alt="Customer" className="w-20 h-20 object-cover rounded-full mx-auto" /> : <><Upload size={20} className="text-silver mx-auto mb-1" /><p className="text-sm text-burgundy-dark">{uploading ? 'Uploading...' : 'Click to upload'}</p></>}
          </div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => e.target.files && handleUpload(e.target.files)} className="hidden" />
        </div>
        <AdminField label="Display Order (lower shows first)" value={String(form.sort_order)} onChange={(v) => update('sort_order', parseInt(v) || 0)} type="number" />
        <SaveBar saving={saving} onSave={handleSave} saveLabel="Save Testimonial" />
      </div>
      <SavedToast show={saved} />
    </div>
  );
}

// ===== Contact & Socials Section =====
export function AdminContact() {
  const [form, setForm] = useState<Record<string, string>>({
    email: '', phone: '', whatsapp: '', location: '', instagram: '', instagramHandle: '', tiktok: '', tiktokHandle: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('site_content').select('data').eq('section', 'contact').maybeSingle()
      .then(({ data: row }) => {
        const d = (row as any)?.data || {};
        setForm({
          email: d.email || '', phone: d.phone || '', whatsapp: d.whatsapp || '', location: d.location || '',
          instagram: d.instagram || '', instagramHandle: d.instagramHandle || '', tiktok: d.tiktok || '', tiktokHandle: d.tiktokHandle || '',
        });
        setLoading(false);
      });
  }, []);

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const { error: err } = await supabase.from('site_content').upsert({ section: 'contact', data: form });
    if (err) setError(err.message);
    else { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  };

  if (loading) return <p className="text-silver-dark text-sm">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 border border-gray-100">
      <h2 className="font-display text-2xl text-burgundy-dark mb-6">Contact & Socials</h2>
      <p className="text-sm text-silver-dark mb-6">Update your contact details. These appear on your footer, contact page, and policy pages.</p>
      {error && <div className="bg-red-50 text-red-700 text-sm p-3 mb-4 flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}

      <div className="space-y-5">
        <AdminField label="Email Address" value={form.email} onChange={(v) => update('email', v)} placeholder="hello@silverleague.co" />
        <AdminField label="Phone / WhatsApp Number" value={form.phone} onChange={(v) => update('phone', v)} placeholder="+234 901 048 0020" />
        <AdminField label="WhatsApp Number (digits only, for links)" value={form.whatsapp} onChange={(v) => update('whatsapp', v)} placeholder="2349010480020" />
        <AdminField label="Location" value={form.location} onChange={(v) => update('location', v)} placeholder="Lagos, Nigeria" />
        <AdminField label="Instagram URL" value={form.instagram} onChange={(v) => update('instagram', v)} placeholder="https://instagram.com/silverleague_co" />
        <AdminField label="Instagram Handle" value={form.instagramHandle} onChange={(v) => update('instagramHandle', v)} placeholder="@silverleague_co" />
        <AdminField label="TikTok URL" value={form.tiktok} onChange={(v) => update('tiktok', v)} placeholder="https://tiktok.com/@silver_league" />
        <AdminField label="TikTok Handle" value={form.tiktokHandle} onChange={(v) => update('tiktokHandle', v)} placeholder="@silver_league" />
        <SaveBar saving={saving} onSave={handleSave} saveLabel="Save Contact Details" />
      </div>
      <SavedToast show={saved} />
    </div>
  );
}

// ===== Portfolio Section =====
export function AdminPortfolio() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [heading, setHeading] = useState({ heading: '', subtitle: '' });
  const [savingHeading, setSavingHeading] = useState(false);
  const [savedHeading, setSavedHeading] = useState(false);

  const fetch = async () => {
    const [{ data: list }, { data: content }] = await Promise.all([
      supabase.from('portfolio_items').select('*').order('sort_order', { ascending: true }),
      supabase.from('site_content').select('data').eq('section', 'portfolio').maybeSingle(),
    ]);
    setItems(list || []);
    const d = (content as any)?.data || {};
    setHeading({ heading: d.heading || 'Portfolio', subtitle: d.subtitle || 'Selected projects and collaborations' });
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this portfolio item? This cannot be undone.')) return;
    await supabase.from('portfolio_items').delete().eq('id', id);
    fetch();
  };

  const handleSaveHeading = async () => {
    setSavingHeading(true);
    await supabase.from('site_content').upsert({ section: 'portfolio', data: heading });
    setSavingHeading(false);
    setSavedHeading(true);
    setTimeout(() => setSavedHeading(false), 3000);
  };

  if (showForm) {
    return <PortfolioForm item={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSave={fetch} />;
  }

  return (
    <div className="space-y-8">
      <div className="max-w-2xl bg-white p-6 md:p-8 border border-gray-100">
        <h2 className="font-display text-2xl text-burgundy-dark mb-4">Portfolio Heading</h2>
        <div className="space-y-5">
          <AdminField label="Section Heading" value={heading.heading} onChange={(v) => setHeading((p) => ({ ...p, heading: v }))} placeholder="Portfolio" />
          <AdminField label="Subtitle" value={heading.subtitle} onChange={(v) => setHeading((p) => ({ ...p, subtitle: v }))} placeholder="Selected projects and collaborations" />
          <SaveBar saving={savingHeading} onSave={handleSaveHeading} saveLabel="Save Heading" />
        </div>
        <SavedToast show={savedHeading} />
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-silver-dark">{items.length} portfolio items</p>
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-2 bg-burgundy text-cream px-6 py-3 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors">
            <Plus size={16} /> Add Portfolio Item
          </button>
        </div>
        {loading ? <p className="text-silver-dark text-sm">Loading...</p> : items.length === 0 ? (
          <div className="bg-white border border-gray-100 p-12 text-center">
            <p className="text-silver-dark text-sm mb-4">No portfolio items yet. Add project details to showcase your work.</p>
            <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-2 bg-burgundy text-cream px-6 py-3 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors">
              <Plus size={16} /> Add Portfolio Item
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white border border-gray-100 p-4 flex gap-4">
                {item.image && <img src={item.image} alt={item.title} className="w-20 h-20 object-cover bg-cream" />}
                <div className="flex-1">
                  <p className="font-display text-lg text-burgundy-dark">{item.title}</p>
                  <p className="text-xs text-silver-dark line-clamp-2 mt-1">{item.description}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => { setEditing(item); setShowForm(true); }} className="text-xs text-burgundy hover:underline">Edit</button>
                    <span className="text-silver">|</span>
                    <button onClick={() => handleDelete(item.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PortfolioForm({ item, onClose, onSave }: { item: any; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ title: item?.title || '', description: item?.description || '', image: item?.image || '', sort_order: item?.sort_order ?? 0 });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    const url = await uploadFile(files[0]);
    if (url) update('image', url);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    if (!form.title.trim()) { setError('Please enter a title.'); setSaving(false); return; }
    const payload = { ...form, image: form.image || null };
    if (item) {
      await supabase.from('portfolio_items').update(payload).eq('id', item.id);
    } else {
      await supabase.from('portfolio_items').insert(payload);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); onSave(); onClose(); }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-2xl text-burgundy-dark">{item ? 'Edit Portfolio Item' : 'Add Portfolio Item'}</h2>
        <button onClick={onClose} className="text-silver-dark hover:text-burgundy"><X size={22} /></button>
      </div>
      {error && <div className="bg-red-50 text-red-700 text-sm p-3 mb-4 flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}
      <div className="space-y-5">
        <AdminField label="Title" value={form.title} onChange={(v) => update('title', v)} placeholder="e.g. Spring Campaign 2026" />
        <AdminTextArea label="Description" value={form.description} onChange={(v) => update('description', v)} rows={3} placeholder="Describe this project..." />
        <div>
          <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Project Image (optional)</label>
          <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer hover:border-burgundy transition-colors">
            {form.image ? <img src={form.image} alt="Portfolio" className="w-full h-32 object-cover" /> : <><Upload size={20} className="text-silver mx-auto mb-1" /><p className="text-sm text-burgundy-dark">{uploading ? 'Uploading...' : 'Click to upload'}</p></>}
          </div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => e.target.files && handleUpload(e.target.files)} className="hidden" />
        </div>
        <AdminField label="Display Order (lower shows first)" value={String(form.sort_order)} onChange={(v) => update('sort_order', parseInt(v) || 0)} type="number" />
        <SaveBar saving={saving} onSave={handleSave} saveLabel="Save Portfolio Item" />
      </div>
      <SavedToast show={saved} />
    </div>
  );
}

// ===== Shared UI components =====
function AdminField({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-gray-300 px-4 py-3 text-sm text-burgundy-dark outline-none focus:border-burgundy transition-colors" />
    </div>
  );
}

function AdminTextArea({ label, value, onChange, rows = 3, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className="w-full border border-gray-300 px-4 py-3 text-sm text-burgundy-dark outline-none focus:border-burgundy transition-colors resize-none" />
    </div>
  );
}

function SaveBar({ saving, onSave, saveLabel }: { saving: boolean; onSave: () => void; saveLabel: string }) {
  return (
    <div className="flex gap-3 pt-4">
      <button onClick={onSave} disabled={saving} className="flex-1 bg-burgundy text-cream py-3 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        <Save size={14} /> {saving ? 'Saving...' : saveLabel}
      </button>
    </div>
  );
}
