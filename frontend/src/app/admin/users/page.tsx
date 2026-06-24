"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Card, Badge, Button, Avatar } from "@/components/ui";
import { IconCheck, IconX, IconBan, IconUserCheck, IconShieldCheck } from "@tabler/icons-react";

export default function AdminUsersPage() {
  const { accessToken } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/admin/users`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const verifyUser = async (id: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/admin/users/${id}/verify`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const banUser = async (id: string) => {
    const reason = prompt("Lý do khóa tài khoản:");
    if (!reason) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/admin/users/${id}/ban`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const unbanUser = async (id: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/admin/users/${id}/unban`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-heading)]">Quản lý Người Dùng</h1>
      </div>

      <Card className="p-0 bg-surface-0 border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50 text-xs text-[var(--text-muted)] uppercase tracking-wider">
                <th className="px-5 py-3 font-semibold">Người dùng</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Trường ĐH</th>
                <th className="px-5 py-3 font-semibold">Vai trò</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {users.map((u) => (
                <tr key={u.id} className="border-b border-surface-100 hover:bg-surface-50/50 transition-colors">
                  <td className="px-5 py-3 font-medium flex items-center gap-2">
                    <Avatar name={u.name} src={u.avatarUrl} size="sm" /> {u.name}
                  </td>
                  <td className="px-5 py-3 text-[var(--text-secondary)]">{u.email}</td>
                  <td className="px-5 py-3 text-[var(--text-muted)]">{u.university}</td>
                  <td className="px-5 py-3">
                    {u.systemRole ? (
                      <Badge variant={u.systemRole === 'ADMIN' ? 'danger' : 'warning'} size="sm">
                        {u.systemRole}
                      </Badge>
                    ) : (
                      <Badge variant="default" size="sm">USER</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {u.isBanned ? (
                      <Badge variant="danger" size="sm">Bị khóa</Badge>
                    ) : u.verified ? (
                      <Badge variant="success" size="sm">Đã xác minh</Badge>
                    ) : (
                      <Badge variant="warning" size="sm">Chưa xác minh</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 flex justify-end gap-2">
                    {!u.verified && !u.isBanned && (
                      <Button variant="outline" size="sm" onClick={() => verifyUser(u.id)} icon={<IconUserCheck size={16} />}>
                        Xác minh
                      </Button>
                    )}
                    {u.isBanned ? (
                      <Button variant="outline" size="sm" onClick={() => unbanUser(u.id)} className="text-green-600 border-green-200 hover:bg-green-50">
                        Mở khóa
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => banUser(u.id)} className="text-red-600 border-red-200 hover:bg-red-50">
                        Khóa
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
