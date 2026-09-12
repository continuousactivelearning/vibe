import { Face, Keypoint } from "@tensorflow-models/face-detection";

// Loosened from the original tuning (8 frames / 11s / 15s / 5s) — real
// browser-side face tracking drops a frame here and there even when the
// subject is behaving exactly as expected, and the original thresholds made
// that indistinguishable from "not violating at all". These values trade
// some false-positive risk for actually being triggerable in practice.
export const CONSECUTIVE_FRAMES_REQUIRED = 4;
export const STILLNESS_WINDOW_MS = 6000;
export const LOOKING_AWAY_DURATION_MS = 3000;
export const STILLNESS_MOVEMENT_THRESHOLD = 26;

export interface TimedSample<T> {
    value: T;
    timestamp: number;
}

export function getKeypoint(face: Face, name: string): Keypoint | undefined {
    return face.keypoints.find((p) => p.name === name);
}

export function computeTotalMovement(
    positions: { x: number; y: number }[],
  ): number {
    let total = 0;
    for (let i = 1; i < positions.length; i++) {
          total += Math.hypot(
                  positions[i].x - positions[i - 1].x,
                  positions[i].y - positions[i - 1].y,
                );
    }
    return total;
}

export function trimSamples<T>(
    samples: TimedSample<T>[],
    windowMs: number,
    now: number,
  ): TimedSample<T>[] {
    return samples.filter((s) => now - s.timestamp <= windowMs);
}

export function isStillInWindow(
    noseSamples: TimedSample<{ x: number; y: number }>[],
    windowMs: number = STILLNESS_WINDOW_MS,
    movementThreshold: number = STILLNESS_MOVEMENT_THRESHOLD,
  ): boolean {
    if (noseSamples.length < CONSECUTIVE_FRAMES_REQUIRED) return false;
    const span =
          noseSamples[noseSamples.length - 1].timestamp - noseSamples[0].timestamp;
    if (span < windowMs) return false;
    const positions = noseSamples.map((s) => s.value);
    return computeTotalMovement(positions) < movementThreshold;
}

export function isLookingAwaySustained(
    lookingAwaySince: number | null,
    now: number,
    durationMs: number = LOOKING_AWAY_DURATION_MS,
  ): boolean {
    if (lookingAwaySince === null) return false;
    return now - lookingAwaySince >= durationMs;
}
