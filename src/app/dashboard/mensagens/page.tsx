'use client'

import { Card } from '@/components/ui/card'
import { useChat } from './_hooks/use-chat'
import { ChatSidebar } from './_components/chat-sidebar'
import { ChatHeader } from './_components/chat-header'
import { MessagesList } from './_components/messages-list'
import { MessageInput } from './_components/message-input'
import { EmptyChatState } from './_components/empty-chat-state'

export default function MessagesPage() {
  const {
    conversations,
    selectedChat,
    messages,
    selectedId,
    selectConversation,
    isLoadingConvs,
    isLoadingMsgs,
    newMessage,
    setNewMessage,
    isSending,
    myUserId,
    searchTerm,
    setSearchTerm,
    handleSend,
    messagesEndRef,
  } = useChat()

  return (
    <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
      {/* Sidebar / Conversation List */}
      <ChatSidebar
        conversations={conversations}
        selectedId={selectedId}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isLoading={isLoadingConvs}
        onSelect={selectConversation}
      />

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col h-full overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-sm shadow-sm">
        {!selectedId ? (
          <EmptyChatState />
        ) : (
          <>
            {/* Chat Header */}
            <ChatHeader chat={selectedChat} />

            {/* Messages List */}
            <MessagesList
              messages={messages}
              myUserId={myUserId}
              isLoading={isLoadingMsgs}
              messagesEndRef={messagesEndRef}
            />

            {/* Input Area */}
            <MessageInput
              value={newMessage}
              onChange={setNewMessage}
              onSend={handleSend}
              isSending={isSending}
            />
          </>
        )}
      </Card>
    </div>
  )
}
