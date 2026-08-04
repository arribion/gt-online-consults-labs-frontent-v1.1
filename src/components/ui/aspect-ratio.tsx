import { type ComponentPropsWithoutRef, forwardRef } from "react"

type AspectRatioProps = ComponentPropsWithoutRef<"div"> & {
  ratio?: number
}

const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = 1, style, children, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
        paddingTop: `${100 / ratio}%`,
        ...style,
      }}
      {...props}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>
    </div>
  )
)

AspectRatio.displayName = "AspectRatio"

export { AspectRatio }
