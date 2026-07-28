import { Mic, MicOff, Phone, PhoneOff, ScreenShare, Video as VideoIcon, VideoOff } from "lucide-react";
import { useEffect, useRef } from "react";
const Video = ({ stream, muted }) => { const ref = useRef(); useEffect(() => { if (ref.current) ref.current.srcObject = stream; }, [stream]); return <video ref={ref} autoPlay playsInline muted={muted} className="h-full w-full object-cover" />; };
export default function CallOverlay({ controller }) {
  const { call, localMedia, remoteMedia, seconds, accept, reject, end, toggle, shareScreen } = controller;
  if (!call) return null;
  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const status = call.state === "incoming" ? "Incoming call" : call.state === "ringing" ? "Calling…" : time;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4">
    <div className="relative h-[min(78vh,650px)] w-full max-w-4xl overflow-hidden rounded-2xl bg-neutral text-neutral-content shadow-2xl">
      <Video stream={remoteMedia} />
      {!remoteMedia && <div className="absolute inset-0 grid place-items-center text-center text-neutral-content/70"><div><VideoIcon className="mx-auto mb-3 size-10" /><p>{call.state === "ringing" ? "Waiting for them to answer" : "Connecting media…"}</p></div></div>}
      <div className="absolute inset-x-0 top-0 flex justify-between bg-gradient-to-b from-black/70 p-5"><span className="font-medium">{status}{call.isPeerMuted ? " · Participant muted" : ""}</span><span className="capitalize">{call.type} call</span></div>
      {localMedia && <div className="absolute bottom-28 right-5 h-32 w-44 overflow-hidden rounded-lg border border-white/30 bg-black"><Video stream={localMedia} muted /></div>}
      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-3 bg-gradient-to-t from-black/80 p-5">
        {call.state === "incoming" ? <><button className="btn btn-success" onClick={accept} aria-label="Accept call"><Phone /> Accept</button><button className="btn btn-error" onClick={reject} aria-label="Decline call"><PhoneOff /> Decline</button></> : <><button className={`btn btn-circle ${call.isMuted ? "btn-error" : ""}`} onClick={() => toggle("audio")} title={call.isMuted ? "Unmute microphone" : "Mute microphone"} aria-label={call.isMuted ? "Unmute microphone" : "Mute microphone"}>{call.isMuted ? <MicOff /> : <Mic />}</button>{call.type === "video" && <><button className="btn btn-circle" onClick={() => toggle("video")} title="Turn camera on or off" aria-label="Turn camera on or off"><VideoOff /></button><button className="btn btn-circle" onClick={shareScreen} title="Share screen" aria-label="Share screen"><ScreenShare /></button></>}<button className="btn btn-error" onClick={end} aria-label="End call"><PhoneOff /> {call.state === "ringing" ? "Cancel" : "End call"}</button></>}
      </div>
    </div>
  </div>;
}
