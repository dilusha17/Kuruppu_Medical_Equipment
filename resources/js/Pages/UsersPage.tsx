import { Head } from '@inertiajs/react';
import AppShell from '@/AppShell';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SearchBar from '@/components/shared/SearchBar';
import Modal from '@/components/shared/Modal';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Plus, Edit, Trash2, Power } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface UserRow {
    id: number;
    name: string;
    user_name: string;
    role: 'owner' | 'admin' | 'cashier';
    designation: string | null;
    mobile: string;
    address: string;
    nic: string;
    status: number;
    hiring_date: string | null;
}

interface FormState {
    name: string;
    user_name: string;
    password: string;
    password_confirmation: string;
    mobile: string;
    address: string;
    designation: string;
    nic: string;
    hiring_date: string;
    role: 'owner' | 'admin' | 'cashier';
    status: boolean;
}

const emptyForm: FormState = {
    name: '', user_name: '', password: '', password_confirmation: '',
    mobile: '', address: '', designation: '', nic: '', hiring_date: '',
    role: 'cashier', status: true,
};

const roleBadge = (role: string) => {
    if (role === 'owner') return 'bg-primary/10 text-primary';
    if (role === 'admin') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    return 'bg-muted text-muted-foreground';
};

function UsersPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<UserRow[]>([]);
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editUser, setEditUser] = useState<UserRow | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/users/all');
            setUsers(res.data);
        } catch (e: any) { console.log(e.response?.data); }
    };

    const filtered = users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.user_name.toLowerCase().includes(search.toLowerCase())
    );

    const openEdit = (u: UserRow) => {
        setForm({
            name: u.name, user_name: u.user_name, password: '', password_confirmation: '',
            mobile: u.mobile, address: u.address || '', designation: u.designation || '', nic: u.nic || '',
            hiring_date: u.hiring_date || '', role: u.role, status: !!u.status,
        });
        setEditUser(u);
    };

    const closeModal = () => { setShowAdd(false); setEditUser(null); setForm(emptyForm); };

    const handleSave = async () => {
        if (!form.name || !form.user_name || !form.mobile || !form.address || !form.nic) {
            toast.error('Please fill all required fields.'); return;
        }
        if (!editUser && !form.password) { toast.error('Password is required for a new user.'); return; }

        setSaving(true);
        const payload = {
            name: form.name, user_name: form.user_name,
            password: form.password || undefined,
            password_confirmation: form.password_confirmation || undefined,
            mobile: form.mobile, address: form.address,
            designation: form.designation || null, nic: form.nic,
            hiring_date: form.hiring_date || null,
            role: form.role, status: form.status ? 1 : 0,
        };

        try {
            if (editUser) {
                const res = await axios.post(`/users/update/${editUser.id}`, payload);
                setUsers((prev) => prev.map((u) => u.id === editUser.id ? res.data : u));
                toast.success('User updated.');
            } else {
                const res = await axios.post('/users/store', payload);
                setUsers((prev) => [res.data, ...prev]);
                toast.success('User created.');
            }
            closeModal();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save user.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/users/delete/${deleteId}`);
            setUsers((prev) => prev.filter((u) => u.id !== deleteId));
            toast.success('User deleted.');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete user.');
        } finally {
            setDeleteId(null);
        }
    };

    const handleToggleStatus = async (u: UserRow) => {
        try {
            const res = await axios.post(`/users/toggle/${u.id}`);
            setUsers((prev) => prev.map((x) => x.id === u.id ? res.data : x));
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update status.');
        }
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="w-full sm:w-72">
                    <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />
                </div>
                <Button onClick={() => { setForm(emptyForm); setShowAdd(true); }} className="gap-2">
                    <Plus className="h-4 w-4" /> Add User
                </Button>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Name</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Username</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Role</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Designation</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Mobile</th>
                                <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-10 text-sm text-muted-foreground">No users found.</td></tr>
                            ) : filtered.map((u) => (
                                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                                    <td className="px-4 py-3 text-sm font-medium">{u.name}</td>
                                    <td className="px-4 py-3 text-sm font-mono">{u.user_name}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${roleBadge(u.role)}`}>{u.role}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{u.designation || '—'}</td>
                                    <td className="px-4 py-3 text-sm">{u.mobile}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={cn('text-xs px-2 py-0.5 rounded-full',
                                            u.status ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                     : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>
                                            {u.status ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => handleToggleStatus(u)}
                                                disabled={currentUser?.id === u.id}
                                                title={u.status ? 'Deactivate' : 'Activate'}
                                                className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed">
                                                <Power className="h-3.5 w-3.5" />
                                            </button>
                                            <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-muted">
                                                <Edit className="h-3.5 w-3.5" />
                                            </button>
                                            <button onClick={() => setDeleteId(u.id)}
                                                disabled={currentUser?.id === u.id}
                                                className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive disabled:opacity-30 disabled:cursor-not-allowed">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add / Edit User Modal */}
            <Modal open={showAdd || !!editUser} onClose={closeModal} title={editUser ? 'Update User' : 'Add User'} size="lg">
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Username</label>
                            <Input value={form.user_name} onChange={(e) => setForm({ ...form, user_name: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                Password {editUser && <span className="text-muted-foreground">(leave blank to keep current)</span>}
                            </label>
                            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Confirm Password</label>
                            <Input type="password" value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Mobile</label>
                            <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">NIC</label>
                            <Input value={form.nic} onChange={(e) => setForm({ ...form, nic: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Address</label>
                        <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Designation</label>
                            <Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Hiring Date</label>
                            <DatePicker value={form.hiring_date} onChange={(v) => setForm({ ...form, hiring_date: v })} className="w-full" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
                            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as FormState['role'] })}>
                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="owner">Owner</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="cashier">Cashier</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end pb-1.5">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={form.status} onChange={(e) => setForm({ ...form, status: e.target.checked })} />
                                <span className="text-sm">Active</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={closeModal}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving}>{editUser ? 'Update' : 'Add'} User</Button>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
                title="Delete User" message="Are you sure you want to delete this user? This action cannot be undone." />
        </div>
    );
}

export default function WrappedUsersPage() {
    return (
        <>
            <Head title="Manage Users" />
            <UsersPage />
        </>
    );
}

(WrappedUsersPage as any).layout = (page: React.ReactNode) => <AppShell>{page}</AppShell>;
