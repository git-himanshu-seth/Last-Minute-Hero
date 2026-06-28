import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RealtimeCall: React.FC<{ roomId: string, onLeave: () => void }> = ({ roomId, onLeave }) => {
  const { user } = useApp();
  const [peerId, setPeerId] = useState<string>('');
  const [remotePeerIdValue, setRemotePeerIdValue] = useState<string>('');
  const peerInstance = useRef<Peer | null>(null);
  
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [micMuted, setMicMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);

  useEffect(() => {
    const peer = new Peer();

    peer.on('open', (id) => {
      setPeerId(id);
    });

    peer.on('call', (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setMyStream(stream);
          if (myVideoRef.current) {
            myVideoRef.current.srcObject = stream;
          }
          call.answer(stream);
          call.on('stream', (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });
        })
        .catch(err => console.error('Failed to get local stream', err));
    });

    peerInstance.current = peer;

    return () => {
      if (myStream) {
        myStream.getTracks().forEach(track => track.stop());
      }
      peer.destroy();
    };
  }, []);

  const call = (remotePeerId: string) => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setMyStream(stream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }

        const call = peerInstance.current?.call(remotePeerId, stream);
        
        call?.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });
      })
      .catch(err => console.error('Failed to get local stream', err));
  };

  const toggleMic = () => {
    if (myStream) {
      myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setMicMuted(!micMuted);
    }
  };

  const toggleVideo = () => {
    if (myStream) {
      myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setVideoMuted(!videoMuted);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] relative rounded-xl overflow-hidden border border-white/10">
      <div className="absolute top-4 left-4 z-10 bg-black/50 px-3 py-1.5 rounded-lg text-xs font-mono text-white backdrop-blur-md">
        My Call ID: {peerId || 'Connecting...'}
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 p-4">
        <div className="relative rounded-2xl overflow-hidden bg-[#121318] border border-white/5 flex items-center justify-center">
          <video ref={myVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/50 text-white text-xs backdrop-blur-md flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {user?.name || 'Me'} (Local)
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-[#121318] border border-white/5 flex items-center justify-center">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          {!remoteVideoRef.current?.srcObject && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 text-sm space-y-4 px-8 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                <VideoOff className="w-6 h-6 opacity-50" />
              </div>
              <p>Waiting for someone to join...</p>
              <div className="flex items-center gap-2 w-full">
                <input 
                  type="text" 
                  placeholder="Enter Remote Call ID to Connect" 
                  className="flex-1 bg-black text-white text-xs px-3 py-2 rounded-lg border border-white/10"
                  value={remotePeerIdValue}
                  onChange={e => setRemotePeerIdValue(e.target.value)}
                />
                <button 
                  onClick={() => call(remotePeerIdValue)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold text-white transition"
                >
                  Call
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-20 border-t border-white/10 bg-[#070709] flex items-center justify-center gap-4">
        <button 
          onClick={toggleMic}
          className={`p-4 rounded-full transition ${micMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/5 text-white hover:bg-white/10'}`}
        >
          {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <button 
          onClick={toggleVideo}
          className={`p-4 rounded-full transition ${videoMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/5 text-white hover:bg-white/10'}`}
        >
          {videoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>
        <button 
          onClick={onLeave}
          className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition shadow-lg shadow-red-500/20"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
