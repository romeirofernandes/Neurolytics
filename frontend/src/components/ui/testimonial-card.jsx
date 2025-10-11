import { cn } from "@/lib/utils"
import { Avatar, AvatarImage } from "@/components/ui/avatar"

export function TestimonialCard({
  author,
  text,
  href,
  className
}) {
  const Card = href ? 'a' : 'div'
  
  return (
    <Card
      {...(href ? { href } : {})}
      className={cn(
        "flex flex-col rounded-lg border-t",
        "bg-gradient-to-b from-muted/50 to-muted/10",
        "p-3.5 text-start sm:p-5", // reduced padding by ~5%
        "hover:from-muted/60 hover:to-muted/20",
        "max-w-[320px] sm:max-w-[320px]",
        "transition-colors duration-300",
        href ? "no-underline" : "",
        className
      )}>
      <div className="flex items-center gap-2.5"> {/* reduced gap */}
        <Avatar className="h-11 w-11"> {/* reduced avatar size */}
          <AvatarImage src={author.avatar} alt={author.name} />
        </Avatar>
        <div className="flex flex-col items-start">
          <h3 className="text-md font-semibold leading-none">
            {author.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {author.handle}
          </p>
        </div>
      </div>
      <p className="sm:text-md mt-3.5 text-sm text-muted-foreground"> {/* reduced margin */}
        {text}
      </p>
    </Card>
  );
}