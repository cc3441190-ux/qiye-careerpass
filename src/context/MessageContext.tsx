import { createContext, useContext, useState, ReactNode } from 'react'

const messagesData = [
  { id: 'MSG-001', unread: true },
  { id: 'MSG-002', unread: true },
  { id: 'MSG-003', unread: false },
  { id: 'MSG-004', unread: false },
  { id: 'MSG-005', unread: false },
]

interface MessageContextType {
  unreadCount: number
  markAllRead: () => void
}

const MessageContext = createContext<MessageContextType>({
  unreadCount: 0,
  markAllRead: () => {},
})

export function MessageProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(
    messagesData.filter(m => m.unread).length
  )

  const markAllRead = () => setUnreadCount(0)

  return (
    <MessageContext.Provider value={{ unreadCount, markAllRead }}>
      {children}
    </MessageContext.Provider>
  )
}

export function useMessage() {
  return useContext(MessageContext)
}
