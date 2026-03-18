import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface JitsiMeetConsultationProps {
  roomName: string;
  doctorName: string;
  patientName: string;
  onMeetingEnd?: () => void;
  onMeetingStart?: () => void;
}

const JitsiMeetConsultation: React.FC<JitsiMeetConsultationProps> = ({
  roomName,
  doctorName,
  patientName,
  onMeetingEnd,
  onMeetingStart
}) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Jitsi Meet External API script
    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve(window.JitsiMeetExternalAPI);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => {
          console.log('✅ Jitsi Meet script loaded successfully');
          resolve(window.JitsiMeetExternalAPI);
        };
        script.onerror = () => {
          console.error('❌ Failed to load Jitsi Meet script');
          reject(new Error('Failed to load Jitsi Meet API'));
        };
        document.head.appendChild(script);
      });
    };

    const initializeJitsi = async () => {
      try {
        console.log('🚀 Initializing Jitsi Meet...');
        await loadJitsiScript();
        
        if (jitsiContainerRef.current) {
          // Clear any existing content
          jitsiContainerRef.current.innerHTML = '';
          
          const domain = 'meet.jit.si';
          const options = {
            roomName: roomName,
            width: '100%',
            height: 600,
            parentNode: jitsiContainerRef.current,
            userInfo: {
              displayName: patientName,
              email: `${patientName.toLowerCase().replace(' ', '.')}@patient.com`
            },
            configOverwrite: {
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              enableWelcomePage: false,
              prejoinPageEnabled: false,
              disableModeratorIndicator: false,
              startScreenSharing: false,
              enableEmailInStats: false,
              requireDisplayName: false,
              enableUserRolesBasedOnToken: false,
              enableInsecureRoomNameWarning: false,
              doNotStoreRoom: true
            },
            interfaceConfigOverwrite: {
              TOOLBAR_BUTTONS: [
                'microphone', 'camera', 'closedcaptions', 'desktop',
                'fullscreen', 'fodeviceselection', 'hangup', 'profile',
                'chat', 'recording', 'livestreaming', 'etherpad',
                'sharedvideo', 'settings', 'raisehand', 'videoquality',
                'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                'tileview', 'videobackgroundblur', 'download', 'help'
              ],
              SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false,
              SHOW_BRAND_WATERMARK: false,
              BRAND_WATERMARK_LINK: '',
              SHOW_POWERED_BY: false,
              SHOW_PROMOTIONAL_CLOSE_PAGE: false,
              SHOW_CHROME_EXTENSION_BANNER: false,
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
              DISABLE_PRESENCE_STATUS: false,
              DISABLE_FOCUS_INDICATOR: false,
              DISABLE_DOMINANT_SPEAKER_INDICATOR: false
            }
          };

          console.log('🎥 Creating Jitsi Meet instance with options:', options);
          const jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
          setApi(jitsiApi);

          // Event listeners with better error handling
          jitsiApi.addEventListener('videoConferenceJoined', (event) => {
            console.log('✅ Video conference joined:', event);
            setIsLoading(false);
            onMeetingStart?.();
          });

          jitsiApi.addEventListener('videoConferenceLeft', (event) => {
            console.log('📞 Video conference left:', event);
            onMeetingEnd?.();
          });

          jitsiApi.addEventListener('readyToClose', () => {
            console.log('🚪 Ready to close');
            jitsiApi.dispose();
            onMeetingEnd?.();
          });

          jitsiApi.addEventListener('participantJoined', (event) => {
            console.log('👤 Participant joined:', event);
          });

          jitsiApi.addEventListener('videoConferenceError', (event) => {
            console.error('❌ Video conference error:', event);
            setError('Video conference error occurred');
            setIsLoading(false);
          });

          // Add doctor info to chat after a delay
          setTimeout(() => {
            try {
              jitsiApi.executeCommand('sendChatMessage', 
                `👨‍⚕️ Dr. ${doctorName} has joined the consultation. Please feel free to discuss your health concerns.`
              );
            } catch (chatError) {
              console.warn('⚠️ Could not send chat message:', chatError);
            }
          }, 5000);

          // Set a timeout to detect if Jitsi fails to load
          setTimeout(() => {
            if (isLoading) {
              console.warn('⚠️ Jitsi Meet taking longer than expected to load');
              setError('Video consultation is taking longer than expected. Please check your internet connection and camera permissions.');
              setIsLoading(false);
            }
          }, 15000);
        }
      } catch (err) {
        console.error('💥 Jitsi initialization error:', err);
        setError('Failed to initialize video consultation. Please try refreshing the page.');
        setIsLoading(false);
      }
    };

    initializeJitsi();

    // Cleanup
    return () => {
      if (api) {
        try {
          api.dispose();
        } catch (disposeError) {
          console.warn('⚠️ Error disposing Jitsi API:', disposeError);
        }
      }
    };
  }, [roomName, doctorName, patientName, onMeetingEnd, onMeetingStart]);

  const endMeeting = () => {
    if (api) {
      api.executeCommand('hangup');
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-red-50 rounded-lg">
        <div className="text-red-600 text-xl mb-4">❌ Video Consultation Error</div>
        <p className="text-red-500 mb-4">{error}</p>
        <div className="flex space-x-4">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
          <button 
            onClick={() => {
              const meetingUrl = `https://meet.jit.si/${roomName}`;
              window.open(meetingUrl, '_blank');
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Open in New Tab
          </button>
        </div>
        <p className="text-gray-600 text-sm mt-4">
          Alternative: Call Dr. {doctorName} directly or try opening the meeting in a new tab
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-blue-50 p-4 rounded-t-lg border-b">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-blue-900">
              🩺 Video Consultation with Dr. {doctorName}
            </h3>
            <p className="text-blue-700 text-sm">
              Patient: {patientName} | Room: {roomName}
            </p>
          </div>
          {!isLoading && (
            <button
              onClick={endMeeting}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              End Consultation
            </button>
          )}
        </div>
      </div>
      
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-96 bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Connecting to video consultation...</p>
          <p className="text-gray-500 text-sm mt-2">Please allow camera and microphone access</p>
        </div>
      )}
      
      <div 
        ref={jitsiContainerRef} 
        className={`w-full ${isLoading ? 'hidden' : 'block'}`}
        style={{ minHeight: '600px' }}
      />
      
      <div className="bg-gray-50 p-4 rounded-b-lg border-t">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>🔒 End-to-end encrypted</span>
            <span>🌐 Powered by Jitsi Meet</span>
          </div>
          <div>
            <span>💡 Tip: Use headphones for better audio quality</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JitsiMeetConsultation;