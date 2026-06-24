"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Card, Badge, Button, Avatar } from "@/components/ui";
import { IconAlertTriangle, IconCheck, IconShieldCheck } from "@tabler/icons-react";

export default function AdminSOSPage() {
  const { accessToken } = useAuthStore();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSOS();
  }, []);

  const fetchSOS = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/admin/sos-alerts`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resolveSOS = async (id: string, status: 'RESOLVED' | 'FALSE_ALARM') => {
    if (!confirm(`Xác nhận đánh dấu SOS này là ${status === 'RESOLVED' ? 'Đã giải quyết' : 'Báo động giả'}?`)) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/admin/sos-alerts/${id}/resolve`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      fetchSOS();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-heading)] flex items-center gap-2">
          <IconAlertTriangle className="text-red-500" />
          Quản lý Cảnh báo SOS
        </h1>
      </div>

      <Card className="p-0 bg-surface-0 border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50 text-xs text-[var(--text-muted)] uppercase tracking-wider">
                <th className="px-5 py-3 font-semibold">Thời gian</th>
                <th className="px-5 py-3 font-semibold">Người gửi</th>
                <th className="px-5 py-3 font-semibold">Chuyến đi</th>
                <th className="px-5 py-3 font-semibold">Tọa độ</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-surface-500">
                    Không có cảnh báo SOS nào đang kích hoạt.
                  </td>
                </tr>
              ) : alerts.map((alert) => (
                <tr key={alert.id} className="border-b border-surface-100 hover:bg-surface-50/50 transition-colors bg-red-50/30">
                  <td className="px-5 py-3 font-medium text-red-600">
                    {new Date(alert.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-semibold text-surface-900">{alert.triggeredByUser.name}</div>
                    <div className="text-xs text-surface-500">{alert.triggeredByUser.phone}</div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-xs text-surface-500">Tài xế: {alert.ride.driver.name} ({alert.ride.driver.phone})</div>
                    <div className="text-[var(--text-secondary)] font-medium max-w-xs truncate" title={alert.ride.pickupLocation}>{alert.ride.pickupLocation}</div>
                    <div className="text-[var(--text-secondary)] font-medium max-w-xs truncate" title={alert.ride.destinationLocation}>→ {alert.ride.destinationLocation}</div>
                  </td>
                  <td className="px-5 py-3 text-blue-600 text-xs underline cursor-pointer hover:text-blue-800">
                    <a href={`https://maps.google.com/?q=${alert.lat},${alert.lng}`} target="_blank" rel="noreferrer">
                      {alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}
                    </a>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant="danger" size="sm" className="animate-pulse">
                      ACTIVE
                    </Badge>
                  </td>
                  <td className="px-5 py-3 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => resolveSOS(alert.id, 'RESOLVED')} className="text-green-600 border-green-200 hover:bg-green-50" icon={<IconCheck size={16} />}>
                      Đã xử lý
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => resolveSOS(alert.id, 'FALSE_ALARM')} className="text-surface-600 border-surface-200 hover:bg-surface-100" icon={<IconShieldCheck size={16} />}>
                      Báo nhầm
                    </Button>
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
