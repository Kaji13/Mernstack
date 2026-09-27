import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackToTop from '../components/BackToTop'
import { createBill, getBillInvoice, getBills, getPatients, getKhaltiStatus, getEsewaStatus, initiateBillingPayment } from '../api'
import './DashboardPage.css'

const emptyItem = () => ({ description: '', amount: '', quantity: '1' })
const currency = (value) => `Rs ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const billId = (bill) => String(bill?._id || bill?.id || '')

function BillingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialInvoiceRef = useRef(searchParams.get('invoice') || '')
  const [bills, setBills] = useState([])
  const [patients, setPatients] = useState([])
  const [selectedId, setSelectedId] = useState(searchParams.get('invoice') || '')
  const [invoice, setInvoice] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [patientId, setPatientId] = useState('')
  const [items, setItems] = useState([emptyItem()])
  const [tax, setTax] = useState('0')
  const [notes, setNotes] = useState('')
  const [query, setQuery] = useState('')
  const [providerStatus, setProviderStatus] = useState({ khalti: false, esewa: false })
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [processing, setProcessing] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadBills = useCallback(async () => {
    const list = await getBills()
    setBills(list)
    return list
  }, [])

  useEffect(() => {
    let mounted = true
    Promise.all([getBills(), getPatients(), getKhaltiStatus(), getEsewaStatus()])
      .then(([billList, patientList, khalti, esewa]) => {
        if (!mounted) return
        setBills(billList)
        setPatients(patientList)
        setProviderStatus({ khalti: Boolean(khalti.configured), esewa: Boolean(esewa.configured) })
        const requested = initialInvoiceRef.current
        const firstId = requested && billList.some((item) => billId(item) === requested)
          ? requested
          : billId(billList[0])
        if (firstId) setSelectedId(firstId)
      })
      .catch((err) => { if (mounted) setError(err.message || 'Unable to load billing details.') })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!selectedId) { setInvoice(null); return }
    let mounted = true
    setDetailLoading(true)
    getBillInvoice(selectedId)
      .then((data) => { if (mounted) setInvoice(data) })
      .catch((err) => { if (mounted) { setInvoice(null); setError(err.message || 'Unable to load invoice details.') } })
      .finally(() => { if (mounted) setDetailLoading(false) })
    return () => { mounted = false }
  }, [selectedId])

  const itemSubtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.amount || 0) * Number(item.quantity || 1), 0), [items])
  const filteredBills = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return bills.filter((bill) => {
      const matchesFilter = filter === 'all' || bill.status === filter
      const matchesQuery = !normalized || [bill.invoiceNo, bill.patientId?.fullName, bill.patientId?.email]
        .some((value) => String(value || '').toLowerCase().includes(normalized))
      return matchesFilter && matchesQuery
    })
  }, [bills, filter, query])
  const selectedBill = invoice?.bill || bills.find((bill) => billId(bill) === selectedId)

  function selectBill(id) {
    setSelectedId(id)
    setSearchParams(id ? { invoice: id } : {})
    setError('')
    setNotice('')
  }

  function updateItem(index, key, value) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item))
  }

  async function submitBill(event) {
    event.preventDefault()
    setSaving(true); setError(''); setNotice('')
    try {
      const created = await createBill({
        patientId,
        items: items.map((item) => ({ description: item.description.trim(), amount: Number(item.amount), quantity: Number(item.quantity || 1) })),
        tax: Number(tax || 0),
        notes: notes.trim(),
      })
      await loadBills()
      setFormOpen(false)
      setPatientId(''); setItems([emptyItem()]); setTax('0'); setNotes('')
      selectBill(billId(created))
      setNotice('Invoice created successfully.')
    } catch (err) {
      setError(err.message || 'Unable to create invoice.')
    } finally {
      setSaving(false)
    }
  }

  async function processPayment(provider) {
    if (!selectedBill || processing) return
    setProcessing(provider); setError(''); setNotice('')
    try {
      const returnTo = `/billing?invoice=${encodeURIComponent(billId(selectedBill))}`
      const returnUrl = `${window.location.origin}/payments/khalti/return?return_to=${encodeURIComponent(returnTo)}`
      const result = await initiateBillingPayment(provider, billId(selectedBill), returnUrl)
      sessionStorage.setItem('billing_return_to', returnTo)
      if (provider === 'khalti') {
        window.location.assign(result.payment?.paymentUrl || result.paymentUrl)
      } else {
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = result.paymentUrl
        Object.entries(result.formData || {}).forEach(([name, value]) => {
          const input = document.createElement('input')
          input.type = 'hidden'; input.name = name; input.value = value
          form.appendChild(input)
        })
        document.body.appendChild(form)
        form.submit()
      }
    } catch (err) {
      setError(err.message || `Unable to start ${provider} payment.`)
      setProcessing('')
    }
  }

  const totalOutstanding = bills.filter((bill) => bill.status === 'unpaid').reduce((sum, bill) => sum + Number(bill.total || 0), 0)
  const completedPayments = invoice?.payments?.filter((payment) => payment.status === 'completed') || []

  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-page__main container">
        <div className="dashboard-page__head">
          <div><h1>Billing details</h1><p>Create invoices, review payment history, and process patient payments.</p></div>
          <div className="dashboard-page__actions">
            <button className="btn btn--primary" type="button" onClick={() => { setFormOpen((open) => !open); setError(''); setNotice('') }}>{formOpen ? 'Close invoice form' : 'Create invoice'}</button>
            <Link className="btn btn--outline" to="/dashboard">Back to dashboard</Link>
          </div>
        </div>
        <div className="billing-page__summary">
          <article><span>Invoices</span><strong>{bills.length}</strong></article>
          <article><span>Unpaid invoices</span><strong>{bills.filter((bill) => bill.status === 'unpaid').length}</strong></article>
          <article><span>Outstanding balance</span><strong>{currency(totalOutstanding)}</strong></article>
        </div>
        {error && <p className="auth-page__error" role="alert">{error}</p>}
        {notice && <p className="dashboard-page__success" role="status">{notice}</p>}

        {formOpen && <section className="billing-page__create">
          <div className="dashboard-page__section-head"><h2>New patient invoice</h2><p>Add billable services and charges. Totals are calculated automatically.</p></div>
          <form className="billing-page__form" onSubmit={submitBill}>
            <label className="billing-page__wide">Patient<select value={patientId} onChange={(event) => setPatientId(event.target.value)} required><option value="">Choose a patient</option>{patients.map((patient) => <option key={patient.id || patient._id} value={patient.id || patient._id}>{patient.fullName} · {patient.email}</option>)}</select></label>
            <div className="billing-page__line-items billing-page__wide">
              <div className="billing-page__line-head"><h3>Invoice items</h3><button className="btn btn--outline" type="button" onClick={() => setItems((current) => [...current, emptyItem()])}>Add item</button></div>
              {items.map((item, index) => <div className="billing-page__line" key={index}>
                <label>Description<input required value={item.description} onChange={(event) => updateItem(index, 'description', event.target.value)} placeholder="Consultation, lab test…" /></label>
                <label>Rate (Rs)<input required type="number" min="0" step="0.01" value={item.amount} onChange={(event) => updateItem(index, 'amount', event.target.value)} /></label>
                <label>Qty<input required type="number" min="1" step="1" value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} /></label>
                {items.length > 1 && <button className="billing-page__remove" type="button" aria-label={`Remove item ${index + 1}`} onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>×</button>}
              </div>)}
            </div>
            <label>Tax (Rs)<input type="number" min="0" step="0.01" value={tax} onChange={(event) => setTax(event.target.value)} /></label>
            <label className="billing-page__wide">Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows="2" /></label>
            <div className="billing-page__form-total">Subtotal <strong>{currency(itemSubtotal)}</strong><span>Tax {currency(tax)}</span><b>Total {currency(itemSubtotal + Number(tax || 0))}</b></div>
            <button className="btn btn--primary" type="submit" disabled={saving || !patientId}>{saving ? 'Creating…' : 'Create invoice'}</button>
          </form>
        </section>}

        <div className="billing-page__layout">
          <section className="billing-page__directory">
            <div className="dashboard-page__section-head"><h2>Invoices</h2><p>{loading ? 'Loading invoices…' : `${filteredBills.length} shown`}</p></div>
            <label className="billing-page__search"><span className="sr-only">Search invoices</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search invoice or patient" /></label>
            <div className="billing-page__filters" role="group" aria-label="Filter invoices">
              {['all', 'unpaid', 'paid', 'draft', 'void'].map((value) => <button type="button" key={value} className={filter === value ? 'billing-page__filter billing-page__filter--active' : 'billing-page__filter'} onClick={() => setFilter(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}
            </div>
            <div className="billing-page__list">
              {filteredBills.map((bill) => <button type="button" key={billId(bill)} className={`billing-page__invoice ${selectedId === billId(bill) ? 'billing-page__invoice--active' : ''}`} onClick={() => selectBill(billId(bill))}>
                <span><strong>{bill.invoiceNo}</strong><small>{bill.patientId?.fullName || 'Patient'}</small></span><span className="billing-page__invoice-right"><b>{currency(bill.total)}</b><small className={`billing-page__status billing-page__status--${bill.status}`}>{bill.status}</small></span>
              </button>)}
              {!loading && filteredBills.length === 0 && <p className="dashboard-page__note">No invoices match this view.</p>}
            </div>
          </section>

          <section className="billing-page__detail">
            {detailLoading ? <p className="dashboard-page__note">Loading invoice…</p> : !selectedBill ? (
              <div className="billing-page__empty"><h2>Select an invoice</h2><p>Choose an invoice to see its itemized details and payment history.</p></div>
            ) : <>
              <div className="billing-page__detail-head"><div><span className="billing-page__eyebrow">Invoice</span><h2>{selectedBill.invoiceNo}</h2><p>{selectedBill.patientId?.fullName || invoice?.bill?.patientId?.fullName || 'Patient'}</p></div><span className={`billing-page__status billing-page__status--${selectedBill.status}`}>{selectedBill.status}</span></div>
              <div className="billing-page__patient-meta"><span>{selectedBill.patientId?.email || invoice?.bill?.patientId?.email || ''}</span><span>Issued {new Date(selectedBill.createdAt).toLocaleDateString()}</span></div>
              <div className="billing-page__table-wrap"><table className="billing-page__table"><thead><tr><th>Service</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>{(selectedBill.items || []).map((item, index) => <tr key={`${item.description}-${index}`}><td>{item.description}</td><td>{item.quantity}</td><td>{currency(item.amount)}</td><td>{currency(Number(item.amount) * Number(item.quantity || 1))}</td></tr>)}</tbody></table></div>
              <div className="billing-page__totals"><span>Subtotal <b>{currency(selectedBill.subtotal)}</b></span><span>Tax <b>{currency(selectedBill.tax)}</b></span><strong>Total due <b>{currency(selectedBill.total)}</b></strong></div>
              {selectedBill.notes && <p className="billing-page__notes"><strong>Notes</strong><br />{selectedBill.notes}</p>}
              {selectedBill.status === 'unpaid' && <div className="billing-page__payment"><h3>Process payment</h3><p>Choose a configured payment provider to continue to its secure checkout.</p><div className="billing-page__payment-actions">
                {['khalti', 'esewa'].map((provider) => <button type="button" className="btn btn--primary" key={provider} disabled={!providerStatus[provider] || Boolean(processing)} onClick={() => processPayment(provider)}>{processing === provider ? 'Connecting…' : `Pay with ${provider === 'khalti' ? 'Khalti' : 'eSewa'}`}</button>)}
              </div>{!providerStatus.khalti && !providerStatus.esewa && <small className="billing-page__provider-note">Payment providers are not configured. You can still review and print this invoice.</small>}</div>}
              <div className="billing-page__payments"><h3>Payment history <span>{invoice?.payments?.length || 0}</span></h3>{invoice?.payments?.length ? invoice.payments.map((payment) => <div className="billing-page__payment-row" key={payment._id}><span><strong>{payment.provider}</strong><small>{new Date(payment.createdAt).toLocaleString()}{payment.transactionId ? ` · ${payment.transactionId}` : ''}</small></span><span>{currency(payment.amount)}<small className={`billing-page__status billing-page__status--${payment.status}`}>{payment.status}</small></span></div>) : <p className="dashboard-page__note">No payments have been recorded for this invoice.</p>}</div>
              {completedPayments.length > 0 && <p className="billing-page__paid-note">{currency(completedPayments.reduce((sum, payment) => sum + Number(payment.amount), 0))} received across {completedPayments.length} completed payment{completedPayments.length === 1 ? '' : 's'}.</p>}
            </>}
          </section>
        </div>
      </main>
      <BackToTop />
      <Footer />
    </div>
  )
}

export default BillingPage
