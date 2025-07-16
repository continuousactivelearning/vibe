import Video from '@/components/video';

export default function VideoTest() {
  return (
    <div style={{ width: 800, margin: '0 auto', marginTop: 40 }}>
      <Video
        URL="https://youtu.be/On2y-OLboB8?si=feiU5Xmg1kCEWe7O"
        startTime="0"
        endTime=""
        points=""
        anomalies={[]}
        rewindVid={false}
        pauseVid={false}
        doGesture={false}
        onNext={() => {}}
        isProgressUpdating={false}
        onDurationChange={() => {}}
      />
    </div>
  );
}
