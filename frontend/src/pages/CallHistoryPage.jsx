import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Clock3, Phone, Video } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";

const formatDuration = (seconds = 0) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export default function CallHistoryPage() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authUser } = useAuthStore();

  useEffect(() => {
    axiosInstance.get("/calls").then(({ data }) => setCalls(data)).catch(() => setCalls([])).finally(() => setLoading(false));
  }, []);

  return <main className="min-h-screen bg-base-200 px-4 pt-24 pb-8"><section className="mx-auto max-w-[1500px] rounded-2xl border border-base-300 bg-base-100 p-5 shadow-xl sm:p-8"><div className="mb-6 flex items-center gap-3"><div className="rounded-xl bg-primary/10 p-3 text-primary"><Clock3 /></div><div><h1 className="text-2xl font-bold">Call history</h1><p className="text-sm text-base-content/60">Your latest voice and video calls</p></div></div>{loading ? <div className="grid place-items-center py-16"><span className="loading loading-spinner loading-lg text-primary" /></div> : calls.length === 0 ? <p className="py-16 text-center text-base-content/60">No calls yet. Start a voice or video call from a chat.</p> : <div className="space-y-2">{calls.map((call) => { const outgoing = String(call.caller?._id || call.caller) === String(authUser?._id); const person = outgoing ? call.recipient : call.caller; const successful = call.status === "ended" || call.status === "accepted"; return <article key={call._id} className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-base-200"><img src={person?.profile_Pic || person?.profilePic || "/avatar.png"} alt="" className="size-11 rounded-full object-cover" /><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="font-semibold truncate">{person?.username || "Unknown user"}</span>{outgoing ? <ArrowUpRight className="size-4 text-success" /> : <ArrowDownLeft className={`size-4 ${successful ? "text-info" : "text-error"}`} />}</div><p className="text-sm text-base-content/60">{new Date(call.createdAt).toLocaleString()} · {call.status}</p></div><div className="text-right text-sm text-base-content/70"><div className="flex justify-end">{call.type === "video" ? <Video className="size-4" /> : <Phone className="size-4" />}</div>{call.duration > 0 && <span>{formatDuration(call.duration)}</span>}</div></article>; })}</div>}</section></main>;
}
