import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Typography, Card, Statistic, InputNumber } from 'antd';
import api from '../api';

const { Title } = Typography;

const UserForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [form] = Form.useForm();

  const fetchTodayStats = async () => {
    try {
      const { data } = await api.get('/orders/stats/today');
      setTodayCount(data.count);
    } catch (error) {
      console.error('获取统计数据失败', error);
    }
  };

  useEffect(() => {
    fetchTodayStats();
    // Refresh every 30 seconds
    const timer = setInterval(fetchTodayStats, 30000);
    return () => clearInterval(timer);
  }, []);

  const onFinish = async (values: any) => {
    if (values.amount <= 0) {
      message.error('金额必须大于0');
      return;
    }

    setLoading(true);
    try {
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await api.post('/orders', values);
      message.success('模拟支付成功！订单已提交');
      form.resetFields();
      fetchTodayStats(); // Refresh count immediately
    } catch (error: any) {
      message.error(error.response?.data?.message || '提交失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <Card className="mb-6 text-center">
        <Statistic title="今日已提交用户数" value={todayCount} />
      </Card>

      <Card>
        <div className="text-center mb-6">
          <Title level={2}>球拍穿线服务</Title>
          <p className="text-gray-500">请填写您的球拍信息</p>
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark="optional"
        >
          <Form.Item
            name="brand"
            label="球拍品牌"
            rules={[{ required: true, message: '请输入球拍品牌' }]}
          >
            <Input placeholder="例如：Yonex, Li-Ning" />
          </Form.Item>

          <Form.Item
            name="model"
            label="球拍型号"
            rules={[{ required: true, message: '请输入球拍型号' }]}
          >
            <Input placeholder="例如：Astrox 99" />
          </Form.Item>

          <Form.Item
            name="tension"
            label="穿线磅数（磅）"
            rules={[{ required: true, message: '请输入穿线磅数' }]}
          >
            <Input placeholder="例如：26" />
          </Form.Item>

          <Form.Item
            name="string_type"
            label="羽线型号"
            rules={[{ required: true, message: '请输入羽线型号' }]}
          >
            <Input placeholder="例如：BG65, Exbolt 63" />
          </Form.Item>

          <Form.Item
            name="contact_name"
            label="您的姓名"
            rules={[{ required: true, message: '请输入您的姓名' }]}
          >
            <Input placeholder="张三" />
          </Form.Item>

          <Form.Item
            name="contact_phone"
            label="联系电话"
            rules={[{ required: true, message: '请输入您的电话号码' }]}
          >
            <Input placeholder="138-0000-0000" />
          </Form.Item>

          <Form.Item
            name="amount"
            label="支付金额 (元)"
            rules={[
              { required: true, message: '请输入支付金额' },
              { type: 'number', min: 0.01, message: '金额必须大于0', transform: (value) => Number(value) }
            ]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              precision={2} 
              step={0.1}
              min={0}
              placeholder="0.00" 
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              模拟支付并提交订单
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UserForm;
