import { CodeIcon } from "lucide-react"
import { PixelCanvas } from "@/components/ui/pixel-canvas"

function PixelCanvasDemo() {
  return (
    <div className="mx-auto w-[300px]">
      <button
        className="group relative aspect-square w-full overflow-hidden rounded-[32px] border border-border transition-colors duration-200 hover:border-[#0ea5e9] focus:outline-[5px] focus:outline-[Highlight]"
        style={{ "--active-color": "#0ea5e9" } as React.CSSProperties}
      >
        <PixelCanvas gap={10} speed={25} colors={["#e0f2fe", "#7dd3fc", "#0ea5e9"]} variant="icon" />
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          <CodeIcon className="h-20 w-20 text-muted-foreground transition-all duration-300 ease-out group-hover:scale-110 group-hover:text-[var(--active-color)]" />
        </div>
      </button>
    </div>
  )
}

export { PixelCanvasDemo }
