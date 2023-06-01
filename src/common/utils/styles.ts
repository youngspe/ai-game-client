import { DimensionValue, FlexAlignType } from "react-native";

export interface MarginStyle {
    margin?: DimensionValue | undefined;
    marginBlock?: DimensionValue | undefined;
    marginBlockEnd?: DimensionValue | undefined;
    marginBlockStart?: DimensionValue | undefined;
    marginBottom?: DimensionValue | undefined;
    marginEnd?: DimensionValue | undefined;
    marginHorizontal?: DimensionValue | undefined;
    marginInline?: DimensionValue | undefined;
    marginInlineEnd?: DimensionValue | undefined;
    marginInlineStart?: DimensionValue | undefined;
    marginLeft?: DimensionValue | undefined;
    marginRight?: DimensionValue | undefined;
    marginStart?: DimensionValue | undefined;
    marginTop?: DimensionValue | undefined;
    marginVertical?: DimensionValue | undefined;
}


export interface FlexItemStyle {
    alignSelf?: 'auto' | FlexAlignType | undefined;
    flexGrow?: number | undefined;
    flexShrink?: number | undefined;
}
