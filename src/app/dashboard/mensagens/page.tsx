'use client'

import { Card } from '@/components/ui/card'
import { useChat } from './_hooks/use-chat'
import { ChatSidebar } from './_components/chat-sidebar'
import { ChatHeader } from './_components/chat-header'
import { MessagesList } from './_components/messages-list'
import { MessageInput } from './_components/message-input'
import { EmptyChatState } from './_components/empty-chat-state'
import { MessagesHeader } from './_components/messages-header'

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
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-700 px-4">
      <MessagesHeader />

      <div className="h-[calc(100vh-16rem)] md:h-[calc(100vh-14rem)] min-h-[500px] flex flex-col md:flex-row gap-6 sm:gap-8">
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
        <div className="flex-1 flex flex-col h-full overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
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
              <div className="p-4 sm:p-6 bg-slate-50/50 border-t border-slate-100">
                <MessageInput
                  value={newMessage}
                  onChange={setNewMessage}
                  onSend={handleSend}
                  isSending={isSending}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
