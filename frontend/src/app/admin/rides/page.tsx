"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Card, Badge, Button, Avatar } from "@/components/ui";
import { IconCar, IconBan } from "@tabler/icons-react";

export default function AdminRidesPage() {
  const { accessToken } = useAuthStore();
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/admin/rides`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRides(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const cancelRide = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn hủy chuyến đi này?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/admin/rides/${id}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      fetchRides();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-heading)]">Quản lý Chuyến Đi</h1>
      </div>

      <Card className="p-0 bg-surface-0 border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50 text-xs text-[var(--text-muted)] uppercase tracking-wider">
                <th className="px-5 py-3 font-semibold">Tài xế</th>
                <th className="px-5 py-3 font-semibold">Tuyến đường</th>
                <th className="px-5 py-3 font-semibold">Khởi hành</th>
                <th className="px-5 py-3 font-semibold">Loại xe</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {rides.map((r) => (
                <tr key={r.id} className="border-b border-surface-100 hover:bg-surface-50/50 transition-colors">
                  <td className="px-5 py-3 font-medium flex items-center gap-2">
                    <Avatar name={r.driver.name} size="xs" /> {r.driver.name}
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-[var(--text-secondary)] font-medium max-w-xs truncate" title={r.pickupLocation}>{r.pickupLocation}</div>
                    <div className="text-[var(--text-muted)] text-xs mt-0.5">↓</div>
                    <div className="text-[var(--text-secondary)] font-medium max-w-xs truncate" title={r.destinationLocation}>{r.destinationLocation}</div>
                  </td>
                  <td className="px-5 py-3 text-[var(--text-muted)]">
                    {new Date(r.departureAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-5 py-3 text-[var(--text-secondary)]">
                    <div className="flex items-center gap-1">
                      <IconCar size={16} /> {r.vehicleType === 'motorcycle' ? 'Xe máy' : 'Ô tô'}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge 
                      variant={r.status === 'COMPLETED' ? 'success' : r.status === 'ACTIVE' ? 'primary' : r.status === 'CANCELLED' ? 'danger' : 'default'} 
                      size="sm"
                    >
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 flex justify-end gap-2">
                    {r.status !== 'CANCELLED' && r.status !== 'COMPLETED' && (
                      <Button variant="outline" size="sm" onClick={() => cancelRide(r.id)} className="text-red-600 border-red-200 hover:bg-red-50" icon={<IconBan size={16} />}>
                        Hủy
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
