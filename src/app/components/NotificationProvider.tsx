'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useNotifications, NotificationState, setGlobalNotificationHandler } from '../hooks/useNotifications'
import { NotificationContainer } from './ui/Notification'

const NotificationContext = createContext<NotificationState | null>(null)

interface NotificationProviderProps {
  children: ReactNode
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children, 
  position = 'top-right' 
}) => {
  const notificationHandler = useNotifications()

  // Set global handler for components that can't access context
  React.useEffect(() => {
    setGlobalNotificationHandler(notificationHandler)
  }, [notificationHandler])

  return (
    <NotificationContext.Provider value={notificationHandler}>
      {children}
      <NotificationContainer
        notifications={notificationHandler.notifications}
        onRemove={notificationHandler.removeNotification}
        position={position}
      />
    </NotificationContext.Provider>
  )
}

export const useNotificationContext = (): NotificationState => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider')
  }
  return context
}