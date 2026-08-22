import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ArrowLeft, ImagePlus, Save } from 'lucide-react';

type Profile = {
  _id: string;
  artistName: string;
  penName?: string;
  email: string;
  bio?: string;
  artistStatement?: string;
  location?: string;
  profileImage?: string;
  artCategories?: string[];
  artStyles?: string[];
  mediums?: string[];
  socialLinks?: Record<string, string>;
  address?: Record<string, string>;
  paymentDetails?: Record<string, string>;
};

type FormState = Omit<Profile, 'socialLinks' | 'address' | 'paymentDetails' | 'bio' | 'artCategories' | 'artStyles' | 'mediums'> & {
  bio: string;
  artCategories: string[];
  artStyles: string[];
  mediums: string[];
  phone: string;
  socialLinks: Record<string, string>;
  address: Record<string, string>;
  paymentDetails: Record<string, string>;
};

const emptyForm: FormState = {
  _id: '',
  artistName: '', penName: '', email: '', phone: '', bio: '', artistStatement: '', location: '', profileImage: '',
  artCategories: [], artStyles: [], mediums: [],
  socialLinks: { website: '', instagram: '', facebook: '', youtube: '', twitter: '' },
  address: { street: '', line2: '', city: '', state: '', zip: '', country: '' },
  paymentDetails: { upiId: '', bankName: '', accountNumber: '', ifscCode: '', accountHolderName: '' },
};

const inputClass = 'auth-input w-full';
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-5 border-b border-gray-100 pb-8 dark:border-gray-800">
    <h2 className="text-xl font-black text-gray-900 dark:text-white">{title}</h2>
    {children}
  </section>
);
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block space-y-2"><span className="text-sm font-bold text-gray-700 dark:text-gray-300">{label}</span>{children}</label>
);

const ArtistProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([axios.get('/api/artist-portal/profile'), axios.get('/api/auth/me')])
      .then(([profileRes, userRes]) => {
        const profile: Profile = profileRes.data;
        setForm({ ...emptyForm, ...profile, phone: userRes.data.phone || '', socialLinks: { ...emptyForm.socialLinks, ...profile.socialLinks }, address: { ...emptyForm.address, ...profile.address }, paymentDetails: { ...emptyForm.paymentDetails, ...profile.paymentDetails }, artCategories: profile.artCategories || [], artStyles: profile.artStyles || [], mediums: profile.mediums || [] });
      })
      .catch(() => toast.error('Unable to load profile. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const update = (field: keyof FormState, value: string | string[]) => setForm((current) => ({ ...current, [field]: value }));
  const updateNested = (group: 'socialLinks' | 'address' | 'paymentDetails', field: string, value: string) => setForm((current) => ({ ...current, [group]: { ...current[group], [field]: value } }));
  const arrayValue = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setErrors({ profileImage: 'Please choose an image file.' });
    if (file.size > 5 * 1024 * 1024) return setErrors({ profileImage: 'Profile image must be 5MB or smaller.' });
    setUploading(true);
    try {
      const { data } = await axios.get('/api/uploads/signature?folder=artopus/artists');
      const upload = new FormData();
      upload.append('file', file); upload.append('signature', data.signature); upload.append('timestamp', String(data.timestamp)); upload.append('api_key', data.apiKey); upload.append('folder', 'artopus/artists');
      const result = await axios.post(`https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`, upload);
      update('profileImage', result.data.secure_url); setErrors({});
    } catch { toast.error('Unable to upload profile photo. Please try again.'); }
    finally { setUploading(false); }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.artistName.trim()) nextErrors.artistName = 'Artist name is required.';
    if (form.bio.length > 1000) nextErrors.bio = 'Bio must be 1000 characters or fewer.';
    if (form.phone && !/^\+?[0-9 ()-]{7,20}$/.test(form.phone)) nextErrors.phone = 'Enter a valid phone number.';
    Object.entries(form.socialLinks).forEach(([key, value]) => { if (value && !/^https?:\/\//i.test(value)) nextErrors[`social.${key}`] = 'Use a complete URL starting with http:// or https://.'; });
    if (form.address.zip && !/^[A-Za-z0-9 -]{3,12}$/.test(form.address.zip)) nextErrors.zip = 'Enter a valid postal code.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    try {
      const { _id, email, ...profilePayload } = form;
      await axios.put('/api/artist-portal/profile', profilePayload);
      toast.success('Profile updated successfully');
      navigate('/artist-dashboard');
    } catch (error: any) { toast.error(error.response?.data?.message || 'Unable to update profile. Please try again.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="container-custom py-20 text-center text-gray-500">Loading profile editor...</div>;

  return <main className="container-custom max-w-4xl py-8 sm:py-12">
    <div className="mb-8 flex items-center justify-between gap-4">
      <div><Link to="/artist-dashboard" className="mb-4 inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16} /> Back to dashboard</Link><h1 className="text-3xl font-black text-gray-900 dark:text-white">Edit Profile</h1><p className="mt-1 text-sm text-gray-500">Manage what collectors see and keep your account details private.</p></div>
      <Link to={`/artist/${form._id}`} className="hidden rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold dark:border-gray-700 sm:block">View Public Profile</Link>
    </div>
    <form onSubmit={submit} className="space-y-8 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
      <Section title="Profile Photo"><div className="flex flex-wrap items-center gap-5"><div className="h-24 w-24 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">{form.profileImage ? <img src={form.profileImage} alt="Profile preview" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-3xl font-black text-logo-purple">{form.artistName.charAt(0) || 'A'}</div>}</div><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-logo-purple px-4 py-3 text-sm font-bold text-white"><ImagePlus size={17} />{uploading ? 'Uploading...' : 'Change Photo'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadImage} className="hidden" disabled={uploading} /></label>{errors.profileImage && <p className="w-full text-xs text-red-500">{errors.profileImage}</p>}</div></Section>
      <Section title="Basic Information"><div className="grid gap-5 sm:grid-cols-2"><Field label="Artist Name *"><input className={inputClass} value={form.artistName} onChange={(e) => update('artistName', e.target.value)} />{errors.artistName && <p className="text-xs text-red-500">{errors.artistName}</p>}</Field><Field label="Pen Name"><input className={inputClass} value={form.penName} onChange={(e) => update('penName', e.target.value)} /></Field><Field label="Bio"><textarea className={`${inputClass} min-h-28`} value={form.bio} onChange={(e) => update('bio', e.target.value)} />{errors.bio && <p className="text-xs text-red-500">{errors.bio}</p>}</Field><Field label="Artist Statement"><textarea className={`${inputClass} min-h-28`} value={form.artistStatement} onChange={(e) => update('artistStatement', e.target.value)} /></Field><Field label="Public Location"><input className={inputClass} value={form.location} onChange={(e) => update('location', e.target.value)} /></Field></div></Section>
      <Section title="Art Information"><div className="grid gap-5 sm:grid-cols-2"><Field label="Art Categories"><input className={inputClass} placeholder="Painting, Illustration" value={form.artCategories.join(', ')} onChange={(e) => update('artCategories', arrayValue(e.target.value))} /></Field><Field label="Art Styles / Specialization"><input className={inputClass} placeholder="Abstract, Contemporary" value={form.artStyles.join(', ')} onChange={(e) => update('artStyles', arrayValue(e.target.value))} /></Field><Field label="Mediums"><input className={inputClass} placeholder="Oil, Acrylic, Digital" value={form.mediums.join(', ')} onChange={(e) => update('mediums', arrayValue(e.target.value))} /></Field></div></Section>
      <Section title="Social Links"><div className="grid gap-5 sm:grid-cols-2">{['website', 'instagram', 'facebook', 'youtube'].map((key) => <Field key={key} label={key[0].toUpperCase() + key.slice(1)}><input type="url" className={inputClass} value={form.socialLinks[key] || ''} onChange={(e) => updateNested('socialLinks', key, e.target.value)} />{errors[`social.${key}`] && <p className="text-xs text-red-500">{errors[`social.${key}`]}</p>}</Field>)}</div></Section>
      <Section title="Private Account Information"><div className="grid gap-5 sm:grid-cols-2"><Field label="Email"><input className={`${inputClass} opacity-60`} value={form.email} readOnly /><span className="text-xs text-gray-500">Login email cannot be changed here.</span></Field><Field label="Phone"><input type="tel" className={inputClass} value={form.phone} onChange={(e) => update('phone', e.target.value)} />{errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}</Field></div></Section>
      <Section title="Private Address"><div className="grid gap-5 sm:grid-cols-2"><Field label="Address Line 1"><input className={inputClass} value={form.address.street} onChange={(e) => updateNested('address', 'street', e.target.value)} /></Field><Field label="Address Line 2"><input className={inputClass} value={form.address.line2} onChange={(e) => updateNested('address', 'line2', e.target.value)} /></Field><Field label="City"><input className={inputClass} value={form.address.city} onChange={(e) => updateNested('address', 'city', e.target.value)} /></Field><Field label="State"><input className={inputClass} value={form.address.state} onChange={(e) => updateNested('address', 'state', e.target.value)} /></Field><Field label="Postal Code"><input className={inputClass} value={form.address.zip} onChange={(e) => updateNested('address', 'zip', e.target.value)} />{errors.zip && <p className="text-xs text-red-500">{errors.zip}</p>}</Field><Field label="Country"><input className={inputClass} value={form.address.country} onChange={(e) => updateNested('address', 'country', e.target.value)} /></Field></div><p className="text-xs text-gray-500">Your address is used for account and payout administration and is not shown publicly.</p></Section>
      <div className="flex flex-wrap justify-end gap-3"><Link to="/artist-dashboard" className="rounded-xl bg-gray-100 px-5 py-3 text-sm font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">Cancel</Link><button disabled={saving || uploading} className="inline-flex items-center gap-2 rounded-xl bg-logo-purple px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><Save size={17} />{saving ? 'Saving...' : 'Save Changes'}</button></div>
    </form>
  </main>;
};

export default ArtistProfileEdit;
