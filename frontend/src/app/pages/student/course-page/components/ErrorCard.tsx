import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Link, Target } from 'lucide-react'

const ErrorCard = () => {
  return (
    <Card className="mx-auto max-w-md">
        <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center">
            <div className="text-destructive mb-2">
                <Target className="h-8 w-8 mx-auto"></Target>
            </div>
            <p className="text-destructive font-medium">Error loading course data</p>
            <p className="text-muted-foreground text-sm mt-1">Please try again later</p>
            <Button asChild className="mt-4">
                <Link to="/student">Go to Dashboard</Link>
            </Button>
            </div>
        </CardContent>
    </Card>
  )
}

export default ErrorCard
