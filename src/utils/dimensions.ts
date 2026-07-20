import { Dimensions, StatusBar } from "react-native";

export const windowWidth = Dimensions.get("screen").width;
export const windowHeight = Dimensions.get("screen").height;
export const status_bar_height = StatusBar.currentHeight;
const imageDimension = windowWidth * 0.15;
export const imageSize = imageDimension < 40 ? 40 : imageDimension;
