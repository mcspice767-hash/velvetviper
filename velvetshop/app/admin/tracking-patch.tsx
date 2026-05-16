// Add this inside your admin page, in the listing cards section
// Place it after the existing approve/reject/delete buttons

// First add these state variables at the top of AdminPage:
const [trackingOrder, setTrackingOrder] = useState<any | null>(null);
const [orders, setOrders] = useState<any[]>([]);
const [loadingOrders, setLoadingOrders] = useState(false);
const [trackingForm, setTrackingForm] = useState({ status: "", notes: "" });
const [savingTracking, setSavingTracking] = useState(false);

// Add "orders" to the tab type:
// const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected" | "post" | "orders">("pending");

// Add this function inside AdminPage:
const fetchOrders = async () => {
  setLoadingOrders(true);
  const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  setOrders(data || []);
  setLoadingOrders(false);
};

const updateTracking = async () => {
  if (!trackingOrder) return;
  setSavingTracking(true);
  const { error } = await supabase.from("orders").update({
    tracking_status: trackingForm.status,
    tracking_notes: trackingForm.notes,
    tracking_updated_at: new Date().toISOString(),
  }).eq("id", trackingOrder.id);
  setSavingTracking(false);
  if (!error) {
    setOrders(prev => prev.map(o => o.id === trackingOrder.id ? { ...o, tracking_status: trackingForm.status, tracking_notes: trackingForm.notes } : o));

    // Send WhatsApp update to customer
    const WHATSAPP_NUMBER = "15551234567"; // ← your number
    const STAGES_LABELS: Record<string, string> = {
      pending: "Order Placed",
      payment_confirmed: "Payment Confirmed ✅",
      preparing: "Preparing for Shipment 📦",
      shipped: "Shipped 🚚",
      out_for_delivery: "Out for Delivery 📍",
    };
    const msg = `Hi ${trackingOrder.customer_name}! 🐍\n\nYour VelvetViper order *#${trackingOrder.id.slice(0,8).toUpperCase()}* has been updated:\n\n*Status:* ${STAGES_LABELS[trackingForm.status] || trackingForm.status}${trackingForm.notes ? `\n*Note:* ${trackingForm.notes}` : ""}\n\nTrack your order: https://velvetviper.com/order-tracking`;
    window.open(`https://wa.me/${trackingOrder.customer_phone?.replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`, "_blank");

    showSuccess("Tracking updated & WhatsApp opened!");
    setTrackingOrder(null);
  }
};

// useEffect to fetch orders when tab is "orders":
// Add inside the existing useEffect or add a new one:
// useEffect(() => { if (activeTab === "orders") fetchOrders(); }, [activeTab]);

// ── ADD "Orders" TAB BUTTON ──
// In the tabs row, add after the "post" tab button:
/*
<button key="orders" onClick={() => { setActiveTab("orders"); fetchOrders(); }}
  className={`px-6 py-4 whitespace-nowrap text-sm font-medium transition-all flex items-center gap-2 ${activeTab === "orders" ? "border-b-2 border-[#c8ff00] text-[#c8ff00]" : "text-gray-500 hover:text-gray-300"}`}>
  📦 Orders
  {orders.length > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">{orders.length}</span>}
</button>
*/

// ── ORDERS TAB CONTENT ──
// Add after the "post" tab content block:
/*
{activeTab === "orders" && (
  <div>
    {loadingOrders ? (
      <div className="text-center py-20 text-gray-500">Loading orders...</div>
    ) : orders.length === 0 ? (
      <div className="text-center py-20 text-gray-500">No orders yet.</div>
    ) : (
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-6">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <div className="font-bold text-lg text-[#c8ff00]">#{order.id.slice(0,8).toUpperCase()}</div>
                <div className="text-sm text-gray-400 mt-1">{order.customer_name} · {order.customer_email}</div>
                <div className="text-xs text-gray-600 mt-1">{order.shipping_address}</div>
                <div className="text-xs text-gray-600 mt-1">📞 {order.customer_phone} · 💳 {order.payment_method}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#c8ff00]">${order.total?.toFixed(2)}</div>
                <div className="text-xs text-gray-500 mt-1">{new Date(order.created_at).toLocaleDateString()}</div>
                <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-semibold ${
                  order.tracking_status === "payment_confirmed" ? "bg-green-500/20 text-green-400" :
                  order.tracking_status === "shipped" ? "bg-purple-500/20 text-purple-400" :
                  order.tracking_status === "out_for_delivery" ? "bg-yellow-500/20 text-yellow-400" :
                  order.tracking_status === "preparing" ? "bg-blue-500/20 text-blue-400" :
                  "bg-gray-500/20 text-gray-400"
                }`}>
                  {order.tracking_status || "pending"}
                </span>
              </div>
            </div>

            <div className="mt-4 flex gap-2 flex-wrap">
              <button
                onClick={() => { setTrackingOrder(order); setTrackingForm({ status: order.tracking_status || "pending", notes: order.tracking_notes || "" }); }}
                className="bg-[#c8ff00] text-black text-sm px-4 py-2 rounded-xl font-semibold hover:bg-white transition">
                📍 Update Tracking
              </button>
              <button
                onClick={() => { const msg = `Hi ${order.customer_name}! Any update on order #${order.id.slice(0,8).toUpperCase()}?`; window.open(`https://wa.me/${order.customer_phone?.replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`, "_blank"); }}
                className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-2 rounded-xl hover:bg-green-500/20 transition">
                💬 WhatsApp Customer
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
*/

// ── TRACKING MODAL ──
// Add before the closing </div> of the page:
/*
{trackingOrder && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
    onClick={() => setTrackingOrder(null)}>
    <div className="bg-[#111] border border-[#2a2a2a] rounded-3xl w-full max-w-md p-8" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Update Tracking</h2>
        <button onClick={() => setTrackingOrder(null)} className="text-gray-400 hover:text-white text-2xl">✕</button>
      </div>
      <p className="text-sm text-gray-500 mb-6">Order <span className="text-[#c8ff00]">#{trackingOrder.id.slice(0,8).toUpperCase()}</span> · {trackingOrder.customer_name}</p>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-widest mb-2 block">Status</label>
          <select value={trackingForm.status} onChange={e => setTrackingForm({...trackingForm, status: e.target.value})}
            className="w-full bg-black border border-[#2a2a2a] rounded-xl px-4 py-3 text-[#e8e0d0] text-sm outline-none focus:border-[#c8ff00]">
            <option value="pending">Order Placed</option>
            <option value="payment_confirmed">Payment Confirmed</option>
            <option value="preparing">Preparing for Shipment</option>
            <option value="shipped">Shipped</option>
            <option value="out_for_delivery">Out for Delivery</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-widest mb-2 block">Note (optional)</label>
          <textarea value={trackingForm.notes} onChange={e => setTrackingForm({...trackingForm, notes: e.target.value})}
            placeholder="e.g. Shipped via FedEx, tracking #12345"
            className="w-full bg-black border border-[#2a2a2a] rounded-xl px-4 py-3 text-[#e8e0d0] text-sm outline-none focus:border-[#c8ff00] h-24 resize-none" />
        </div>
        <p className="text-xs text-gray-600">Saving will also open WhatsApp to notify the customer.</p>
        <div className="flex gap-3 pt-2">
          <button onClick={() => setTrackingOrder(null)} className="flex-1 border border-[#2a2a2a] py-3 rounded-xl text-sm text-gray-500 hover:border-gray-500 transition">Cancel</button>
          <button onClick={updateTracking} disabled={savingTracking}
            className="flex-1 bg-[#c8ff00] text-black py-3 rounded-xl font-bold text-sm hover:bg-white transition disabled:opacity-50">
            {savingTracking ? "Saving..." : "Save & Notify"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
