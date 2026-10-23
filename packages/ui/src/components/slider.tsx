import { BubbleSlider, type BubbleSliderProps } from "@/components/slider/bubble";
import { RangeSlider, type RangeSliderProps } from "@/components/slider/default";
import { FluidSlider, type FluidSliderProps } from "@/components/slider/fluid";
import { InlineSlider, type InlineSliderProps } from "@/components/slider/inline";
import { RulerSlider, type RulerSliderProps } from "@/components/slider/ruler";
import { WaveSlider, type WaveSliderProps } from "@/components/slider/wave";

export type SliderProps =
  | ({ variant?: "default" } & RangeSliderProps)
  | ({ variant: "bubble" } & BubbleSliderProps)
  | ({ variant: "fluid" } & FluidSliderProps)
  | ({ variant: "inline" } & InlineSliderProps)
  | ({ variant: "ruler" } & RulerSliderProps)
  | ({ variant: "wave" } & WaveSliderProps);

export function Slider(props: SliderProps) {
  switch (props.variant) {
    case "bubble": {
      const { variant: _variant, ...rest } = props;
      return <BubbleSlider {...rest} />;
    }
    case "fluid": {
      const { variant: _variant, ...rest } = props;
      return <FluidSlider {...rest} />;
    }
    case "inline": {
      const { variant: _variant, ...rest } = props;
      return <InlineSlider {...rest} />;
    }
    case "ruler": {
      const { variant: _variant, ...rest } = props;
      return <RulerSlider {...rest} />;
    }
    case "wave": {
      const { variant: _variant, ...rest } = props;
      return <WaveSlider {...rest} />;
    }
    default: {
      const { variant: _variant, ...rest } = props;
      return <RangeSlider {...rest} />;
    }
  }
}
