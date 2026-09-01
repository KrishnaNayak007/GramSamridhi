import React, { useState, useEffect } from 'react';
import { agricultureApi } from '../../../services/agricultureApi';
import './PaymentHistoryPage.css';

export default function PaymentHistoryPage() {
  const [pickups, setPickups] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [searchTxn, setSearchTxn] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await agricultureApi.getPickups();
        const list = Array.isArray(data) ? data : (data?.results || []);
        setPickups(list);
      } catch (err) {
        console.error("Error loading pickups for payment history:", err);
      }
    }
    loadData();
  }, []);

  // Map dynamic pickups to payment history structures safely
  const paymentList = (Array.isArray(pickups) ? pickups : []).map((p, idx) => {
    const weight = parseFloat(p.weight_kg) || 0;
    const addr = typeof p.location_address === 'string' && p.location_address ? p.location_address.split(',')[0] : 'Farm Pickup';
    const rawDate = p.scheduled_slot || p.created_at || 'Recently';
    const amount = parseFloat(p.payment_amount) || 0;
    const isPaid = (p.payment_status || '').toLowerCase() === 'paid' || (p.status || '').toLowerCase() === 'paid';
    const isProgress = (p.status || '').toLowerCase() === 'collected' || (p.status || '').toLowerCase() === 'in_progress';

    return {
      id: `TXN-${10000 + (p.id ? (typeof p.id === 'number' ? p.id : idx + 1) : idx + 1)}`,
      title: p.residue_type ? `${p.residue_type} Residue` : 'Crop Residue',
      desc: `${weight} kg · ${addr}`,
      date: String(rawDate),
      mode: 'UPI',
      amount: amount,
      status: isPaid ? 'Paid' : (isProgress ? 'Processing' : 'Pending'),
      type: 'leaf'
    };
  });

  // Compute stat metrics
  const totalEarned = paymentList.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingEarned = paymentList.filter(p => p.status === 'Pending' || p.status === 'Processing').reduce((sum, p) => sum + p.amount, 0);
  const paidCount = paymentList.filter(p => p.status === 'Paid').length;
  const avgPayout = paidCount > 0 ? Math.round(totalEarned / paidCount) : 0;

  // Filter list by tab & search query
  const filteredList = paymentList.filter(p => {
    // Tab filter
    if (activeTab === 'Paid' && p.status !== 'Paid') return false;
    if (activeTab === 'Pending' && (p.status !== 'Pending' && p.status !== 'Processing')) return false;
    
    // Search filter
    if (searchTxn && !p.id.toLowerCase().includes(searchTxn.toLowerCase())) return false;
    
    return true;
  });

  const renderDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    if (dateStr.includes(' · ')) {
      const parts = dateStr.split(' · ');
      return <><span className="day">{parts[0]}</span> · {parts[1]}</>;
    }
    if (dateStr.includes(' | ')) {
      const parts = dateStr.split(' | ');
      return <><span className="day">{parts[0]}</span> · {parts[1]}</>;
    }
    return <span className="day">{dateStr}</span>;
  };

  return (
    <div className="agriculture-payment-history-page">
      <div className="wrap">
        {/* Header */}
        <div className="page-header">
          <div>
            <div className="eyebrow">Report &amp; Contribute · My Earnings</div>
            <h1 className="page-title">My Payment History</h1>
            <p className="page-sub">Every payout for your waste and crop residue contributions — just yours, not the village ledger.</p>
          </div>
        </div>

        {/* Summary strip */}
        <div className="stat-strip">
          <div className="stat-card hero">
            <div className="stat-label">Total Earned</div>
            <div className="stat-value">₹ {totalEarned.toLocaleString('en-IN')}</div>
            <div className="stat-foot">Since you joined</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed Payouts</div>
            <div className="stat-value">₹ {totalEarned.toLocaleString('en-IN')}</div>
            <div className="stat-foot">{paidCount} transactions settled</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending Payout</div>
            <div className="stat-value">₹ {pendingEarned.toLocaleString('en-IN')}</div>
            <div className="stat-foot">Processed after collection</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average Payout</div>
            <div className="stat-value">₹ {avgPayout.toLocaleString('en-IN')}</div>
            <div className="stat-foot">Per completed transaction</div>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-row">
          <div className="tabs">
            <button className={'tab ' + (activeTab === 'All' ? 'active' : '')} onClick={() => setActiveTab('All')}>All</button>
            <button className={'tab ' + (activeTab === 'Paid' ? 'active' : '')} onClick={() => setActiveTab('Paid')}>Paid</button>
            <button className={'tab ' + (activeTab === 'Pending' ? 'active' : '')} onClick={() => setActiveTab('Pending')}>Pending</button>
          </div>
          <div className="search-mini">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" style={{ width: '14px', height: '14px', marginRight: '6px' }}>
              <circle cx="11" cy="11" r="7"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search transaction ID" 
              value={searchTxn} 
              onChange={(e) => setSearchTxn(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '12.5px', color: 'var(--ink)' }}
            />
          </div>
        </div>

        {/* Payment table */}
        <div className="panel">
          <table className="pay">
            <thead>
              <tr>
                <th>Contribution</th>
                <th>Transaction</th>
                <th>Date</th>
                <th>Mode</th>
                <th className="num">Amount</th>
                <th className="num">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td>
                    <div className="pay-cell">
                      <div className={'pay-icon ' + (item.type === 'clay' ? 'clay' : 'leaf')}>
                        {item.type === 'clay' ? (
                          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 7h-9a4 4 0 1 0 0 8h4"/>
                            <circle cx="17" cy="17" r="3"/>
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="pay-title">{item.title}</div>
                        <div className="pay-sub">{item.desc}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="txn-id">{item.id}</span></td>
                  <td>
                    <div className="pay-date">
                      {renderDate(item.date)}
                    </div>
                  </td>
                  <td>
                    <div className="mode">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="5" width="20" height="14" rx="2"/>
                        <path d="M2 10h20"/>
                      </svg>
                      {item.mode}
                    </div>
                  </td>
                  <td className="amt">+ ₹ {item.amount.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={'badge ' + (item.status === 'Paid' ? 'b-leaf' : 'b-wheat')}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--ink-soft)' }}>
                    No payment records found yet. Crop residue buy-back requests and payouts will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="table-foot">
            <span>Showing {filteredList.length} of {paymentList.length} payments</span>
          </div>
        </div>

        {/* Payout method */}
        <div className="payout-strip">
          <div className="payout-text">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <path d="M2 10h20"/>
            </svg>
            Payouts go to UPI ID <b>devinder.Sahu@okhdfc</b>
          </div>
          <button className="btn-link-sky" onClick={() => {
            const newUpi = prompt("Enter your new UPI ID:", "devinder.Sahu@okhdfc");
            if (newUpi) alert("UPI ID updated to: " + newUpi);
          }}>Change Payout Method</button>
        </div>
      </div>
    </div>
  );
}
