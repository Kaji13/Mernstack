import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { verifyKhaltiPayment, verifyEsewaPayment } from '../api'
import './AuthPage.css'

function PaymentReturnPage() {
  const [params] = useSearchParams()
  const [status, setStatus] = useState('Verifying payment…')
  const pidx = params.get('pidx')
  const transactionUuid = params.get('transaction_uuid')
  const isEsewa = Boolean(transactionUuid)

  useEffect(() => {
    if (!pidx && !transactionUuid) {
      setStatus('Missing payment reference')
      return
    }
    ;(isEsewa ? verifyEsewaPayment(transactionUuid) : verifyKhaltiPayment(pidx))
      .then((data) => setStatus(data.message || 'Payment checked'))
      .catch((err) => setStatus(err.message))
  }, [isEsewa, pidx, transactionUuid])

  return (
    <div className="auth-page">
      <Navbar />
      <main className="auth-page__main">
        <div className="auth-page__card">
          <div className="auth-page__head">
            <h1>{isEsewa ? 'eSewa' : 'Khalti'} payment</h1>
            <p>{status}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default PaymentReturnPage
