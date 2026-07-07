'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { NETWORK } from '@/config/config';
import { useAlert } from '@/components/Alert/alertcontext';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Volume2, VolumeX, User, ShieldAlert } from 'lucide-react';

interface CallInfo {
  callId: string;
  conversationId: string;
  callType: 'voice' | 'video';
  remoteUser: {
    _id: string;
    username: string;
    avatar: string;
  };
  isIncoming: boolean;
}

interface CallContextType {
  socket: Socket | null;
  callState: 'idle' | 'ringing' | 'calling' | 'connected' | 'ended';
  currentCall: CallInfo | null;
  isMuted: boolean;
  isCameraOn: boolean;
  callDuration: number;
  startCall: (receiverId: string, conversationId: string, receiverInfo: any, type?: 'voice' | 'video') => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  connectSocket: (token: string) => void;
  disconnectSocket: () => void;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [callState, setCallState] = useState<'idle' | 'ringing' | 'calling' | 'connected' | 'ended'>('idle');
  const [currentCall, setCurrentCall] = useState<CallInfo | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  const [agoraSdk, setAgoraSdk] = useState<any>(null);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);

  const agoraClientRef = useRef<any>(null);
  const localAudioTrackRef = useRef<any>(null);
  const localVideoTrackRef = useRef<any>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const ringtoneCleanRef = useRef<(() => void) | null>(null);
  const latestCallStateRef = useRef(callState);

  const { showError, showSuccess } = useAlert();

  // Sync ref to always have latest callState in socket listeners
  useEffect(() => {
    latestCallStateRef.current = callState;
  }, [callState]);

  // Dynamically import Agora Web SDK on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('agora-rtc-sdk-ng').then((module) => {
        setAgoraSdk(module.default);
      });
    }
  }, []);

  // Web Audio API Ringtone Synthesizer
  const startRingtone = () => {
    if (typeof window === 'undefined') return () => {};
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return () => {};

      const audioCtx = new AudioCtxClass();
      let ringInterval: NodeJS.Timeout | null = null;

      const playRing = () => {
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        // Standard USA Ringback Tone: 440Hz + 480Hz
        osc1.frequency.value = 440;
        osc2.frequency.value = 480;

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);

        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        // Fade in ring
        gain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.15);
        // Hold ring
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime + 1.6);
        // Fade out ring
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.95);

        osc1.start();
        osc2.start();

        setTimeout(() => {
          try {
            osc1.stop();
            osc2.stop();
            osc1.disconnect();
            osc2.disconnect();
            gain.disconnect();
          } catch (e) {}
        }, 2000);
      };

      playRing();
      ringInterval = setInterval(playRing, 3500);

      return () => {
        if (ringInterval) clearInterval(ringInterval);
        try {
          audioCtx.close();
        } catch (e) {}
      };
    } catch (err) {
      console.error('Failed to create ringtone synthesizer:', err);
      return () => {};
    }
  };

  // Connect socket with given token
  const connectSocket = (token: string) => {
    if (socket) return;
    const socketUrl = NETWORK.wsUrl.replace('ws://', 'http://').replace('wss://', 'https://');
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('⚡ Call Socket connected');
    });

    newSocket.on('call_incoming', (data: any) => {
      // If already in a call, notify peer we are busy
      if (latestCallStateRef.current !== 'idle') {
        newSocket.emit('call_reject', { callId: data.callId });
        return;
      }

      const callerRaw = data.caller;
      const remoteUser = typeof callerRaw === 'object' && callerRaw !== null
        ? callerRaw
        : { _id: callerRaw, username: 'Người dùng', avatar: '' };

      setCurrentCall({
        callId: data.callId,
        conversationId: data.conversationId,
        callType: data.callType || 'voice',
        remoteUser,
        isIncoming: true
      });
      setCallState('ringing');

      // Start synthesized ringing sound
      if (ringtoneCleanRef.current) ringtoneCleanRef.current();
      ringtoneCleanRef.current = startRingtone();
    });

    newSocket.on('call_accepted', async (data: any) => {
      if (ringtoneCleanRef.current) {
        ringtoneCleanRef.current();
        ringtoneCleanRef.current = null;
      }
      setCallState('calling');
      if (currentCall) {
        setCurrentCall(prev => prev ? { ...prev, callId: data.callId } : null);
        await joinAgoraChannel(currentCall.conversationId, currentCall.callType);
      }
    });

    newSocket.on('call_rejected', () => {
      showError('Cuộc gọi bị từ chối.');
      handleResetCall();
    });

    newSocket.on('call_cancelled', (data: any) => {
      if (data?.reason === 'answered_elsewhere') {
        showSuccess('Cuộc gọi đã được trả lời trên thiết bị khác.');
      } else if (data?.reason === 'rejected_elsewhere') {
        showError('Cuộc gọi đã bị từ chối trên thiết bị khác.');
      } else {
        showError('Cuộc gọi đã bị hủy.');
      }
      handleResetCall();
    });

    newSocket.on('call_ended', () => {
      showSuccess('Cuộc gọi đã kết thúc.');
      handleResetCall();
    });

    newSocket.on('call_busy', () => {
      showError('Đối phương đang bận.');
      handleResetCall();
    });

    newSocket.on('call_error', (err: any) => {
      showError(err.code === 'IN_ANOTHER_CALL' ? 'Bạn đang trong một cuộc gọi khác.' : 'Lỗi kết nối cuộc gọi.');
      handleResetCall();
    });

    setSocket(newSocket);
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  const pathname = usePathname();

  // Auto connect/disconnect based on token existence and path transitions
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      if (!socket) {
        connectSocket(token);
      }
    } else {
      if (socket) {
        disconnectSocket();
      }
    }
  }, [pathname, socket]);

  // Agora implementation
  const joinAgoraChannel = async (channelId: string, type: 'voice' | 'video') => {
    if (!agoraSdk) {
      showError('Agora Web SDK chưa được tải.');
      handleResetCall();
      return;
    }

    try {
      const client = agoraSdk.createClient({ mode: 'rtc', codec: 'vp8' });
      agoraClientRef.current = client;

      // Event handlers
      client.on('user-published', async (user: any, mediaType: 'audio' | 'video') => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'audio') {
          user.audioTrack.play();
        }
        setRemoteUsers(prev => {
          if (prev.find(u => u.uid === user.uid)) return prev;
          return [...prev, user];
        });
      });

      client.on('user-unpublished', (user: any, mediaType: 'audio' | 'video') => {
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
      });

      client.on('user-left', (user: any) => {
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
        // If 1-on-1 call and remote user leaves, end the call
        endCall();
      });

      // Join Agora
      await client.join('63c3b289a0ad46fb90f74f68554f4a9f', channelId, null, null);

      // Create local tracks with resilient fallback
      let audioTrack;
      try {
        audioTrack = await agoraSdk.createMicrophoneAudioTrack();
        localAudioTrackRef.current = audioTrack;
      } catch (audioErr: any) {
        console.error('Failed to create microphone track:', audioErr);
        let msg = 'Không thể truy cập micrô.';
        if (audioErr.code === 'PERMISSION_DENIED' || audioErr.message?.includes('Permission denied')) {
          msg = 'Micrô bị chặn quyền truy cập. Hãy click vào biểu tượng ổ khóa ở góc trái thanh địa chỉ trình duyệt và bật quyền Cho phép sử dụng Micro (Microphone).';
        } else if (audioErr.code === 'DEVICE_NOT_FOUND' || audioErr.message?.includes('Requested device not found')) {
          msg = 'Không tìm thấy thiết bị thu âm (Micrô) trên máy tính của bạn. Vui lòng cắm Micro và thử lại.';
        } else {
          msg = `Lỗi kết nối micrô: ${audioErr.message || audioErr.code || audioErr}`;
        }
        throw new Error(msg);
      }

      if (type === 'video') {
        try {
          const videoTrack = await agoraSdk.createCameraVideoTrack();
          localVideoTrackRef.current = videoTrack;
          await client.publish([audioTrack, videoTrack]);
        } catch (videoErr: any) {
          console.warn('Failed to create camera track, falling back to audio only:', videoErr);
          let warningMsg = 'Không thể truy cập camera. Đang tự động chuyển sang cuộc gọi thoại.';
          if (videoErr.code === 'PERMISSION_DENIED' || videoErr.message?.includes('Permission denied')) {
            warningMsg = 'Không thể truy cập Camera do thiếu quyền. Đang chuyển sang cuộc gọi thoại.';
          } else if (videoErr.code === 'DEVICE_NOT_FOUND' || videoErr.message?.includes('Requested device not found')) {
            warningMsg = 'Không tìm thấy Webcam/Camera. Đang chuyển sang cuộc gọi thoại.';
          }
          showError(warningMsg);
          
          // Fallback to audio only
          await client.publish([audioTrack]);
          setCurrentCall(prev => prev ? { ...prev, callType: 'voice' } : null);
        }
      } else {
        await client.publish([audioTrack]);
      }

      setCallState('connected');
      startDurationTimer();
    } catch (err: any) {
      console.error('Agora join error:', err);
      showError(err.message || 'Không thể kết nối micrô hoặc camera của bạn.');
      endCall();
    }
  };

  const startDurationTimer = () => {
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    setCallDuration(0);
    durationTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const handleResetCall = () => {
    // Stop ringing
    if (ringtoneCleanRef.current) {
      ringtoneCleanRef.current();
      ringtoneCleanRef.current = null;
    }

    // Stop duration timer
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }

    // Stop Agora tracks
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.stop();
      localAudioTrackRef.current.close();
      localAudioTrackRef.current = null;
    }
    if (localVideoTrackRef.current) {
      localVideoTrackRef.current.stop();
      localVideoTrackRef.current.close();
      localVideoTrackRef.current = null;
    }

    // Leave Agora
    if (agoraClientRef.current) {
      agoraClientRef.current.leave().catch((err: any) => console.error(err));
      agoraClientRef.current = null;
    }

    setCallState('idle');
    setCurrentCall(null);
    setIsMuted(false);
    setIsCameraOn(true);
    setCallDuration(0);
    setRemoteUsers([]);
  };

  // Action methods
  const startCall = (receiverId: string, conversationId: string, receiverInfo: any, type: 'voice' | 'video' = 'voice') => {
    if (!socket) {
      showError('Kết nối máy chủ cuộc gọi chưa sẵn sàng.');
      return;
    }

    setCurrentCall({
      callId: '',
      conversationId,
      callType: type,
      remoteUser: receiverInfo,
      isIncoming: false
    });
    setCallState('calling');

    socket.emit('call_initiate', {
      receiverId,
      conversationId,
      callType: type,
      offer: { type: 'offer', sdp: 'agora' }
    });
  };

  const acceptCall = () => {
    if (!socket || !currentCall) return;
    if (ringtoneCleanRef.current) {
      ringtoneCleanRef.current();
      ringtoneCleanRef.current = null;
    }

    socket.emit('call_accept', {
      callId: currentCall.callId,
      answer: { type: 'answer', sdp: 'agora' }
    });

    setCallState('calling');
    joinAgoraChannel(currentCall.conversationId, currentCall.callType);
  };

  const rejectCall = () => {
    if (!socket || !currentCall) return;
    socket.emit('call_reject', { callId: currentCall.callId });
    handleResetCall();
  };

  const endCall = () => {
    if (!socket || !currentCall) {
      handleResetCall();
      return;
    }

    socket.emit('call_end', {
      callId: currentCall.callId,
      endedBy: socket.id
    });
    handleResetCall();
  };

  const toggleMute = () => {
    if (localAudioTrackRef.current) {
      const nextMute = !isMuted;
      localAudioTrackRef.current.setEnabled(!nextMute);
      setIsMuted(nextMute);
    }
  };

  const toggleCamera = () => {
    if (localVideoTrackRef.current) {
      const nextCam = !isCameraOn;
      localVideoTrackRef.current.setEnabled(nextCam);
      setIsCameraOn(nextCam);
    }
  };

  // Video render helper components/views
  useEffect(() => {
    if (callState === 'connected' && currentCall?.callType === 'video' && localVideoTrackRef.current) {
      const localContainer = document.getElementById('local-video-container');
      if (localContainer) {
        localVideoTrackRef.current.play(localContainer);
      }
    }
  }, [callState, currentCall, isCameraOn]);

  useEffect(() => {
    if (callState === 'connected' && currentCall?.callType === 'video' && remoteUsers.length > 0) {
      remoteUsers.forEach(user => {
        const container = document.getElementById(`remote-video-${user.uid}`);
        if (container && user.videoTrack) {
          user.videoTrack.play(container);
        }
      });
    }
  }, [callState, currentCall, remoteUsers]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <CallContext.Provider
      value={{
        socket,
        callState,
        currentCall,
        isMuted,
        isCameraOn,
        callDuration,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleCamera,
        connectSocket,
        disconnectSocket
      }}
    >
      {children}

      {/* Global Call UI Overlay */}
      {callState !== 'idle' && currentCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md transition-all duration-300 font-sans text-white">
          
          {/* Ringing / Calling view */}
          {(callState === 'ringing' || callState === 'calling') && (
            <div className="flex flex-col items-center max-w-sm w-full px-6 text-center animate-fade-in">
              <div className="relative mb-8">
                {/* Pulsing visual circles */}
                <div className="absolute inset-0 rounded-full bg-blue/20 animate-ping duration-1000 scale-150" />
                <div className="absolute inset-0 rounded-full bg-blue/15 animate-pulse duration-700 scale-125" />
                
                <div className="relative w-28 h-28 rounded-full border border-white/20 bg-white/5 overflow-hidden flex items-center justify-center shadow-2xl">
                  {currentCall.remoteUser?.avatar ? (
                    <img 
                      src={currentCall.remoteUser.avatar} 
                      alt={currentCall.remoteUser.username} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <User className="w-14 h-14 text-white/50" />
                  )}
                </div>
              </div>

              <h2 className="text-2xl font-bold tracking-wide drop-shadow-md">
                {currentCall.remoteUser?.username || 'Người dùng'}
              </h2>

              <p className="mt-2 text-sm font-semibold tracking-wider uppercase text-blue animate-pulse">
                {callState === 'ringing' 
                  ? (currentCall.callType === 'video' ? 'Cuộc gọi video đến...' : 'Cuộc gọi thoại đến...') 
                  : 'Đang kết nối...'}
              </p>

              {/* Action Buttons for Incoming / Outgoing Ringing */}
              <div className="mt-12 flex items-center gap-10">
                {currentCall.isIncoming && callState === 'ringing' ? (
                  <>
                    <button
                      onClick={rejectCall}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-red hover:bg-red-hover shadow-lg shadow-red/35 transition-transform hover:scale-105 active:scale-95 cursor-pointer border-0"
                    >
                      <PhoneOff className="h-6.5 w-6.5 text-white" />
                    </button>
                    <button
                      onClick={acceptCall}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-green hover:bg-green-hover shadow-lg shadow-green/35 transition-transform hover:scale-105 active:scale-95 cursor-pointer border-0 animate-bounce"
                    >
                      {currentCall.callType === 'video' ? (
                        <Video className="h-6.5 w-6.5 text-white" />
                      ) : (
                        <Phone className="h-6.5 w-6.5 text-white" />
                      )}
                    </button>
                  </>
                ) : (
                  // Outgoing cancellation button
                  <button
                    onClick={endCall}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-red hover:bg-red-hover shadow-lg shadow-red/35 transition-transform hover:scale-105 active:scale-95 cursor-pointer border-0"
                  >
                    <PhoneOff className="h-6.5 w-6.5 text-white" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Connected View */}
          {callState === 'connected' && (
            <div className="relative h-full w-full flex flex-col justify-between p-6">
              
              {/* Top Details bar */}
              <div className="flex items-center justify-between bg-black/35 backdrop-blur-md border border-white/5 px-5 py-3 rounded-2xl max-w-md mx-auto w-full mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 flex items-center justify-center bg-white/10">
                    {currentCall.remoteUser?.avatar ? (
                      <img src={currentCall.remoteUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-white/50" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{currentCall.remoteUser?.username}</h4>
                    <p className="text-[10px] text-white/60">Đang trò chuyện</p>
                  </div>
                </div>
                
                <span className="text-sm font-mono tracking-widest bg-white/15 px-3 py-1 rounded-full border border-white/5 font-semibold">
                  {formatTime(callDuration)}
                </span>
              </div>

              {/* Center Content: Voice Avatar or Video render frames */}
              <div className="flex-1 flex items-center justify-center w-full max-w-4xl mx-auto my-6 relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                
                {/* Voice Call Layout */}
                {currentCall.callType === 'voice' && (
                  <div className="flex flex-col items-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 rounded-full bg-blue/10 animate-ping scale-125 duration-1000" />
                      <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-blue/45 flex items-center justify-center bg-white/5 shadow-2xl">
                        {currentCall.remoteUser?.avatar ? (
                          <img src={currentCall.remoteUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-16 h-16 text-white/40" />
                        )}
                      </div>
                    </div>
                    <p className="text-white/60 text-sm tracking-wide font-medium">Cuộc gọi thoại qua mạng</p>
                  </div>
                )}

                {/* Video Call Layout */}
                {currentCall.callType === 'video' && (
                  <div className="relative h-full w-full bg-slate-950 flex items-center justify-center">
                    
                    {/* Remote User Stream Frame (Takes Full Width/Height) */}
                    {remoteUsers.length > 0 ? (
                      <div 
                        id={`remote-video-${remoteUsers[0].uid}`} 
                        className="w-full h-full object-cover absolute inset-0"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-white/55">
                        <ShieldAlert className="w-12 h-12 animate-pulse text-blue" />
                        <span className="text-sm font-semibold">Đang chờ hình ảnh đối phương...</span>
                      </div>
                    )}

                    {/* Local Camera Mini PIP Frame */}
                    {isCameraOn && (
                      <div className="absolute top-4 right-4 w-32 h-44 md:w-40 md:h-56 rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-slate-900 z-10">
                        <div id="local-video-container" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Control Bar */}
              <div className="bg-black/35 backdrop-blur-md border border-white/5 p-4 rounded-3xl max-w-md mx-auto w-full flex items-center justify-around mb-4">
                
                {/* Mic Mute Toggle */}
                <button
                  onClick={toggleMute}
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition duration-150 border-0 cursor-pointer ${
                    isMuted 
                      ? 'bg-red text-white hover:bg-red-hover' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title={isMuted ? 'Bật mic' : 'Tắt mic'}
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>

                {/* Camera Toggle (Video Call Only) */}
                {currentCall.callType === 'video' && (
                  <button
                    onClick={toggleCamera}
                    className={`flex h-12 w-12 items-center justify-center rounded-full transition duration-150 border-0 cursor-pointer ${
                      !isCameraOn 
                        ? 'bg-red text-white hover:bg-red-hover' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                    title={isCameraOn ? 'Tắt camera' : 'Bật camera'}
                  >
                    {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </button>
                )}

                {/* Speaker Toggle Icon (Web plays on output natively, this toggles UI representation of voice levels) */}
                {currentCall.callType === 'voice' && (
                  <button
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition duration-150 border-0 cursor-pointer"
                    title="Âm thanh"
                  >
                    <Volume2 className="h-5 w-5" />
                  </button>
                )}

                {/* End Call Button */}
                <button
                  onClick={endCall}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-red hover:bg-red-hover shadow-lg shadow-red/35 transition-transform hover:scale-105 active:scale-95 border-0 cursor-pointer"
                  title="Gác máy"
                >
                  <PhoneOff className="h-5 w-5 text-white" />
                </button>
              </div>

            </div>
          )}

        </div>
      )}
    </CallContext.Provider>
  );
};
