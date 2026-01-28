"use client"

import { useRef, useEffect, useState } from "react"
import { sendMessage, editMessage, deleteMessage } from "@/app/actions/messaging"

type Attachment = {
  id: string
  url: string
  name: string
  type: string
}

type Message = {
  id: string
  message: string
  createdAt: Date
  senderName: string | null
  senderType: string
  senderId: string | null
  isDeleted: boolean
  parentId: string | null
  parent?: {
    senderName: string | null
    message: string
  } | null
  attachments: Attachment[]
}

export function ApplicationMessageThread({
  messages,
  applicationId,
  applicationType,
  currentUserId,
  isAdmin = false
}: {
  messages: Message[]
  applicationId: string
  applicationType: "internship" | "membership" | "volunteer"
  currentUserId: string
  isAdmin?: boolean
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    if (scrollRef.current && !editingMessageId) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, editingMessageId])

  const handleEditClick = (msg: Message) => {
    setEditingMessageId(msg.id)
    setEditContent(msg.message)
    setReplyingTo(null)
  }

  const handleReplyClick = (msg: Message) => {
    setReplyingTo(msg)
    setEditingMessageId(null)
    // Focus input?
    setTimeout(() => {
      const input = formRef.current?.querySelector('input[name="message"]') as HTMLInputElement
      if (input) input.focus()
    }, 100)
  }

  const handleDeleteClick = async (msgId: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      const formData = new FormData()
      formData.append("messageId", msgId)
      await deleteMessage(formData)
    }
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditContent("")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-background shadow-sm">
      <div className="p-4 border-b bg-muted/40">
        <h3 className="font-semibold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Messages & Updates
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const alignRight = isAdmin ? msg.senderType === "Admin" : msg.senderType === "User"
            const isSender = msg.senderId === currentUserId
            const canEdit = isSender || isAdmin 
            const canDelete = isSender || isAdmin

            if (msg.isDeleted) {
              return (
                <div key={msg.id} className={`flex flex-col ${alignRight ? "items-end" : "items-start"}`}>
                  <div className="text-xs italic text-muted-foreground border p-2 rounded bg-muted/20">
                    This message was deleted.
                  </div>
                </div>
              )
            }
            
            return (
              <div key={msg.id} className={`flex flex-col ${alignRight ? "items-end" : "items-start"}`}>
                <div className={`max-w-[85%] rounded-lg p-3 group relative ${
                  alignRight 
                    ? "bg-primary text-primary-foreground rounded-br-none" 
                    : "bg-muted text-foreground rounded-bl-none"
                }`}>
                  {/* Reply Context */}
                  {msg.parent && (
                    <div className={`mb-2 text-xs border-l-2 pl-2 py-1 opacity-80 ${alignRight ? "border-primary-foreground/50" : "border-foreground/20"}`}>
                      <div className="font-semibold">{msg.parent.senderName}</div>
                      <div className="truncate max-w-[200px]">{msg.parent.message}</div>
                    </div>
                  )}

                  {editingMessageId === msg.id ? (
                    <form 
                      action={async (formData) => {
                        await editMessage(formData)
                        setEditingMessageId(null)
                      }}
                      className="flex flex-col gap-2 min-w-[250px]"
                    >
                      <input type="hidden" name="messageId" value={msg.id} />
                      <textarea
                        name="message"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        rows={3}
                        required
                      />
                      <div className="flex justify-end gap-2">
                        <button 
                          type="button" 
                          onClick={handleCancelEdit}
                          className="text-xs hover:underline text-foreground/80"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="bg-primary-foreground text-primary px-2 py-1 rounded text-xs font-medium hover:bg-primary-foreground/90 border border-primary/20"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p className="text-sm whitespace-pre-wrap pr-16">{msg.message}</p>
                      
                      {/* Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.attachments.map(att => (
                            <a 
                              key={att.id} 
                              href={att.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={`flex items-center gap-1 text-xs hover:underline ${alignRight ? "text-primary-foreground/90" : "text-primary"}`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                              {att.name}
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Actions: Edit, Reply, Delete */}
                      <div className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1`}>
                        <button
                          onClick={() => handleReplyClick(msg)}
                          className={`p-1 rounded-full hover:bg-black/10 ${alignRight ? 'text-primary-foreground' : 'text-foreground'}`}
                          title="Reply"
                          type="button"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => handleEditClick(msg)}
                            className={`p-1 rounded-full hover:bg-black/10 ${alignRight ? 'text-primary-foreground' : 'text-foreground'}`}
                            title="Edit"
                            type="button"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteClick(msg.id)}
                            className={`p-1 rounded-full hover:bg-black/10 ${alignRight ? 'text-primary-foreground' : 'text-foreground'}`}
                            title="Delete"
                            type="button"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground">
                    {msg.senderName} ({msg.senderType})
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {replyingTo && (
        <div className="px-4 py-2 bg-muted/30 border-t flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold">Replying to {replyingTo.senderName}:</span>
            <span className="text-muted-foreground truncate max-w-[200px]">{replyingTo.message}</span>
          </div>
          <button onClick={() => setReplyingTo(null)} className="text-muted-foreground hover:text-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      )}

      {selectedFile && (
         <div className="px-4 py-2 bg-muted/30 border-t flex items-center justify-between text-xs">
           <div className="flex items-center gap-2">
             <span className="font-semibold">Attachment:</span>
             <span className="text-muted-foreground">{selectedFile.name}</span>
           </div>
           <button onClick={() => setSelectedFile(null)} className="text-muted-foreground hover:text-foreground">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
           </button>
         </div>
      )}

      <div className="p-4 border-t bg-muted/10">
        <form 
          action={async (formData) => {
            if (replyingTo) formData.append("parentId", replyingTo.id)
            if (selectedFile) formData.append("file", selectedFile)
            
            await sendMessage(formData)
            formRef.current?.reset()
            setReplyingTo(null)
            setSelectedFile(null)
            if (fileInputRef.current) fileInputRef.current.value = ""
          }}
          ref={formRef}
          className="flex gap-2 items-end"
        >
          <input type="hidden" name={`${applicationType}AppId`} value={applicationId} />
          <input type="hidden" name="senderType" value={isAdmin ? "Admin" : "User"} />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md mb-0.5"
            title="Attach file"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
          />

          <input 
            name="message" 
            className="flex-1 min-h-[40px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Type your message..."
            // Not required if file is attached
            required={!selectedFile}
          />
          <button 
            type="submit"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10 p-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            <span className="sr-only">Send</span>
          </button>
        </form>
      </div>
    </div>
  )
}
