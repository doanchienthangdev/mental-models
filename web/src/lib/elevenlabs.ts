import { env } from "./env";

export type AudioSource = "summary" | "body";

export type AudioJobPayload = {
  text: string;
  voiceId?: string;
  modelId?: string;
  source: AudioSource;
};

// Placeholder for server-side ElevenLabs integration
export async function generateAudioJob(payload: AudioJobPayload) {
  if (!env.elevenLabsApiKey) {
    throw new Error("ELEVENLABS_API_KEY is missing");
  }
  // TODO: call ElevenLabs TTS endpoint, store metadata to Supabase.
  return { jobId: `stub-${payload.source}-${payload.text.length}`, status: "pending" };
}
