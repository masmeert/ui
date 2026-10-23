"use client";

import {
  DirectionProvider as DirectionProviderPrimitive,
  useDirection,
} from "@base-ui/react/direction-provider";

function DirectionProvider({
  dir,
  direction,
  ...props
}: DirectionProviderPrimitive.Props & {
  dir?: DirectionProviderPrimitive.Props["direction"];
}) {
  return <DirectionProviderPrimitive direction={direction ?? dir} {...props} />;
}

export { DirectionProvider, useDirection };
