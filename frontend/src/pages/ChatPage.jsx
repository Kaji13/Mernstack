import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackToTop from '../components/BackToTop'
import { getChatConversations, getChatMessages, sendChatMessage } from '../api'
import { getSession } from '../authStorage'
import { io } from 'socket.io-client'
import { useNavigate } from 'react-router-dom'
import './DashboardPage.css'

function ChatPage() {
  const navigate = useNavigate()
  const session = getSession()
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [receiverId, setReceiverId] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  const socketUrl = useMemo(() => import.meta.env.VITE_SOCKET_URL || window.location.origin, [])

  useEffect(() => {
    if (!session?.token) {
      navigate('/login')
      return
    }
    getChatConversations().then(setConversations).catch((err) => setError(err.message))

    const socket = io(socketUrl, {
      auth: { token: session.accessToken || session.token },
      transports: ['websocket', 'polling'],
    })
    socket.on('chat:message', (message) => {
      setMessages((prev) => [...prev, message])
    })
    return () => socket.disconnect()
  }, [navigate, session?.token, session?.accessToken, socketUrl])

  const openConversation = async (conversationId) => {
    try {
      const data = await getChatMessages(conversationId)
      setMessages(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSend = async (event) => {
    event.preventDefault()
    try {
      const message = await sendChatMessage({ receiverId, text })
      setMessages((prev) => [...prev, message])
      setText('')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-page__main container">
        <h1>Patient ↔ doctor chat</h1>
        {error && <p className="auth-page__error">{error}</p>}
        <div className="chat-page__layout">
          <aside className="chat-page__panel">
            <h3>Conversations</h3>
            {conversations.map((item) => (
              <button key={item._id} type="button" className="btn btn--outline" onClick={() => openConversation(item.conversationId)}>
                {item.conversationId}
              </button>
            ))}
          </aside>
          <section className="chat-page__thread">
            <div className="chat-page__messages">
              {messages.map((item) => (
                <p key={item._id}><strong>{item.senderRole}:</strong> {item.text}</p>
              ))}
            </div>
            <form className="chat-page__form" onSubmit={handleSend}>
              <input
                placeholder="Receiver user id"
                value={receiverId}
                onChange={(event) => setReceiverId(event.target.value)}
                required
              />
              <input
                placeholder="Message"
                value={text}
                onChange={(event) => setText(event.target.value)}
                required
              />
              <button className="btn btn--primary" type="submit">Send</button>
            </form>
          </section>
        </div>
      </main>
      <BackToTop />
      <Footer />
    </div>
  )
}

export default ChatPage
