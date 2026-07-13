// import { Head } from '@inertiajs/react';
// import AppShell from '@/AppShell';
// import React, { useEffect, useState } from 'react';
// import { useTheme } from '@/contexts/ThemeContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { DatePicker } from '@/components/ui/date-picker';
// import { Sun, Moon, Shield, Building, Receipt } from 'lucide-react';
// import axios from 'axios';

// function SettingsPage() {
//   const { isDark, toggle, setTheme } = useTheme();
//   const [vatPercent, setVatPercent] = useState('15');
//   const [vatDate, setVatDate] = useState('2026-04-01');
//   const [companyName, setCompanyName] = useState('PharmaPOS Pharmacy');
//   const [companyAddress, setCompanyAddress] = useState('123 Health Street, Colombo 03');
//   const [companyPhone, setCompanyPhone] = useState('+94 11 234 5678');

//   useEffect(() => {
//     fetchSettings();
//   },[]);

//   const fetchSettings = async ()=>{
//     try {
//         const response = await axios.get('settings/all');
//         const setting = response.data[0];

//         const settingsData = {
//             theme: setting.theme,
//             company_name: setting.company_name,
//             company_address: setting.company_address,
//             company_phone: setting.company_phone,
//             current_vat_percentage: setting.current_vat_percentage,
//             vat_effective_date: setting.vat_effective_date,
//         };

//         const isDarkTheme = setting.theme === 1; // convert 1/0 → true/false
//         setTheme(isDarkTheme); // <-- apply theme globally
//         setCompanyName(settingsData.company_name);
//         setCompanyAddress(settingsData.company_address);
//         setCompanyPhone(settingsData.company_phone);
//         setVatPercent(settingsData.current_vat_percentage);
//         setVatDate(settingsData.vat_effective_date);
//     } catch (error) {
//         console.log(error);
//     // Swal.fire({ icon: "error", title: "Error", text: "Failed to fetch service type data." });
//     }
//   }

//   const handleThemeChange = async () => {
//     const newTheme = !isDark;
//     setTheme(newTheme); // update UI immediately
//     try {
//         await axios.post('settings/change_theme', {
//         theme: newTheme ? 1 : 0, // boolean → int
//         });
//     } catch (error) {
//         console.log(error);
//     }
//   };

//   const handleCompanyProfile = async ()=>{
//     try {
//         const data = {
//             'company_name':companyName,
//             'company_address':companyAddress,
//             'company_phone':companyPhone,
//         }
//         await axios.post('settings/update_company_profile',data);
//         fetchSettings();
//     } catch (error) {
//         console.log(error);
//     // Swal.fire({ icon: "error", title: "Error", text: "Failed to fetch service type data." });
//     }
//   }

//   const handleVATSettings = async ()=>{
//     try {
//         const data = {
//             'current_vat_percentage':vatPercent,
//             'vat_effective_date':vatDate
//         }
//         await axios.post('settings/update_vat_settings',data);
//         fetchSettings();
//     } catch (error) {
//         console.log(error);
//     // Swal.fire({ icon: "error", title: "Error", text: "Failed to fetch service type data." });
//     }
//   }

//   const roles = [
//     { role: 'Owner', permissions: ['Full Access', 'Manage Employees', 'View Reports', 'Settings', 'Billing', 'Products', 'Stock', 'GRN'] },
//     { role: 'Admin', permissions: ['Manage Employees', 'Products', 'Stock', 'GRN', 'Customers', 'Suppliers', 'Billing'] },
//     { role: 'Cashier', permissions: ['Billing', 'View Customers', 'Invoice History'] },
//   ];

//   return (
//     <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
//       {/* Theme */}
//       <div className="bg-card rounded-xl border border-border p-5">
//         <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">{isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} Appearance</h3>
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-sm font-medium">Theme</p>
//             <p className="text-xs text-muted-foreground">Toggle between light and dark mode</p>
//           </div>
//           <button onClick={handleThemeChange} className={`relative h-7 w-12 rounded-full transition-colors ${isDark ? 'bg-primary' : 'bg-muted'}`}>
//             <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-card shadow transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0.5'}`} />
//           </button>
//         </div>
//       </div>

//       {/* Roles */}
//       <div className="bg-card rounded-xl border border-border p-5">
//         <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Shield className="h-4 w-4" /> Roles & Permissions</h3>
//         <div className="space-y-3">
//           {roles.map((r) => (
//             <div key={r.role} className="p-3 rounded-lg bg-muted/50">
//               <p className="text-sm font-semibold mb-2">{r.role}</p>
//               <div className="flex flex-wrap gap-1">
//                 {r.permissions.map((p) => (
//                   <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{p}</span>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Company Profile */}
//       <div className="bg-card rounded-xl border border-border p-5">
//         <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Building className="h-4 w-4" /> Company Profile</h3>
//         <div className="space-y-3">
//           <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Company Name</label><Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
//           <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Address</label><Input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} /></div>
//           <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label><Input value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} /></div>
//           <Button onClick={handleCompanyProfile}>Save Changes</Button>
//         </div>
//       </div>

//       {/* VAT Settings */}
//       <div className="bg-card rounded-xl border border-border p-5">
//         <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Receipt className="h-4 w-4" /> VAT Settings</h3>
//         <div className="grid grid-cols-2 gap-3">
//           <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Current VAT %</label><Input type="number" value={vatPercent} onChange={(e) => setVatPercent(e.target.value)} /></div>
//           <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Effective Date</label><DatePicker value={vatDate} onChange={setVatDate} className="w-full" /></div>
//         </div>
//         <Button onClick={handleVATSettings} className="mt-3">Update VAT</Button>
//       </div>
//     </div>
//   );
// }


// export default function WrappedSettingsPage() {
//   return (
//     <>
//       <Head title="Settings" />
//       <SettingsPage />
//     </>
//   );
// }

// (WrappedSettingsPage as any).layout = (page: React.ReactNode) => <AppShell>{page}</AppShell>;
/////////////////////////////////////////////////
// import { Head } from '@inertiajs/react';
// import AppShell from '@/AppShell';
// import React, { useEffect, useState } from 'react';
// import { useTheme } from '@/contexts/ThemeContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { DatePicker } from '@/components/ui/date-picker';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
// import ConfirmDialog from '@/components/shared/ConfirmDialog';
// import { Sun, Moon, Shield, Building, Receipt, Plus, Edit, Trash2, Search } from 'lucide-react';
// import axios from 'axios';

// // --- Types ---
// interface Category { id: number; name: string; description?: string; }
// interface Brand { id: number; name: string; }
// interface UnitType { id: number; name: string; }
// interface Company { id: number; name: string; mobile: string; address: string; }

// // --- Reusable Simple List Section ---
// // Used for Brands and UnitTypes (only have 'name' field)
// function SimpleListSection({
//     title,
//     items,
//     onAdd,
//     onEdit,
//     onDelete,
// }: {
//     title: string;
//     items: { id: number; name: string }[];
//     onAdd: (name: string) => void;
//     onEdit: (id: number, name: string) => void;
//     onDelete: (id: number) => void;
// }) {
//     const [showAdd, setShowAdd] = useState(false);
//     const [editItem, setEditItem] = useState<{ id: number; name: string } | null>(null);
//     const [name, setName] = useState('');
//     const [deleteId, setDeleteId] = useState<number | null>(null);

//     const handleSave = () => {
//         if (!name.trim()) return;
//         if (editItem) {
//             onEdit(editItem.id, name.trim());
//             setEditItem(null);
//         } else {
//             onAdd(name.trim());
//             setShowAdd(false);
//         }
//         setName('');
//     };

//     return (
//         <div className="bg-card rounded-xl border border-border p-5">
//             <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-sm font-semibold">{title}</h3>
//                 <Button size="sm" variant="outline" className="gap-1 h-7 text-xs"
//                     onClick={() => { setName(''); setShowAdd(true); }}>
//                     <Plus className="h-3 w-3" /> Add
//                 </Button>
//             </div>

//             <div className="space-y-2">
//                 {items.length === 0 && (
//                     <p className="text-xs text-muted-foreground py-2">No {title.toLowerCase()} added yet.</p>
//                 )}
//                 {items.map((item) => (
//                     <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
//                         <span className="text-sm">{item.name}</span>
//                         <div className="flex gap-1">
//                             <button onClick={() => { setName(item.name); setEditItem(item); }}
//                                 className="p-1 rounded hover:bg-muted">
//                                 <Edit className="h-3.5 w-3.5 text-muted-foreground" />
//                             </button>
//                             <button onClick={() => setDeleteId(item.id)}
//                                 className="p-1 rounded hover:bg-destructive/10">
//                                 <Trash2 className="h-3.5 w-3.5 text-destructive" />
//                             </button>
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {/* Add / Edit Dialog */}
//             <Dialog open={showAdd || !!editItem} onOpenChange={(open) => {
//                 if (!open) { setShowAdd(false); setEditItem(null); setName(''); }
//             }}>
//                 <DialogContent className="max-w-sm">
//                     <DialogHeader>
//                         <DialogTitle>{editItem ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}</DialogTitle>
//                     </DialogHeader>
//                     <div className="py-2">
//                         <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
//                         <Input value={name} onChange={(e) => setName(e.target.value)}
//                             onKeyDown={(e) => e.key === 'Enter' && handleSave()}
//                             autoFocus placeholder={`Enter ${title.slice(0, -1).toLowerCase()} name`} />
//                     </div>
//                     <DialogFooter>
//                         <Button variant="outline" onClick={() => { setShowAdd(false); setEditItem(null); setName(''); }}>
//                             Cancel
//                         </Button>
//                         <Button onClick={handleSave}>{editItem ? 'Update' : 'Add'}</Button>
//                     </DialogFooter>
//                 </DialogContent>
//             </Dialog>

//             <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
//                 onConfirm={() => { if (deleteId) onDelete(deleteId); setDeleteId(null); }} />
//         </div>
//     );
// }

// // --- Category Section (has name + description) ---
// function CategorySection({
//     categories, onAdd, onEdit, onDelete,
// }: {
//     categories: Category[];
//     onAdd: (data: Partial<Category>) => void;
//     onEdit: (id: number, data: Partial<Category>) => void;
//     onDelete: (id: number) => void;
// }) {
//     const [showAdd, setShowAdd] = useState(false);
//     const [editItem, setEditItem] = useState<Category | null>(null);
//     const [form, setForm] = useState<Partial<Category>>({});
//     const [deleteId, setDeleteId] = useState<number | null>(null);

//     const handleSave = () => {
//         if (!form.name?.trim()) return;
//         if (editItem) {
//             onEdit(editItem.id, form);
//             setEditItem(null);
//         } else {
//             onAdd(form);
//             setShowAdd(false);
//         }
//         setForm({});
//     };

//     return (
//         <div className="bg-card rounded-xl border border-border p-5">
//             <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-sm font-semibold">Categories</h3>
//                 <Button size="sm" variant="outline" className="gap-1 h-7 text-xs"
//                     onClick={() => { setForm({}); setShowAdd(true); }}>
//                     <Plus className="h-3 w-3" /> Add
//                 </Button>
//             </div>

//             <div className="space-y-2">
//                 {categories.length === 0 && (
//                     <p className="text-xs text-muted-foreground py-2">No categories added yet.</p>
//                 )}
//                 {categories.map((cat) => (
//                     <div key={cat.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
//                         <div>
//                             <p className="text-sm font-medium">{cat.name}</p>
//                             {cat.description && (
//                                 <p className="text-xs text-muted-foreground">{cat.description}</p>
//                             )}
//                         </div>
//                         <div className="flex gap-1">
//                             <button onClick={() => { setForm(cat); setEditItem(cat); }}
//                                 className="p-1 rounded hover:bg-muted">
//                                 <Edit className="h-3.5 w-3.5 text-muted-foreground" />
//                             </button>
//                             <button onClick={() => setDeleteId(cat.id)}
//                                 className="p-1 rounded hover:bg-destructive/10">
//                                 <Trash2 className="h-3.5 w-3.5 text-destructive" />
//                             </button>
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             <Dialog open={showAdd || !!editItem} onOpenChange={(open) => {
//                 if (!open) { setShowAdd(false); setEditItem(null); setForm({}); }
//             }}>
//                 <DialogContent className="max-w-sm">
//                     <DialogHeader>
//                         <DialogTitle>{editItem ? 'Edit Category' : 'Add Category'}</DialogTitle>
//                     </DialogHeader>
//                     <div className="space-y-3 py-2">
//                         <div>
//                             <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
//                             <Input value={form.name || ''} autoFocus
//                                 onChange={(e) => setForm({ ...form, name: e.target.value })} />
//                         </div>
//                         <div>
//                             <label className="text-xs font-medium text-muted-foreground mb-1 block">
//                                 Description (optional)
//                             </label>
//                             <Input value={form.description || ''}
//                                 onChange={(e) => setForm({ ...form, description: e.target.value })} />
//                         </div>
//                     </div>
//                     <DialogFooter>
//                         <Button variant="outline" onClick={() => { setShowAdd(false); setEditItem(null); setForm({}); }}>
//                             Cancel
//                         </Button>
//                         <Button onClick={handleSave}>{editItem ? 'Update' : 'Add'}</Button>
//                     </DialogFooter>
//                 </DialogContent>
//             </Dialog>

//             <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
//                 onConfirm={() => { if (deleteId) onDelete(deleteId); setDeleteId(null); }} />
//         </div>
//     );
// }

// // --- Companies Section ---
// function CompaniesSection({
//     companies, onAdd, onEdit, onDelete,
// }: {
//     companies: Company[];
//     onAdd: (data: Partial<Company>) => void;
//     onEdit: (id: number, data: Partial<Company>) => void;
//     onDelete: (id: number) => void;
// }) {
//     const [showAdd, setShowAdd] = useState(false);
//     const [editItem, setEditItem] = useState<Company | null>(null);
//     const [form, setForm] = useState<Partial<Company>>({});
//     const [deleteId, setDeleteId] = useState<number | null>(null);

//     const handleSave = () => {
//         if (!form.name?.trim()) return;
//         if (editItem) {
//             onEdit(editItem.id, form);
//             setEditItem(null);
//         } else {
//             onAdd(form);
//             setShowAdd(false);
//         }
//         setForm({});
//     };

//     return (
//         <div className="bg-card rounded-xl border border-border p-5">
//             <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-sm font-semibold">Supplier Companies</h3>
//                 <Button size="sm" variant="outline" className="gap-1 h-7 text-xs"
//                     onClick={() => { setForm({}); setShowAdd(true); }}>
//                     <Plus className="h-3 w-3" /> Add
//                 </Button>
//             </div>

//             <div className="space-y-2">
//                 {companies.length === 0 && (
//                     <p className="text-xs text-muted-foreground py-2">No companies added yet.</p>
//                 )}
//                 {companies.map((c) => (
//                     <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
//                         <div>
//                             <p className="text-sm font-medium">{c.name}</p>
//                             <p className="text-xs text-muted-foreground">{c.mobile} · {c.address}</p>
//                         </div>
//                         <div className="flex gap-1">
//                             <button onClick={() => { setForm(c); setEditItem(c); }}
//                                 className="p-1 rounded hover:bg-muted">
//                                 <Edit className="h-3.5 w-3.5 text-muted-foreground" />
//                             </button>
//                             <button onClick={() => setDeleteId(c.id)}
//                                 className="p-1 rounded hover:bg-destructive/10">
//                                 <Trash2 className="h-3.5 w-3.5 text-destructive" />
//                             </button>
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             <Dialog open={showAdd || !!editItem} onOpenChange={(open) => {
//                 if (!open) { setShowAdd(false); setEditItem(null); setForm({}); }
//             }}>
//                 <DialogContent className="max-w-sm">
//                     <DialogHeader>
//                         <DialogTitle>{editItem ? 'Edit Company' : 'Add Company'}</DialogTitle>
//                     </DialogHeader>
//                     <div className="space-y-3 py-2">
//                         <div>
//                             <label className="text-xs font-medium text-muted-foreground mb-1 block">Company Name</label>
//                             <Input value={form.name || ''} autoFocus
//                                 onChange={(e) => setForm({ ...form, name: e.target.value })} />
//                         </div>
//                         <div>
//                             <label className="text-xs font-medium text-muted-foreground mb-1 block">Mobile</label>
//                             <Input value={form.mobile || ''}
//                                 onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
//                         </div>
//                         <div>
//                             <label className="text-xs font-medium text-muted-foreground mb-1 block">Address</label>
//                             <Input value={form.address || ''}
//                                 onChange={(e) => setForm({ ...form, address: e.target.value })} />
//                         </div>
//                     </div>
//                     <DialogFooter>
//                         <Button variant="outline" onClick={() => { setShowAdd(false); setEditItem(null); setForm({}); }}>
//                             Cancel
//                         </Button>
//                         <Button onClick={handleSave}>{editItem ? 'Update' : 'Add'}</Button>
//                     </DialogFooter>
//                 </DialogContent>
//             </Dialog>

//             <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
//                 onConfirm={() => { if (deleteId) onDelete(deleteId); setDeleteId(null); }} />
//         </div>
//     );
// }

// // ─────────────────────────────────────────
// // MAIN SETTINGS PAGE
// // ─────────────────────────────────────────
// function SettingsPage() {
//     const { isDark, toggle, setTheme } = useTheme();

//     // Settings state
//     const [vatPercent, setVatPercent] = useState('15');
//     const [vatDate, setVatDate] = useState('2026-04-01');

//     // Company profile state
//     const [companyName, setCompanyName] = useState('');
//     const [companyAddress, setCompanyAddress] = useState('');
//     const [companyTIN, setCompanyTIN] = useState('');
//     const [companyPhone, setCompanyPhone] = useState('');

//     // CRUD data state
//     const [categories, setCategories] = useState<Category[]>([]);
//     const [brands, setBrands] = useState<Brand[]>([]);
//     const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
//     const [companies, setCompanies] = useState<Company[]>([]);

//     useEffect(() => {
//         fetchSettings();
//         fetchCompanyProfile(); //fetch company profile
//         fetchCrudData();
//     }, []);

//     const fetchCompanyProfile = async () => {
//         try {
//             const res = await axios.get('/company_profile');
//             if (res.data) {
//                 setCompanyName(res.data.company_name || '');
//                 setCompanyAddress(res.data.address || '');
//                 setCompanyTIN(res.data.tin_number || '');
//                 setCompanyPhone(res.data.phone_number || '');
//             }
//         } catch (e) {
//             console.log("Error fetching company profile:", e);
//         }
//     };

//     const fetchSettings = async () => {
//         try {
//             const res = await axios.get('settings/all');
//             const s = res.data[0];
//             setTheme(s.theme === 1);
//             // setCompanyName(s.company_name);
//             // setCompanyAddress(s.company_address);
//             // setCompanyTIN(s.company_tin);
//             // setCompanyPhone(s.company_phone);
//             setVatPercent(s.current_vat_percentage);
//             setVatDate(s.vat_effective_date);
//         } catch (e) { console.log(e); }
//     };

//     // ✅ Load all CRUD data at once
//     const fetchCrudData = async () => {
//         try {
//             const [catRes, brandRes, unitRes, compRes] = await Promise.all([
//                 axios.get('/categories/all'),
//                 axios.get('/brands/all'),
//                 axios.get('/unit-types/all'),
//                 axios.get('/companies/all'),
//             ]);
//             setCategories(catRes.data);
//             setBrands(brandRes.data);
//             setUnitTypes(unitRes.data);
//             setCompanies(compRes.data);
//         } catch (e) { console.log(e); }
//     };

//     // ── Theme ──
//     const handleThemeChange = async () => {
//         const newTheme = !isDark;
//         setTheme(newTheme);
//         try { await axios.post('settings/change_theme', { theme: newTheme ? 1 : 0 }); }
//         catch (e) { console.log(e); }
//     };

//     // ── Company Profile ──
//     const handleCompanyProfile = async () => {
//         try {

//             const response = await axios.post('/company-profile/update', {
//                 company_name: companyName,
//                 address: companyAddress,
//                 tin_number: companyTIN,
//                 phone_number: companyPhone
//             });

//             await fetchCompanyProfile(); // Refresh company profile data after update

//             // const updatedData = response.data.data;

//             // setCompanyName(updatedData.company_name);
//             // setCompanyAddress(updatedData.address);
//             // setCompanyTIN(updatedData.tin_number);
//             // setCompanyPhone(updatedData.phone_number);

//             console.log("Changes saved and inputs updated!");

//         } catch (e) {
//             console.log("Company Profile Update Failed:", e);
//         }
//     };


//     // const handleCompanyProfile = async () => {
//     //     try {
//     //         await axios.post('settings/update_company_profile', { company_name: companyName, company_address: companyAddress, company_tin: companyTIN, company_phone: companyPhone });
//     //         fetchSettings();
//     //     } catch (e) { console.log(e); }
//     // };

//     // ── VAT ──
//     const handleVATSettings = async () => {
//         try {
//             await axios.post('settings/update_vat_settings', { current_vat_percentage: vatPercent, vat_effective_date: vatDate });
//             fetchSettings();
//         } catch (e) { console.log(e); }
//     };

//     // ── Categories CRUD ──
//     const addCategory = async (data: Partial<Category>) => {
//         try {
//             const res = await axios.post('/categories/store', data);
//             setCategories((p) => [...p, res.data]);
//         } catch (e) { console.log(e); }
//     };
//     const editCategory = async (id: number, data: Partial<Category>) => {
//         try {
//             const res = await axios.post(`/categories/update/${id}`, data);
//             setCategories((p) => p.map((c) => c.id === id ? res.data : c));
//         } catch (e) { console.log(e); }
//     };
//     const deleteCategory = async (id: number) => {
//         try {
//             await axios.delete(`/categories/delete/${id}`);
//             setCategories((p) => p.filter((c) => c.id !== id));
//         } catch (e) { console.log(e); }
//     };

//     // ── Brands CRUD ──
//     const addBrand = async (name: string) => {
//         try {
//             const res = await axios.post('/brands/store', { name });
//             setBrands((p) => [...p, res.data]);
//         } catch (e) { console.log(e); }
//     };
//     const editBrand = async (id: number, name: string) => {
//         try {
//             const res = await axios.post(`/brands/update/${id}`, { name });
//             setBrands((p) => p.map((b) => b.id === id ? res.data : b));
//         } catch (e) { console.log(e); }
//     };
//     const deleteBrand = async (id: number) => {
//         try {
//             await axios.delete(`/brands/delete/${id}`);
//             setBrands((p) => p.filter((b) => b.id !== id));
//         } catch (e) { console.log(e); }
//     };

//     // ── Unit Types CRUD ──
//     const addUnitType = async (name: string) => {
//         try {
//             const res = await axios.post('/unit-types/store', { name });
//             setUnitTypes((p) => [...p, res.data]);
//         } catch (e) { console.log(e); }
//     };
//     const editUnitType = async (id: number, name: string) => {
//         try {
//             const res = await axios.post(`/unit-types/update/${id}`, { name });
//             setUnitTypes((p) => p.map((u) => u.id === id ? res.data : u));
//         } catch (e) { console.log(e); }
//     };
//     const deleteUnitType = async (id: number) => {
//         try {
//             await axios.delete(`/unit-types/delete/${id}`);
//             setUnitTypes((p) => p.filter((u) => u.id !== id));
//         } catch (e) { console.log(e); }
//     };

//     // ── Companies CRUD ──
//     const addCompany = async (data: Partial<Company>) => {
//         try {
//             const res = await axios.post('/companies/store', data);
//             setCompanies((p) => [...p, res.data]);
//         } catch (e) { console.log(e); }
//     };
//     const editCompany = async (id: number, data: Partial<Company>) => {
//         try {
//             const res = await axios.post(`/companies/update/${id}`, data);
//             setCompanies((p) => p.map((c) => c.id === id ? res.data : c));
//         } catch (e) { console.log(e); }
//     };
//     const deleteCompany = async (id: number) => {
//         try {
//             await axios.delete(`/companies/delete/${id}`);
//             setCompanies((p) => p.filter((c) => c.id !== id));
//         } catch (e) { console.log(e); }
//     };

//     const roles = [
//         { role: 'Owner', permissions: ['Full Access', 'Manage Employees', 'View Reports', 'Settings', 'Billing', 'Products', 'Stock', 'GRN'] },
//         { role: 'Admin', permissions: ['Manage Employees', 'Products', 'Stock', 'GRN', 'Customers', 'Suppliers', 'Billing'] },
//         { role: 'Cashier', permissions: ['Billing', 'View Customers', 'Invoice History'] },
//     ];

//     return (
//         <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">

//             {/* Appearance */}
//             <div className="bg-card rounded-xl border border-border p-5">
//                 <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
//                     {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} Appearance
//                 </h3>
//                 <div className="flex items-center justify-between">
//                     <div>
//                         <p className="text-sm font-medium">Theme</p>
//                         <p className="text-xs text-muted-foreground">Toggle between light and dark mode</p>
//                     </div>
//                     <button onClick={handleThemeChange}
//                         className={`relative h-7 w-12 rounded-full transition-colors ${isDark ? 'bg-primary' : 'bg-muted'}`}>
//                         <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-card shadow transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0.5'}`} />
//                     </button>
//                 </div>
//             </div>

//             {/* Roles & Permissions */}
//             <div className="bg-card rounded-xl border border-border p-5">
//                 <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
//                     <Shield className="h-4 w-4" /> Roles & Permissions
//                 </h3>
//                 <div className="space-y-3">
//                     {roles.map((r) => (
//                         <div key={r.role} className="p-3 rounded-lg bg-muted/50">
//                             <p className="text-sm font-semibold mb-2">{r.role}</p>
//                             <div className="flex flex-wrap gap-1">
//                                 {r.permissions.map((p) => (
//                                     <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{p}</span>
//                                 ))}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             {/* Company Profile */}
//             <div className="bg-card rounded-xl border border-border p-5">
//                 <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
//                     <Building className="h-4 w-4" /> Company Profile
//                 </h3>
//                 <div className="space-y-3">
//                     <div>
//                         <label className="text-xs font-medium text-muted-foreground mb-1 block">Company Name</label>
//                         <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)}/>
//                     </div>
//                     <div>
//                         <label className="text-xs font-medium text-muted-foreground mb-1 block">Address</label>
//                         <Input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)}/>
//                     </div>
//                     <div>
//                         <label className="text-xs font-medium text-muted-foreground mb-1 block">Company TIN Number</label>
//                         <Input value={companyTIN} onChange={(e) => setCompanyTIN(e.target.value)}/>
//                     </div>
//                     <div>
//                         <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
//                         <Input value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
//                     </div>
//                     <Button onClick={handleCompanyProfile}>Save Changes</Button>
//                 </div>
//             </div>

//             {/* VAT Settings */}
//             <div className="bg-card rounded-xl border border-border p-5">
//                 <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
//                     <Receipt className="h-4 w-4" /> VAT Settings
//                 </h3>
//                 <div className="grid grid-cols-2 gap-3">
//                     <div>
//                         <label className="text-xs font-medium text-muted-foreground mb-1 block">Current VAT %</label>
//                         <Input type="number" value={vatPercent} onChange={(e) => setVatPercent(e.target.value)} />
//                     </div>
//                     <div>
//                         <label className="text-xs font-medium text-muted-foreground mb-1 block">Effective Date</label>
//                         <DatePicker value={vatDate} onChange={setVatDate} className="w-full" />
//                     </div>
//                 </div>
//                 <Button onClick={handleVATSettings} className="mt-3">Update VAT</Button>
//             </div>

//             {/* ✅ Categories CRUD */}
//             <CategorySection
//                 categories={categories}
//                 onAdd={addCategory}
//                 onEdit={editCategory}
//                 onDelete={deleteCategory}
//             />

//             {/* ✅ Brands CRUD */}
//             <SimpleListSection
//                 title="Brands"
//                 items={brands}
//                 onAdd={addBrand}
//                 onEdit={editBrand}
//                 onDelete={deleteBrand}
//             />

//             {/* ✅ Unit Types CRUD */}
//             <SimpleListSection
//                 title="Unit Types"
//                 items={unitTypes}
//                 onAdd={addUnitType}
//                 onEdit={editUnitType}
//                 onDelete={deleteUnitType}
//             />

//             {/* ✅ Supplier Companies CRUD */}
//             <CompaniesSection
//                 companies={companies}
//                 onAdd={addCompany}
//                 onEdit={editCompany}
//                 onDelete={deleteCompany}
//             />

//         </div>
//     );
// }

// export default function WrappedSettingsPage() {
//     return (
//         <>
//             <Head title="Settings" />
//             <SettingsPage />
//         </>
//     );
// }

// (WrappedSettingsPage as any).layout = (page: React.ReactNode) => <AppShell>{page}</AppShell>;

import { Head } from '@inertiajs/react';
import AppShell from '@/AppShell';
import React, { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sun, Moon, Shield, Building, Receipt, Plus, Edit, Trash2, Search, Wallet, Landmark } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { toast } from '@/components/ui/sonner';
import axios from 'axios';

interface DepositAccount { id: number; name: string; type: 'cash' | 'bank'; bank_name: string | null; account_number: string | null; is_active: boolean; }
interface Category  { id: number; name: string; description?: string; }
interface Brand          { id: number; name: string; }
interface UnitType       { id: number; name: string; }
interface ExpensesCategory { id: number; name: string; }
interface Company   { id: number; name: string; mobile: string; address: string; }
interface BusinessEntity { id: number; name: string; address: string | null; phone: string | null; email: string | null; vat_no: string | null; place_of_supply: string | null; is_active: boolean; is_vat_registered: boolean; }

// ── Reusable Simple List (Brand, UnitType) ──
function SimpleListSection({ title, items, onAdd, onEdit, onDelete }: {
    title: string;
    items: { id: number; name: string }[];
    onAdd:    (name: string) => void;
    onEdit:   (id: number, name: string) => void;
    onDelete: (id: number) => void;
}) {
    const [showAdd,  setShowAdd]  = useState(false);
    const [editItem, setEditItem] = useState<{ id: number; name: string } | null>(null);
    const [name,     setName]     = useState('');
    const [search,   setSearch]   = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [page,     setPage]     = useState(1);
    const PAGE_SIZE = 10;

    const filtered = items.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => setPage(1), [search]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleSave = () => {
        if (!name.trim()) return;
        if (editItem) { onEdit(editItem.id, name.trim()); setEditItem(null); }
        else          { onAdd(name.trim()); setShowAdd(false); }
        setName('');
    };

    return (
        <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">{title}</h3>
                <Button size="sm" variant="outline" className="gap-1 h-7 text-xs"
                    onClick={() => { setName(''); setShowAdd(true); }}>
                    <Plus className="h-3 w-3" /> Add
                </Button>
            </div>

            {/* Search */}
            <div className="relative mb-3">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Search ${title.toLowerCase()}...`}
                    className="pl-8 h-8 text-xs" />
            </div>

            {/* List */}
            <div className="space-y-1.5">
                {paged.length === 0 && (
                    <p className="text-xs text-muted-foreground py-2">
                        {search ? 'No results found.' : `No ${title.toLowerCase()} added yet.`}
                    </p>
                )}
                {paged.map((item) => (
                    <div key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                        <span className="text-sm">{item.name}</span>
                        <div className="flex gap-1">
                            <button onClick={() => { setName(item.name); setEditItem(item); }}
                                className="p-1 rounded hover:bg-muted">
                                <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                            <button onClick={() => setDeleteId(item.id)}
                                className="p-1 rounded hover:bg-destructive/10">
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                        {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                    </span>
                    <Pagination className="w-auto mx-0">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href="#"
                                    onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                                    className={page === 1 ? 'pointer-events-none opacity-40' : 'cursor-pointer'} />
                            </PaginationItem>
                            <PaginationItem>
                                <span className="text-xs px-2">{page} / {totalPages}</span>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext href="#"
                                    onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
                                    className={page === totalPages ? 'pointer-events-none opacity-40' : 'cursor-pointer'} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            <Dialog open={showAdd || !!editItem} onOpenChange={(open) => {
                if (!open) { setShowAdd(false); setEditItem(null); setName(''); }
            }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{editItem ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()} autoFocus />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setShowAdd(false); setEditItem(null); setName(''); }}>Cancel</Button>
                        <Button onClick={handleSave}>{editItem ? 'Update' : 'Add'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
                onConfirm={() => { if (deleteId) onDelete(deleteId); setDeleteId(null); }} />
        </div>
    );
}

// ── Category Section ──
function CategorySection({ categories, onAdd, onEdit, onDelete }: {
    categories: Category[];
    onAdd:    (data: Partial<Category>) => void;
    onEdit:   (id: number, data: Partial<Category>) => void;
    onDelete: (id: number) => void;
}) {
    const [showAdd,  setShowAdd]  = useState(false);
    const [editItem, setEditItem] = useState<Category | null>(null);
    const [form,     setForm]     = useState<Partial<Category>>({});
    const [search,   setSearch]   = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [page,     setPage]     = useState(1);
    const PAGE_SIZE = 10;

    const filtered = categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => setPage(1), [search]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleSave = () => {
        if (!form.name?.trim()) return;
        if (editItem) { onEdit(editItem.id, form); setEditItem(null); }
        else          { onAdd(form); setShowAdd(false); }
        setForm({});
    };

    return (
        <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Categories</h3>
                <Button size="sm" variant="outline" className="gap-1 h-7 text-xs"
                    onClick={() => { setForm({}); setShowAdd(true); }}>
                    <Plus className="h-3 w-3" /> Add
                </Button>
            </div>

            {/* Search */}
            <div className="relative mb-3">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search categories..."
                    className="pl-8 h-8 text-xs" />
            </div>

            {/* List */}
            <div className="space-y-1.5">
                {paged.length === 0 && (
                    <p className="text-xs text-muted-foreground py-2">
                        {search ? 'No results found.' : 'No categories added yet.'}
                    </p>
                )}
                {paged.map((cat) => (
                    <div key={cat.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                        <div>
                            <p className="text-sm font-medium">{cat.name}</p>
                            {cat.description && (
                                <p className="text-xs text-muted-foreground">{cat.description}</p>
                            )}
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => { setForm(cat); setEditItem(cat); }}
                                className="p-1 rounded hover:bg-muted">
                                <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                            <button onClick={() => setDeleteId(cat.id)}
                                className="p-1 rounded hover:bg-destructive/10">
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                        {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                    </span>
                    <Pagination className="w-auto mx-0">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href="#"
                                    onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                                    className={page === 1 ? 'pointer-events-none opacity-40' : 'cursor-pointer'} />
                            </PaginationItem>
                            <PaginationItem>
                                <span className="text-xs px-2">{page} / {totalPages}</span>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext href="#"
                                    onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
                                    className={page === totalPages ? 'pointer-events-none opacity-40' : 'cursor-pointer'} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            <Dialog open={showAdd || !!editItem} onOpenChange={(open) => {
                if (!open) { setShowAdd(false); setEditItem(null); setForm({}); }
            }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{editItem ? 'Edit Category' : 'Add Category'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
                            <Input value={form.name || ''} autoFocus
                                onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Description (optional)</label>
                            <Input value={form.description || ''}
                                onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setShowAdd(false); setEditItem(null); setForm({}); }}>Cancel</Button>
                        <Button onClick={handleSave}>{editItem ? 'Update' : 'Add'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
                onConfirm={() => { if (deleteId) onDelete(deleteId); setDeleteId(null); }} />
        </div>
    );
}

// ── Companies Section ──
function CompaniesSection({ companies, onAdd, onEdit, onDelete }: {
    companies: Company[];
    onAdd:    (data: Partial<Company>) => void;
    onEdit:   (id: number, data: Partial<Company>) => void;
    onDelete: (id: number) => void;
}) {
    const [showAdd,  setShowAdd]  = useState(false);
    const [editItem, setEditItem] = useState<Company | null>(null);
    const [form,     setForm]     = useState<Partial<Company>>({});
    const [search,   setSearch]   = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [page,     setPage]     = useState(1);
    const PAGE_SIZE = 10;

    const filtered = companies.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.address.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => setPage(1), [search]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleSave = () => {
        if (!form.name?.trim()) return;
        if (editItem) { onEdit(editItem.id, form); setEditItem(null); }
        else          { onAdd(form); setShowAdd(false); }
        setForm({});
    };

    return (
        <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Supplier Companies</h3>
                <Button size="sm" variant="outline" className="gap-1 h-7 text-xs"
                    onClick={() => { setForm({}); setShowAdd(true); }}>
                    <Plus className="h-3 w-3" /> Add
                </Button>
            </div>

            {/* Search */}
            <div className="relative mb-3">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search companies..."
                    className="pl-8 h-8 text-xs" />
            </div>

            {/* List */}
            <div className="space-y-1.5">
                {paged.length === 0 && (
                    <p className="text-xs text-muted-foreground py-2">
                        {search ? 'No results found.' : 'No companies added yet.'}
                    </p>
                )}
                {paged.map((c) => (
                    <div key={c.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                        <div>
                            <p className="text-sm font-medium">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.mobile} · {c.address}</p>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => { setForm(c); setEditItem(c); }}
                                className="p-1 rounded hover:bg-muted">
                                <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                            <button onClick={() => setDeleteId(c.id)}
                                className="p-1 rounded hover:bg-destructive/10">
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                        {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                    </span>
                    <Pagination className="w-auto mx-0">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href="#"
                                    onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                                    className={page === 1 ? 'pointer-events-none opacity-40' : 'cursor-pointer'} />
                            </PaginationItem>
                            <PaginationItem>
                                <span className="text-xs px-2">{page} / {totalPages}</span>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext href="#"
                                    onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
                                    className={page === totalPages ? 'pointer-events-none opacity-40' : 'cursor-pointer'} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            <Dialog open={showAdd || !!editItem} onOpenChange={(open) => {
                if (!open) { setShowAdd(false); setEditItem(null); setForm({}); }
            }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{editItem ? 'Edit Company' : 'Add Company'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Company Name</label>
                            <Input value={form.name || ''} autoFocus
                                onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Mobile</label>
                            <Input value={form.mobile || ''}
                                onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Address</label>
                            <Input value={form.address || ''}
                                onChange={(e) => setForm({ ...form, address: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setShowAdd(false); setEditItem(null); setForm({}); }}>Cancel</Button>
                        <Button onClick={handleSave}>{editItem ? 'Update' : 'Add'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
                onConfirm={() => { if (deleteId) onDelete(deleteId); setDeleteId(null); }} />
        </div>
    );
}

// ── MAIN SETTINGS PAGE ──
function SettingsPage() {
    const { isDark, setTheme } = useTheme();

    // VAT state
    const [vatPercent,       setVatPercent]       = useState('');
    const [vatDate,          setVatDate]          = useState('');
    const [currentVatInfo,   setCurrentVatInfo]   = useState<{ vat_percentage: string; from_date: string } | null>(null);

    const [categories,        setCategories]        = useState<Category[]>([]);
    const [brands,             setBrands]             = useState<Brand[]>([]);
    const [unitTypes,          setUnitTypes]          = useState<UnitType[]>([]);
    const [expensesCategories, setExpensesCategories] = useState<ExpensesCategory[]>([]);

    // Business Entities
    const [businessEntities,   setBusinessEntities]   = useState<BusinessEntity[]>([]);
    const [entityModal,        setEntityModal]        = useState(false);
    const [editingEntity,      setEditingEntity]      = useState<BusinessEntity | null>(null);
    const [entityForm,         setEntityForm]         = useState({ name: '', address: '', phone: '', email: '', is_vat_registered: false, vat_no: '', place_of_supply: '' });
    const [entityDeleteId,     setEntityDeleteId]     = useState<number | null>(null);

    // Deposit Accounts
    const [depositAccounts,    setDepositAccounts]    = useState<DepositAccount[]>([]);
    const [depositModal,       setDepositModal]       = useState(false);
    const [editingDeposit,     setEditingDeposit]     = useState<DepositAccount | null>(null);
    const [depositForm,        setDepositForm]        = useState({ name: '', type: 'cash' as 'cash' | 'bank', bank_name: '', account_number: '' });
    const [depositDeleteId,    setDepositDeleteId]    = useState<number | null>(null);

    useEffect(() => {
        fetchTheme();
        fetchCurrentVat();
        fetchCrudData();
        fetchBusinessEntities();
        fetchDepositAccounts();
    }, []);

    const fetchTheme = async () => {
        try {
            const res = await axios.get('settings/all');
            const s   = res.data[0];
            if (s) setTheme(s.theme === 1);
        } catch (e) { console.log(e); }
    };

    const fetchCurrentVat = async () => {
        try {
            const res = await axios.get('/vat/current');
            if (res.data) setCurrentVatInfo(res.data);
        } catch (e) { console.log(e); }
    };

    const fetchCrudData = async () => {
        try {
            const [catRes, brandRes, unitRes, expCatRes] = await Promise.all([
                axios.get('/categories/all'),
                axios.get('/brands/all'),
                axios.get('/unit-types/all'),
                axios.get('/expenses-category/all'),
            ]);
            setCategories(catRes.data);
            setBrands(brandRes.data);
            setUnitTypes(unitRes.data);
            setExpensesCategories(expCatRes.data);
        } catch (e) { console.log(e); }
    };

    const handleThemeChange = async () => {
        const newTheme = !isDark;
        setTheme(newTheme);
        try { await axios.post('settings/change_theme', { theme: newTheme ? 1 : 0 }); }
        catch (e) { console.log(e); }
    };

    const handleVATSettings = async () => {
        try {
            await axios.post('settings/update_vat_settings', {
                vat_percentage: vatPercent,
                effective_date: vatDate,
            });
            await fetchCurrentVat();
            setVatPercent('');
            setVatDate('');
            toast.success('VAT updated successfully!');
        } catch (e) { console.log(e); }
    };

    // Categories
    const addCategory    = async (data: Partial<Category>) => { try { const res = await axios.post('/categories/store', data); setCategories((p) => [...p, res.data]); } catch (e) { console.log(e); } };
    const editCategory   = async (id: number, data: Partial<Category>) => { try { const res = await axios.post(`/categories/update/${id}`, data); setCategories((p) => p.map((c) => c.id === id ? res.data : c)); } catch (e) { console.log(e); } };
    const deleteCategory = async (id: number) => { try { await axios.delete(`/categories/delete/${id}`); setCategories((p) => p.filter((c) => c.id !== id)); } catch (e) { console.log(e); } };

    // Brands
    const addBrand    = async (name: string) => { try { const res = await axios.post('/brands/store', { name }); setBrands((p) => [...p, res.data]); } catch (e) { console.log(e); } };
    const editBrand   = async (id: number, name: string) => { try { const res = await axios.post(`/brands/update/${id}`, { name }); setBrands((p) => p.map((b) => b.id === id ? res.data : b)); } catch (e) { console.log(e); } };
    const deleteBrand = async (id: number) => { try { await axios.delete(`/brands/delete/${id}`); setBrands((p) => p.filter((b) => b.id !== id)); } catch (e) { console.log(e); } };

    // Unit Types
    const addUnitType    = async (name: string) => { try { const res = await axios.post('/unit-types/store', { name }); setUnitTypes((p) => [...p, res.data]); } catch (e) { console.log(e); } };
    const editUnitType   = async (id: number, name: string) => { try { const res = await axios.post(`/unit-types/update/${id}`, { name }); setUnitTypes((p) => p.map((u) => u.id === id ? res.data : u)); } catch (e) { console.log(e); } };
    const deleteUnitType = async (id: number) => { try { await axios.delete(`/unit-types/delete/${id}`); setUnitTypes((p) => p.filter((u) => u.id !== id)); } catch (e) { console.log(e); } };

    const addExpensesCategory    = async (name: string) => { try { const res = await axios.post('/expenses-category/store', { name }); setExpensesCategories((p) => [...p, res.data]); } catch (e) { console.log(e); } };
    const editExpensesCategory   = async (id: number, name: string) => { try { const res = await axios.post(`/expenses-category/update/${id}`, { name }); setExpensesCategories((p) => p.map((u) => u.id === id ? res.data : u)); } catch (e) { console.log(e); } };
    const deleteExpensesCategory = async (id: number) => { try { await axios.delete(`/expenses-category/delete/${id}`); setExpensesCategories((p) => p.filter((u) => u.id !== id)); } catch (e) { console.log(e); } };

    // Business Entities
    const fetchBusinessEntities = async () => {
        try {
            const res = await axios.get('/business-entities/all');
            setBusinessEntities(res.data);
        } catch (e) { console.log(e); }
    };

    const openEntityModal = (entity?: BusinessEntity) => {
        if (entity) {
            setEditingEntity(entity);
            setEntityForm({
                name: entity.name,
                address: entity.address || '',
                phone: entity.phone || '',
                email: entity.email || '',
                is_vat_registered: !!entity.is_vat_registered,
                vat_no: entity.vat_no || '',
                place_of_supply: entity.place_of_supply || '',
            });
        } else {
            setEditingEntity(null);
            setEntityForm({ name: '', address: '', phone: '', email: '', is_vat_registered: false, vat_no: '', place_of_supply: '' });
        }
        setEntityModal(true);
    };

    const handleEntitySave = async () => {
        if (!entityForm.name.trim()) { toast.error('Name is required'); return; }
        const payload = {
            ...entityForm,
            vat_no: entityForm.is_vat_registered ? entityForm.vat_no : null,
            place_of_supply: entityForm.is_vat_registered ? entityForm.place_of_supply : null,
        };
        try {
            if (editingEntity) {
                const res = await axios.post(`/business-entities/update/${editingEntity.id}`, payload);
                setBusinessEntities((p) => p.map((e) => e.id === editingEntity.id ? res.data : e));
                toast.success('Business entity updated');
            } else {
                const res = await axios.post('/business-entities/store', payload);
                setBusinessEntities((p) => [...p, res.data]);
                toast.success('Business entity added');
            }
            setEntityModal(false);
        } catch (error: any) {
            const msg = error.response?.data?.errors?.name?.[0] || error.response?.data?.message || 'Failed to save';
            toast.error(msg);
        }
    };

    const handleEntityDelete = async () => {
        if (!entityDeleteId) return;
        try {
            await axios.delete(`/business-entities/delete/${entityDeleteId}`);
            setBusinessEntities((p) => p.filter((e) => e.id !== entityDeleteId));
            setEntityDeleteId(null);
            toast.success('Business entity removed');
        } catch (e) { toast.error('Failed to delete'); }
    };

    // Deposit Accounts
    const fetchDepositAccounts = async () => {
        try {
            const res = await axios.get('/deposit-accounts/all');
            setDepositAccounts(res.data);
        } catch (e) { console.log(e); }
    };

    const openDepositModal = (acc?: DepositAccount) => {
        if (acc) {
            setEditingDeposit(acc);
            setDepositForm({ name: acc.name, type: acc.type, bank_name: acc.bank_name || '', account_number: acc.account_number || '' });
        } else {
            setEditingDeposit(null);
            setDepositForm({ name: '', type: 'cash', bank_name: '', account_number: '' });
        }
        setDepositModal(true);
    };

    const handleDepositSave = async () => {
        if (!depositForm.name.trim()) { toast.error('Name is required'); return; }
        try {
            if (editingDeposit) {
                const res = await axios.post(`/deposit-accounts/update/${editingDeposit.id}`, depositForm);
                setDepositAccounts((p) => p.map((a) => a.id === editingDeposit.id ? res.data : a));
                toast.success('Account updated');
            } else {
                const res = await axios.post('/deposit-accounts/store', depositForm);
                setDepositAccounts((p) => [...p, res.data]);
                toast.success('Account added');
            }
            setDepositModal(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save');
        }
    };

    const handleDepositDelete = async () => {
        if (!depositDeleteId) return;
        try {
            await axios.delete(`/deposit-accounts/delete/${depositDeleteId}`);
            setDepositAccounts((p) => p.filter((a) => a.id !== depositDeleteId));
            setDepositDeleteId(null);
            toast.success('Account deactivated');
        } catch (e) { toast.error('Failed to delete'); }
    };

    const roles = [
        { role: 'Owner',   permissions: ['Full Access', 'Manage Employees', 'View Reports', 'Settings', 'Billing', 'Products', 'Stock', 'GRN'] },
        { role: 'Admin',   permissions: ['Manage Employees', 'Products', 'Stock', 'GRN', 'Customers', 'Suppliers', 'Billing'] },
        { role: 'Cashier', permissions: ['Billing', 'View Customers', 'Invoice History'] },
    ];

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">

            {/* Appearance */}
            <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} Appearance
                </h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium">Theme</p>
                        <p className="text-xs text-muted-foreground">Toggle between light and dark mode</p>
                    </div>
                    <button onClick={handleThemeChange}
                        className={`relative h-7 w-12 rounded-full transition-colors ${isDark ? 'bg-primary' : 'bg-muted'}`}>
                        <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-card shadow transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                </div>
            </div>

            {/* Roles & Permissions */}
            <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Roles & Permissions
                </h3>
                <div className="space-y-3">
                    {roles.map((r) => (
                        <div key={r.role} className="p-3 rounded-lg bg-muted/50">
                            <p className="text-sm font-semibold mb-2">{r.role}</p>
                            <div className="flex flex-wrap gap-1">
                                {r.permissions.map((p) => (
                                    <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{p}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Business Entities */}
            <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Building className="h-4 w-4" /> Business Entities
                    </h3>
                    <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => openEntityModal()}>
                        <Plus className="h-3 w-3" /> Add
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                    Manage companies that issue invoices. Each invoice can be assigned to a business entity.
                </p>
                <div className="space-y-2">
                    {businessEntities.length === 0 && (
                        <p className="text-xs text-muted-foreground py-2">No business entities added yet.</p>
                    )}
                    {businessEntities.map((entity) => (
                        <div key={entity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium">{entity.name}</p>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${entity.is_vat_registered ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                        {entity.is_vat_registered ? 'VAT' : 'Non-VAT'}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">{[entity.phone, entity.email, entity.is_vat_registered ? entity.vat_no : null].filter(Boolean).join(' | ')}</p>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => openEntityModal(entity)} className="p-1 rounded hover:bg-muted">
                                    <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                                </button>
                                <button onClick={() => setEntityDeleteId(entity.id)} className="p-1 rounded hover:bg-destructive/10">
                                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Business Entity Modal */}
            <Dialog open={entityModal} onOpenChange={setEntityModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingEntity ? 'Edit' : 'Add'} Business Entity</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Company Name *</label>
                            <Input value={entityForm.name} onChange={(e) => setEntityForm((f) => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Address</label>
                            <Input value={entityForm.address} onChange={(e) => setEntityForm((f) => ({ ...f, address: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                                <Input value={entityForm.phone} onChange={(e) => setEntityForm((f) => ({ ...f, phone: e.target.value }))} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                                <Input value={entityForm.email} onChange={(e) => setEntityForm((f) => ({ ...f, email: e.target.value }))} />
                            </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={entityForm.is_vat_registered}
                                onChange={(e) => setEntityForm((f) => ({ ...f, is_vat_registered: e.target.checked }))}
                                className="rounded" />
                            <span className="text-sm">VAT Registered Company</span>
                        </label>

                        {entityForm.is_vat_registered && (
                            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                                <p className="col-span-2 text-xs font-semibold text-muted-foreground">VAT Details</p>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">VAT Number</label>
                                    <Input value={entityForm.vat_no} onChange={(e) => setEntityForm((f) => ({ ...f, vat_no: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Place of Supply</label>
                                    <Input value={entityForm.place_of_supply} onChange={(e) => setEntityForm((f) => ({ ...f, place_of_supply: e.target.value }))} />
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEntityModal(false)}>Cancel</Button>
                        <Button onClick={handleEntitySave}>{editingEntity ? 'Update' : 'Add'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog open={!!entityDeleteId} onConfirm={handleEntityDelete}
                onClose={() => setEntityDeleteId(null)}
                title="Delete Business Entity"
                message="This will deactivate the business entity. Existing invoices will retain their assignment." />

            {/* Deposit Accounts */}
            <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Wallet className="h-4 w-4" /> Deposit Accounts
                    </h3>
                    <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => openDepositModal()}>
                        <Plus className="h-3 w-3" /> Add
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                    Manage where received payments are deposited — petty cash or bank accounts.
                </p>
                <div className="space-y-2">
                    {depositAccounts.length === 0 && (
                        <p className="text-xs text-muted-foreground py-2">No deposit accounts added yet.</p>
                    )}
                    {depositAccounts.map((acc) => (
                        <div key={acc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                                {acc.type === 'cash' ? (
                                    <Wallet className="h-4 w-4 text-green-600" />
                                ) : (
                                    <Landmark className="h-4 w-4 text-blue-600" />
                                )}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium">{acc.name}</p>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                            acc.type === 'cash' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                            {acc.type}
                                        </span>
                                    </div>
                                    {acc.type === 'bank' && acc.bank_name && (
                                        <p className="text-xs text-muted-foreground">{acc.bank_name}{acc.account_number ? ` — ${acc.account_number}` : ''}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => openDepositModal(acc)} className="p-1 rounded hover:bg-muted">
                                    <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                                </button>
                                <button onClick={() => setDepositDeleteId(acc.id)} className="p-1 rounded hover:bg-destructive/10">
                                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Deposit Account Modal */}
            <Dialog open={depositModal} onOpenChange={setDepositModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingDeposit ? 'Edit' : 'Add'} Deposit Account</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Account Name *</label>
                            <Input value={depositForm.name} onChange={(e) => setDepositForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Petty Cash, Commercial Bank" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                            <Select value={depositForm.type} onValueChange={(v: 'cash' | 'bank') => setDepositForm((f) => ({ ...f, type: v }))}>
                                <SelectTrigger className="w-full h-9 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash (Petty Cash)</SelectItem>
                                    <SelectItem value="bank">Bank</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {depositForm.type === 'bank' && (
                            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                                <p className="col-span-2 text-xs font-semibold text-muted-foreground">Bank Details</p>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Bank Name</label>
                                    <Input value={depositForm.bank_name} onChange={(e) => setDepositForm((f) => ({ ...f, bank_name: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Account Number</label>
                                    <Input value={depositForm.account_number} onChange={(e) => setDepositForm((f) => ({ ...f, account_number: e.target.value }))} />
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDepositModal(false)}>Cancel</Button>
                        <Button onClick={handleDepositSave}>{editingDeposit ? 'Update' : 'Add'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog open={!!depositDeleteId} onConfirm={handleDepositDelete}
                onClose={() => setDepositDeleteId(null)}
                title="Deactivate Deposit Account"
                message="This account will be deactivated. Existing records will retain their assignment." />

            {/* VAT Settings */}
            <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Receipt className="h-4 w-4" /> VAT Settings
                </h3>
                {currentVatInfo ? (
                    <div className="mb-4 rounded-lg border border-border bg-muted/40 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                            Current VAT Rate (Today)
                        </p>
                        <div className="flex items-baseline gap-3">
                            <span className="text-2xl font-bold text-primary">{currentVatInfo.vat_percentage}%</span>
                            <span className="text-xs text-muted-foreground">effective from {currentVatInfo.from_date}</span>
                        </div>
                    </div>
                ) : (
                    <div className="mb-4 rounded-lg border border-border bg-muted/40 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                            Current VAT Rate (Today)
                        </p>
                        <p className="text-sm text-muted-foreground">No VAT configured yet.</p>
                    </div>
                )}
                <p className="text-xs text-muted-foreground mb-3">
                    Setting a new VAT will close the current record and start a new one from the effective date.
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">New VAT %</label>
                        <Input type="number" value={vatPercent} onChange={(e) => setVatPercent(e.target.value)} placeholder="e.g. 18" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Effective Date</label>
                        <DatePicker value={vatDate} onChange={setVatDate} className="w-full" />
                    </div>
                </div>
                <Button onClick={handleVATSettings} className="mt-3" disabled={!vatPercent || !vatDate}>Update VAT</Button>
            </div>

            <CategorySection  categories={categories} onAdd={addCategory}  onEdit={editCategory}  onDelete={deleteCategory} />
            <SimpleListSection title="Brands"              items={brands}             onAdd={addBrand}             onEdit={editBrand}             onDelete={deleteBrand} />
            <SimpleListSection title="Unit Types"           items={unitTypes}          onAdd={addUnitType}          onEdit={editUnitType}          onDelete={deleteUnitType} />
            <SimpleListSection title="Expense Categories"   items={expensesCategories} onAdd={addExpensesCategory}  onEdit={editExpensesCategory}  onDelete={deleteExpensesCategory} />

        </div>
    );
}

export default function WrappedSettingsPage() {
    return (
        <>
            <Head title="Settings" />
            <SettingsPage />
        </>
    );
}

(WrappedSettingsPage as any).layout = (page: React.ReactNode) => <AppShell>{page}</AppShell>;