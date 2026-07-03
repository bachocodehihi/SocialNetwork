'use client';
import Navbar from '@/components/Navbar';
import { MessageSquare, Search, Send, User, Phone, Video, Info } from 'lucide-react';
import { useState } from 'react';

const MOCK_CONVERSATIONS = [
  { id: '1', name: 'Nguyễn Văn A', avatar: '', lastMessage: 'Ê, chiều nay đi đá bóng không?', time: '10:30', unread: 2, online: true },
  { id: '2', name: 'Trần Thị B', avatar: '', lastMessage: 'Dạ vâng, để em gửi tài liệu qua ạ.', time: 'Hôm qua', unread: 0, online: false },
  { id: '3', name: 'Lê Văn C', avatar: '', lastMessage: 'Ảnh đẹp quá bạn ơi!', time: '2 ngày trước', unread: 0, online: true },
];

export default function MessagePage() {
  const [selectedChat, setSelectedChat] = useState<any>(MOCK_CONVERSATIONS[0]);

  return (
    <div className="min-h-screen bg-grey/5 flex flex-col font-sans">
      <Navbar activeTab="message" />

      {/* Main Messaging Container */}
      <div className="flex-1 pt-16 flex overflow-hidden h-[calc(100vh-64px)]">
        
        {/* Left Panel: Conversations List */}
        <div className="w-80 md:w-96 bg-white border-r border-grey/20 flex flex-col flex-shrink-0">
          
          {/* Search bar inside messenger */}
          <div className="p-4 border-b border-grey/10">
            <div className="flex items-center bg-grey/10 hover:bg-grey/15 transition rounded-full px-3.5 py-2">
              <Search className="w-4.5 h-4.5 text-grey mr-2 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Tìm kiếm cuộc trò chuyện..." 
                className="bg-transparent border-none outline-none text-sm w-full placeholder-grey/60 text-grey-hover font-medium"
              />
            </div>
          </div>

          {/* Conversations list scrollable */}
          <div className="flex-1 overflow-y-auto divide-y divide-grey/5">
            {MOCK_CONVERSATIONS.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`flex items-center gap-3.5 p-4 cursor-pointer transition duration-150 ${
                  selectedChat?.id === chat.id 
                    ? 'bg-blue/5 border-l-4 border-blue' 
                    : 'hover:bg-grey/5'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-grey/10 border border-grey/25 overflow-hidden flex items-center justify-center">
                    {chat.avatar ? (
                      <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-grey/60" />
                    )}
                  </div>
                  {chat.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-grey-hover truncate text-[14.5px]">{chat.name}</h4>
                    <span className="text-[11px] text-grey/60">{chat.time}</span>
                  </div>
                  <p className={`text-xs truncate ${chat.unread > 0 ? 'text-black font-bold' : 'text-grey/70'}`}>
                    {chat.lastMessage}
                  </p>
                </div>

                {chat.unread > 0 && (
                  <span className="flex-shrink-0 bg-blue text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {chat.unread}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Chat Room Details / Placeholder */}
        <div className="flex-1 bg-white flex flex-col min-w-0">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="h-16 px-6 border-b border-grey/20 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-grey/10 border border-grey/25 overflow-hidden flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-grey/60" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-grey-hover truncate text-base">{selectedChat.name}</h3>
                    <p className="text-[11px] text-green-500 font-semibold">
                      {selectedChat.online ? 'Đang hoạt động' : 'Ngoại tuyến'}
                    </p>
                  </div>
                </div>

                {/* Call controls */}
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-full hover:bg-grey/10 text-grey transition border-0 bg-transparent cursor-pointer">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-grey/10 text-grey transition border-0 bg-transparent cursor-pointer">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-grey/10 text-grey transition border-0 bg-transparent cursor-pointer">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Chat screen body */}
              <div className="flex-1 p-6 bg-grey/5 overflow-y-auto flex flex-col justify-center items-center text-center">
                <div className="max-w-md bg-white p-8 rounded-2xl border border-grey/20 shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-blue/10 text-blue flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-bold text-grey-hover mb-2">Trò chuyện với {selectedChat.name}</h2>
                  <p className="text-sm text-grey/70 mb-5 leading-relaxed">
                    Tính năng gửi nhận tin nhắn trực tuyến (Realtime Chat) đang được hoàn thiện. Vui lòng kết nối với ứng dụng Flutter hoặc quay lại sau!
                  </p>
                  <a
                    href="/home"
                    className="inline-block bg-blue hover:bg-blue-hover text-white text-sm font-bold px-6 py-2.5 rounded-full transition duration-150 shadow-sm"
                  >
                    Quay về Bảng tin
                  </a>
                </div>
              </div>

              {/* Message Composer (Disabled mock input) */}
              <div className="p-4 border-t border-grey/20 bg-white flex items-center gap-3">
                <input 
                  type="text" 
                  disabled
                  placeholder="Gửi tin nhắn (Tính năng đang khóa)..." 
                  className="flex-1 bg-grey/10 border-none outline-none text-sm rounded-full py-3 px-5 text-grey/50 cursor-not-allowed"
                />
                <button 
                  disabled 
                  className="w-11 h-11 bg-grey/20 text-grey/40 rounded-full flex items-center justify-center cursor-not-allowed border-none"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-grey/5">
              <div className="w-16 h-16 rounded-full bg-blue/10 text-blue flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-grey-hover mb-1">Chưa chọn hội thoại</h3>
              <p className="text-sm text-grey/60">Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
