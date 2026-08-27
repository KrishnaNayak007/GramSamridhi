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
        if (data) setPickups(data);
      } catch (err) {
        console.error("Error loading pickups for payment history:", err);
      }
    }
    loadData();
  }, []);

  // Static fallback data if database is empty
  const mockPayments = [
    { id: 'TXN-88213', title: 'Paddy Straw', desc: '350 kg · SWC Kanas', date: 'Today · 11:20 AM', mode: 'UPI', amount: 525, status: 'Pending', type: 'leaf' },
    { id: 'TXN-88109', title: 'Wheat Residue', desc: '280 kg · SWC Kanas', date: '18 Aug · 09:05 AM', mode: 'UPI', amount: 420, status: 'Paid', type: 'leaf' },
    { id: 'TXN-87960', title: 'Recyclables (Plastic + Metal)', desc: '42 kg · SWC Kanas', date: '11 Aug · 04:40 PM', mode: 'Bank Transfer', amount: 189, status: 'Paid', type: 'clay' },
    { id: 'TXN-87710', title: 'Organic Waste', desc: '200 kg · SWC Kanas', date: '04 Aug · 10:12 AM', mode: 'UPI', amount: 310, status: 'Paid', type: 'leaf' },
    { id: 'TXN-87502', title: 'Glass & Paper', desc: '30 kg · SWC Kanas', date: '27 Jul · 02:15 PM', mode: 'Bank Transfer', amount: 96, status: 'Paid', type: 'clay' },
    { id: 'TXN-87284', title: 'Paddy Straw', desc: '310 kg · SWC Kanas', date: '15 Jul · 08:50 AM', mode: 'UPI', amount: 465, status: 'Paid', type: 'leaf' }
  ];

  // Map dynamic pickups to payment history structures
  const dynamicPayments = pickups.map((p, idx) => ({
    id: 'TXN-' + (10000 + idx),
    title: p.residue_type || 'Crop Residue',
    desc: parseFloat(p.weight_kg) + ' kg · ' + p.location_address.split(',')[0],
    date: p.scheduled_slot || 'Recently',
    mode: 'UPI',
    amount: parseFloat(p.payment_amount || 0),
    status: p.payment_status === 'paid' ? 'Paid' : (p.status === 'collected' ? 'Processing' : 'Pending'),
    type: 'leaf'
  }));

  const paymentList = dynamicPayments.length > 0 ? dynamicPayments : mockPayments;

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
            <div className="stat-foot">Since you joined · Mar 2026</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">This Month</div>
            <div className="stat-value">₹ {filteredList.filter(p => p.date.includes('Aug') || p.date.includes('Today')).reduce((sum, p) => sum + p.amount, 0).toLocaleString('en-IN')}</div>
            <div className="stat-foot">up <b>↑ 22%</b> from July</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending Payout</div>
            <div className="stat-value">₹ {pendingEarned.toLocaleString('en-IN')}</div>
            <div className="stat-foot">Expected in 2 days</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Payouts</div>
            <div className="stat-value">{paidCount}</div>
            <div className="stat-foot">Avg <b>₹ {avgPayout}</b> per payout</div>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-row">
          <div className="tabs">
            <button className={'tab ' + (activeTab === 'All' ? 'active' : '')} onClick={() => setActiveTab('All')}>All</button>
            <button className={'tab ' + (activeTab === 'Paid' ? 'active' : '')} onClick={() => setActiveTab('Paid')}>Paid</button>
            <button className={'tab ' + (activeTab === 'Pending' ? 'active' : '')} onClick={() => setActiveTab('Pending')}>Pending</button>
            <button className={'tab ' + (activeTab === 'This Year' ? 'active' : '')} onClick={() => setActiveTab('This Year')}>This Year</button>
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
                      <span className="day">{item.date.split(' · ')[0]}</span> {item.date.includes(' · ') && (' · ' + item.date.split(' · ')[1])}
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
                  <td className="amt">+ ₹ {item.amount}</td>
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
                    No payment records match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="table-foot">
            <span>Showing {filteredList.length} of {paymentList.length} payments</span>
            <div className="pg-btns">
              <button className="pg-btn active">1</button>
              <button className="pg-btn">2</button>
              <button className="pg-btn">3</button>
              <button className="pg-btn">→</button>
            </div>
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
