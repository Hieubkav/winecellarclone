'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Pencil, Trash2, Search, Loader2, X } from 'lucide-react';
import { Button, Card, Input, Label, Badge, Skeleton } from '../components/ui';
import {
  fetchAdminUsers,
  createUser,
  updateUser,
  deleteUser,
  AdminUser,
} from '@/lib/api/admin';
import { toast } from 'sonner';

interface UserModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

function UserModal({ user, isOpen, onClose, onSave }: UserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setPassword('');
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data: Record<string, unknown> = { name, email };
      if (password) {
        data.password = password;
      }

      if (user) {
        const res = await updateUser(user.id, data);
        if (res.success) {
          toast.success(res.message);
          onSave();
          onClose();
        }
      } else {
        if (!password) {
          toast.error('Vui lòng nhập mật khẩu');
          setIsSubmitting(false);
          return;
        }
        const res = await createUser(data);
        if (res.success) {
          toast.success(res.message);
          onSave();
          onClose();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {user ? 'Sửa người dùng' : 'Thêm người dùng'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Mật khẩu {user && <span className="text-slate-400">(để trống nếu không đổi)</span>}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={user ? '••••••••' : 'Nhập mật khẩu'}
              required={!user}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Đang lưu...
                </>
              ) : (
                'Lưu'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page, per_page: 15 };
      if (search) params.search = search;

      const res = await fetchAdminUsers(params);
      setUsers(res.data);
      setMeta(res.meta);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;

    setDeletingId(id);
    try {
      const res = await deleteUser(id);
      if (res.success) {
        toast.success(res.message);
        loadUsers();
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể xóa người dùng');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Users size={24} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Quản lý Users</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {meta.total} người dùng
            </p>
          </div>
        </div>

        <Button onClick={handleAdd} className="gap-2">
          <Plus size={16} />
          Thêm user
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b dark:border-slate-700">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên hoặc email..."
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">
              Tìm
            </Button>
          </form>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Không có người dùng nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left p-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                    ID
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                    Tên
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                    Email
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                    Xác thực
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                    Ngày tạo
                  </th>
                  <th className="text-right p-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  >
                    <td className="p-3 text-sm text-slate-600 dark:text-slate-300">
                      {user.id}
                    </td>
                    <td className="p-3 text-sm font-medium text-slate-900 dark:text-white">
                      {user.name}
                    </td>
                    <td className="p-3 text-sm text-slate-600 dark:text-slate-300">
                      {user.email}
                    </td>
                    <td className="p-3">
                      {user.email_verified_at ? (
                        <Badge variant="success">Đã xác thực</Badge>
                      ) : (
                        <Badge variant="secondary">Chưa</Badge>
                      )}
                    </td>
                    <td className="p-3 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(user)}
                          title="Sửa"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user.id)}
                          disabled={deletingId === user.id}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Xóa"
                        >
                          {deletingId === user.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.last_page > 1 && (
          <div className="p-4 border-t dark:border-slate-700 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Trang {meta.current_page} / {meta.last_page}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </Card>

      <UserModal
        user={editingUser}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={loadUsers}
      />
    </div>
  );
}
