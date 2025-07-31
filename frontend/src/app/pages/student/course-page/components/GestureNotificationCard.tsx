import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const GestureNotificationCard = () => {
  return (
   <Card className="border border-amber-400/20 bg-amber-600/90 text-amber-50 shadow-lg backdrop-blur-md animate-in slide-in-from-right-3 duration-300">

    <CardContent className="flex items-center gap-3 px-4 py-0">
        <div className="flex h-22 w-22 items-center justify-center rounded-lg bg-whitetext-4xl p-4">
        <img src="https://em-content.zobj.net/source/microsoft/309/thumbs-up_1f44d.png"className="w-auto h-full" />
        </div>
        <div className="flex-1 space-y-1 py-3">
        <Badge variant="outline" className="border-amber-50/30 bg-amber-50/10 text-amber-50text-xl font-bold">
            Gesture Required
        </Badge>
        <p className="text-lg font-medium leading-relaxed m-1">
            Show a <strong>thumbs up</strong>!
        </p>
        </div>
    </CardContent>

    </Card>
  )
}

export default GestureNotificationCard
