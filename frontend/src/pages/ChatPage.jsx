import { useEffect, useMemo, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackToTop from '../components/BackToTop'
import { getChatContacts, getChatConversations, getChatMessages, sendChatMessage } from '../api'
import { getSession } from '../authStorage'
import { io } from 'socket.io-client'
import { useNavigate } from 'react-router-dom'
import './DashboardPage.css'

function ChatPage() {
  const navigate = useNavigate()
  const session = getSession()
  const [conversations, setConversations] = useState([])
  const [contacts, setContacts] = useState([])
  const [messages, setMessages] = useState([])
  const [activeContact, setActiveContact] = useState(null)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef(null)

  const socketUrl = useMemo(() => import.meta.env.VITE_SOCKET_URL || window.location.origin, [])

  useEffect(() => {
    if (!session?.token) {
      navigate('/login')
      return
    }
    Promise.all([getChatConversations(), getChatContacts()])
      .then(([conversationList, contactList]) => {
        setConversations(conversationList)
        setContacts(contactList)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))

    const socket = io(socketUrl, {
      auth: { token: session.accessToken || session.token },
      transports: ['websocket', 'polling'],
    })
    socket.on('connect', () => setIsConnected(true))
    socket.on('disconnect', () => setIsConnected(false))
    socket.on('chat:message', (message) => {
      setMessages((prev) => prev.some((item) => item._id === message._id) ? prev : [...prev, message])
      setConversations((prev) => {
        const contactId = String(message.senderId) === String(session.user?.id) ? message.receiverId : message.senderId
        const existing = prev.find((item) => item.conversationId === message.conversationId)
        const next = {
          conversationId: message.conversationId,
          lastMessage: message.text,
          updatedAt: message.createdAt,
          contact: existing?.contact || contacts.find((item) => String(item.id) === String(contactId)) || null,
        }
        return [next, ...prev.filter((item) => item.conversationId !== message.conversationId)]
      })
    })
    return () => socket.disconnect()
  }, [navigate, session?.token, session?.accessToken, session?.user?.id, socketUrl])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const openConversation = async (contact) => {
    const conversationId = [String(session.user.id), String(contact.id)].sort().join(':')
    setActiveContact(contact)
    setMessages([])
    setError('')
    try {
      const data = await getChatMessages(conversationId)
      setMessages(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSend = async (event) => {
    event.preventDefault()
    if (!activeContact || !text.trim()) return
    setSending(true)
    setError('')
    try {
      const message = await sendChatMessage({ receiverId: activeContact.id, text: text.trim() })
      setMessages((prev) => prev.some((item) => item._id === message._id) ? prev : [...prev, message])
      setText('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const people = [...conversations.map((item) => item.contact).filter(Boolean), ...contacts]
    .filter((person, index, all) => all.findIndex((candidate) => String(candidate.id) === String(person.id)) === index)

  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-page__main container">
        <div className="chat-page__heading">
          <div>
            <h1>Care chat</h1>
            <p>Private messages between patients and their care team.</p>
          </div>
          <span className={`chat-page__connection ${isConnected ? 'chat-page__connection--online' : ''}`}>
            {isConnected ? 'Live' : 'Connecting'}
          </span>
        </div>
        {error && <p className="auth-page__error">{error}</p>}
        <div className="chat-page__layout">
          <aside className="chat-page__panel">
            <h2>{session.user?.role === 'patient' ? 'Your doctors' : 'Your patients'}</h2>
            {loading && <p className="chat-page__muted">Loading conversations…</p>}
            {!loading && people.length === 0 && <p className="chat-page__muted">No contacts are available yet.</p>}
            <div className="chat-page__contact-list">
              {people.map((person) => {
                const conversation = conversations.find((item) => String(item.contact?.id) === String(person.id))
                return (
                  <button
                    key={person.id}
                    type="button"
                    className={`chat-page__contact ${String(activeContact?.id) === String(person.id) ? 'chat-page__contact--active' : ''}`}
                    onClick={() => openConversation(person)}
                  >
                    <span className="chat-page__avatar">{person.name?.slice(0, 1).toUpperCase()}</span>
                    <span>
                      <strong>{person.name}</strong>
                      <small>{conversation?.lastMessage || person.subtitle || person.role}</small>
                    </span>
                  </button>
                )
              })}
            </div>
          </aside>
          <section className="chat-page__thread">
            {!activeContact ? (
              <div className="chat-page__empty"><span>✦</span><h2>Choose a conversation</h2><p>Select a doctor or patient to start a secure care chat.</p></div>
            ) : (
              <>
                <header className="chat-page__thread-head">
                  <span className="chat-page__avatar">{activeContact.name?.slice(0, 1).toUpperCase()}</span>
                  <div><h2>{activeContact.name}</h2><p>{activeContact.subtitle || activeContact.role}</p></div>
                </header>
                <div className="chat-page__messages" aria-live="polite">
                  {messages.length === 0 && <p className="chat-page__muted">No messages yet. Send a message to begin.</p>}
                  {messages.map((item) => {
                    const mine = String(item.senderId) === String(session.user?.id)
                    return <div key={item._id} className={`chat-page__bubble ${mine ? 'chat-page__bubble--mine' : ''}`}><p>{item.text}</p><small>{new Date(item.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</small></div>
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <form className="chat-page__form" onSubmit={handleSend}>
                  <input placeholder={`Message ${activeContact.name}`} value={text} onChange={(event) => setText(event.target.value)} maxLength="2000" required />
                  <button className="btn btn--primary" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send'}</button>
                </form>
              </>
            )}
          </section>
        </div>
      </main>
      <BackToTop />
      <Footer />
    </div>
  )
}

export default ChatPage
