import React, { useEffect, useState } from 'react';
import { Table, Select, message, Typography, Button, Tabs, DatePicker, Space, InputNumber, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Order {
  id: number;
  brand: string;
  model: string;
  tension: string;
  string_type: string;
  contact_name: string;
  contact_phone: string;
  status: string;
  amount: number;
  created_at: string;
  completed_at?: string;
  estimated_completion_time?: string;
}

const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Filter states for Completed Orders
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [minAmount, setMinAmount] = useState<number | null>(null);
  const [maxAmount, setMaxAmount] = useState<number | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await api.get('/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(data);
    } catch (error) {
      message.error('获取订单失败');
      if ((error as any).response?.status === 401) {
        navigate('/merchant');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/orders/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('状态更新成功');
      fetchOrders();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/merchant');
  };

  const handleExport = () => {
    const headers = ['订单编号,客户姓名,联系电话,品牌,型号,羽线,磅数,金额,完成时间'];
    const rows = completedOrders.map(o => 
      `${o.id},${o.contact_name},${o.contact_phone},${o.brand},${o.model},${o.string_type},${o.tension},${o.amount || 0},${o.completed_at ? dayjs(o.completed_at).format('YYYY-MM-DD HH:mm:ss') : ''}`
    );
    const csvContent = "\uFEFF" + [headers, ...rows].join("\n"); // Add BOM
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `已完成订单_${dayjs().format('YYYYMMDD')}.csv`;
    link.click();
  };

  // Filtered data
  const incompleteOrders = orders.filter(o => ['pending', 'processing'].includes(o.status));
  
  const completedOrders = orders.filter(o => {
    if (o.status !== 'completed') return false;
    
    let match = true;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const completedDate = dayjs(o.completed_at);
      if (completedDate.isBefore(dateRange[0]) || completedDate.isAfter(dateRange[1])) match = false;
    }
    if (minAmount !== null && o.amount < minAmount) match = false;
    if (maxAmount !== null && o.amount > maxAmount) match = false;
    return match;
  });

  const incompleteColumns = [
    { title: '订单编号', dataIndex: 'id', key: 'id', sorter: (a: Order, b: Order) => a.id - b.id },
    { 
      title: '用户信息', 
      key: 'user', 
      render: (_: any, r: Order) => (
        <div>
          <div className="font-medium">{r.contact_name}</div>
          <div className="text-xs text-gray-500">{r.contact_phone}</div>
        </div>
      ) 
    },
    { title: '球拍信息', key: 'racket', render: (_: any, r: Order) => `${r.brand} ${r.model} (${r.tension}lbs)` },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', render: (t: string) => dayjs(t).format('MM-DD HH:mm'), sorter: (a: Order, b: Order) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix() },
    { 
      title: '状态操作', 
      key: 'action',
      render: (_: any, r: Order) => (
        <Select value={r.status} onChange={(v) => handleStatusChange(r.id, v)} style={{ width: 120 }}>
          <Option value="pending">待处理</Option>
          <Option value="processing">进行中</Option>
          <Option value="completed">完成</Option>
          <Option value="cancelled">取消</Option>
        </Select>
      )
    }
  ];

  const completedColumns = [
    { title: '订单编号', dataIndex: 'id', key: 'id' },
    { title: '用户信息', key: 'user', render: (_: any, r: Order) => `${r.contact_name} (${r.contact_phone})` },
    { title: '完成时间', dataIndex: 'completed_at', key: 'completed_at', render: (t: string) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-' },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${Number(v || 0).toFixed(2)}`, sorter: (a: Order, b: Order) => a.amount - b.amount },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>商家管理面板</Title>
        <Button onClick={handleLogout}>退出登录</Button>
      </div>

      <Tabs defaultActiveKey="incomplete" items={[
        {
          key: 'incomplete',
          label: '未完成订单',
          children: (
            <Table 
              dataSource={incompleteOrders} 
              columns={incompleteColumns} 
              rowKey="id" 
              loading={loading}
            />
          )
        },
        {
          key: 'completed',
          label: '已完成订单',
          children: (
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Card size="small">
                <Space wrap>
                  <RangePicker onChange={(dates) => setDateRange(dates as any)} />
                  <InputNumber placeholder="最小金额" value={minAmount} onChange={setMinAmount} />
                  <span className="text-gray-400">-</span>
                  <InputNumber placeholder="最大金额" value={maxAmount} onChange={setMaxAmount} />
                  <Button type="primary" onClick={handleExport}>导出数据</Button>
                </Space>
              </Card>
              <Table 
                dataSource={completedOrders} 
                columns={completedColumns} 
                rowKey="id" 
                loading={loading} 
              />
            </Space>
          )
        }
      ]} />
    </div>
  );
};

export default Dashboard;
