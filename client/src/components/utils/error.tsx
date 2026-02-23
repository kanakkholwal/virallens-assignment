
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";


type Props = {
    error?: Error
    title?: string;
    description?: string;

};

export default function ErrorBanner({ error, title, description }: Props) {
    if (error) {
        console.error(error);
    }

    return (
        <div className="flex h-full min-h-[50vh] w-full flex-col items-center justify-center p-6">
            <div className="max-w-md w-full space-y-6 text-center">

                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                    <AlertCircle className="size-6" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-lg font-semibold tracking-tight text-foreground">
                        {title || "Application Error"}
                    </h1>
                    <p className="text-sm text-muted-foreground leading-relaxed text-balance">
                        {description || "We encountered an issue processing your request."}
                    </p>
                </div>


                <div className="flex items-center justify-center gap-3 pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                        className="h-9 px-4 text-xs"
                    >
                        <RefreshCcw className="mr-2 size-3.5" />
                        Reload
                    </Button>


                </div>
            </div>
        </div>
    );
}



