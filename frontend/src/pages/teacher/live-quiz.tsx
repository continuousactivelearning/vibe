import { AudioManager } from "@/ai-components/WhisperManager";
import { useTranscriber } from "@/hooks/useTranscriber";

export default function LiveQuiz() {
    const transcriber = useTranscriber();

    return (
        <div className='flex justify-center items-center min-h-screen'>
            <div className='container flex flex-col justify-center items-center'>
                <AudioManager transcriber={transcriber} />
                <p>
                    {transcriber.output?.text}
                </p>
            </div>
        </div>
    );
}