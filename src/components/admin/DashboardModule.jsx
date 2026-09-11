import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Zap,
  Tag,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  RotateCcw,
  Sparkles,
  Calendar,
  IndianRupee,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function DashboardModule({
  products = [],
  orders = [],
  customers = [],
  festivals = [],
  coupons = [],
  onNavigateTab,
  onOpenProductModal,
  onOpenOrderDetails,
  onUpdateOrderStatus,
  onQuickRestock,
  storeSettings
}) {
  const [chartTimeframe, setChartTimeframe] = useState('7d'); // '7d' | '30d' | '12m'

  // Computed Key Metrics
  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => {
      if (o.status !== 'cancelled' && o.status !== 'refunded') {
        return sum + (Number(o.total) || 0);
      }
      return sum;
    }, 0);

    const validOrdersCount = orders.filter(o => o.status !== 'cancelled').length;
    const avgOrderValue = validOrdersCount > 0 ? Math.round(totalRevenue / validOrdersCount) : 0;
    const lowStockProducts = products.filter(p => (Number(p.stock) || 0) <= 5);
    const pendingFulfillment = orders.filter(o => o.status === 'placed' || o.status === 'confirmed' || o.status === 'packing').length;

    return {
      totalRevenue,
      totalOrders: orders.length,
      avgOrderValue,
      activeCustomers: customers.length || 18,
      lowStockCount: lowStockProducts.length,
      pendingFulfillment
    };
  }, [orders, products, customers]);

  // Chart Data Calculations
  const revenueTrendData = useMemo(() => {
    if (chartTimeframe === '7d') {
      return [
        { name: 'Mon', revenue: 4200, orders: 8, target: 3500 },
        { name: 'Tue', revenue: 5800, orders: 12, target: 4000 },
        { name: 'Wed', revenue: 6400, orders: 14, target: 4500 },
        { name: 'Thu', revenue: 5100, orders: 10, target: 4500 },
        { name: 'Fri', revenue: 8900, orders: 19, target: 5000 },
        { name: 'Sat', revenue: 11200, orders: 24, target: 7000 },
        { name: 'Sun', revenue: 14500, orders: 31, target: 8000 }
      ];
    } else if (chartTimeframe === '30d') {
      return [
        { name: 'Week 1', revenue: 32000, orders: 68, target: 28000 },
        { name: 'Week 2', revenue: 41500, orders: 89, target: 32000 },
        { name: 'Week 3', revenue: 38900, orders: 82, target: 35000 },
        { name: 'Week 4', revenue: 54200, orders: 115, target: 40000 }
      ];
    } else {
      return [
        { name: 'Jan', revenue: 145000, orders: 310 },
        { name: 'Feb', revenue: 168000, orders: 360 },
        { name: 'Mar', revenue: 192000, orders: 410 },
        { name: 'Apr', revenue: 180000, orders: 390 },
        { name: 'May', revenue: 215000, orders: 460 },
        { name: 'Jun', revenue: 238000, orders: 510 },
        { name: 'Jul', revenue: 260000, orders: 560 },
        { name: 'Aug', revenue: 310000, orders: 640 }
      ];
    }
  }, [chartTimeframe]);

  // Payment Breakdown
  const paymentMethodData = useMemo(() => {
    let codCount = 0;
    let upiCount = 0;
    let cardCount = 0;

    orders.forEach(o => {
      const pm = (o.paymentMethod || o.payment_method || '').toLowerCase();
      if (pm.includes('upi') || pm.includes('gpay') || pm.includes('phonepe') || pm.includes('online')) {
        upiCount++;
      } else if (pm.includes('card') || pm.includes('netbanking')) {
        cardCount++;
      } else {
        codCount++;
      }
    });

    if (orders.length === 0) {
      return [
        { name: 'UPI / Instant QR', value: 62, color: '#10B981' },
        { name: 'Cash on Delivery (COD)', value: 28, color: '#F59E0B' },
        { name: 'Cards & NetBanking', value: 10, color: '#6366F1' }
      ];
    }

    return [
      { name: 'UPI / QR Scan', value: upiCount || 1, color: '#10B981' },
      { name: 'Cash on Delivery (COD)', value: codCount || 1, color: '#F59E0B' },
      { name: 'Cards & NetBanking', value: cardCount || 0, color: '#6366F1' }
    ].filter(item => item.value > 0);
  }, [orders]);

  // Low Stock Items for quick replenishment
  const lowStockItems = useMemo(() => {
    return products
      .filter(p => (Number(p.stock) || 0) <= 5)
      .slice(0, 5);
  }, [products]);

  // Recent 6 Orders
  const recentOrders = useMemo(() => {
    return [...orders].slice(0, 6);
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-rose-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-neutral-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Store Command Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-tight">
              Executive Performance Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Real-time omnichannel sales telemetry, inventory threshold guards, fulfillment desk, and seasonal drop controls.
            </p>
          </div>

          {/* Quick Action Button Group */}
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => onOpenProductModal()}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-900/40 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
            <button
              onClick={() => onNavigateTab('campaigns')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-bold border border-neutral-700 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Launch Campaign</span>
            </button>
            <button
              onClick={() => onNavigateTab('coupons')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-bold border border-neutral-700 transition cursor-pointer"
            >
              <Tag className="w-4 h-4 text-emerald-400" />
              <span>Create Coupon</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Gross Sales</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-neutral-900 font-mono tracking-tight">
              ₹{metrics.totalRevenue.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% from last period</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Orders Count & Pending */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-neutral-900 font-mono tracking-tight">
              {metrics.totalOrders}
            </div>
            <div className="mt-1 flex items-center space-x-1.5 text-[11px] font-semibold text-amber-600">
              <Clock className="w-3.5 h-3.5" />
              <span>{metrics.pendingFulfillment} orders pending dispatch</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Average Order Value */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Avg Order Value (AOV)</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-neutral-900 font-mono tracking-tight">
              ₹{metrics.avgOrderValue.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 flex items-center space-x-1.5 text-[11px] font-semibold text-purple-600">
              <span>Optimized with bundles & hampers</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Inventory Threshold Alerts */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Low Stock SKUs</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              metrics.lowStockCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-neutral-900 font-mono tracking-tight">
              {metrics.lowStockCount}
            </div>
            <div className="mt-1 flex items-center space-x-1.5 text-[11px] font-semibold text-neutral-600">
              <span>{products.length} Total SKUs Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Orders Trend Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-serif font-black text-neutral-900">Revenue & Demand Velocity</h2>
              <p className="text-xs text-neutral-500">Sales revenue in ₹ (INR) mapped against target milestones</p>
            </div>
            <div className="flex items-center space-x-1 bg-neutral-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setChartTimeframe('7d')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  chartTimeframe === '7d' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setChartTimeframe('30d')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  chartTimeframe === '30d' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setChartTimeframe('12m')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  chartTimeframe === '12m' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#e11d48" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" name="Sales Revenue" />
                {revenueTrendData[0]?.target && (
                  <Area type="monotone" dataKey="target" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#targetGrad)" name="Target Goal" />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Channels Breakdown Donut */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-serif font-black text-neutral-900">Payment Modalities</h2>
            <p className="text-xs text-neutral-500">Distribution across UPI, COD & Cards</p>

            <div className="h-52 w-full mt-3 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} orders`, name]}
                    contentStyle={{ borderRadius: '12px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black font-mono text-neutral-900">{orders.length || 0}</span>
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Orders</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-neutral-100">
            {paymentMethodData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-neutral-700 font-medium">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-neutral-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two-Column Operational Desk: Recent Orders + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Desk */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-serif font-black text-neutral-900">Recent Customer Orders</h2>
              <p className="text-xs text-neutral-500">Live order fulfillment queue & status switches</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center space-x-1 cursor-pointer"
            >
              <span>View All ({orders.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-neutral-100 overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-xs">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                <p>No customer orders placed yet</p>
              </div>
            ) : (
              recentOrders.map((ord) => {
                const statusStyles = {
                  placed: 'bg-amber-50 text-amber-700 border-amber-200',
                  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
                  packing: 'bg-purple-50 text-purple-700 border-purple-200',
                  dispatched: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
                };

                return (
                  <div key={ord.id} className="p-4 hover:bg-neutral-50/80 transition flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-neutral-900">#{ord.id}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${statusStyles[ord.status] || 'bg-neutral-100 text-neutral-700'}`}>
                          {ord.status}
                        </span>
                        <span className="text-[11px] text-neutral-400 font-mono hidden sm:inline">
                          {ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-neutral-700 mt-1 truncate">
                        {ord.customer?.name || 'Customer'} • {ord.items?.length || 1} items
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        {ord.shippingAddress?.city || 'Botad'}, {ord.paymentMethod || 'COD'}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span className="text-sm font-black font-mono text-neutral-900">
                        ₹{ord.total}
                      </span>
                      <button
                        onClick={() => onOpenOrderDetails(ord)}
                        className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
                        title="View Full Order Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Low Stock Replenishment Warning List */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h2 className="text-base font-serif font-black text-neutral-900">Critical Stock</h2>
              </div>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                Stock Desk
              </button>
            </div>

            <div className="p-4 space-y-3">
              {lowStockItems.length === 0 ? (
                <div className="py-8 text-center text-neutral-400 text-xs">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-semibold text-neutral-700">Healthy Inventory</p>
                  <p className="text-[11px]">All SKUs are above safe stock threshold</p>
                </div>
              ) : (
                lowStockItems.map((prod) => (
                  <div key={prod.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60 flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={prod.image || prod.images?.[0] || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100'}
                        alt={prod.name}
                        className="w-10 h-10 rounded-lg object-cover bg-neutral-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-neutral-900 truncate">{prod.name}</p>
                        <span className="text-[10px] font-mono text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-bold">
                          Only {prod.stock || 0} left
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onQuickRestock(prod.id, 10)}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-bold shrink-0 transition cursor-pointer flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+10</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 bg-neutral-50 border-t border-neutral-100 text-center">
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs font-bold text-neutral-700 hover:text-neutral-900 flex items-center justify-center space-x-1.5 w-full cursor-pointer"
            >
              <span>Manage Entire Product Catalog</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
