import awsIconsJson from "./awsIcons.json";
import { decodeSvg, svgToDataUrl } from "../utils/svgUtils";

// Process the raw JSON data
const processedAwsIcons = Object.entries(awsIconsJson).reduce(
  (acc, [key, value]) => {
    try {
      const cleanedSvg = decodeSvg(value);
      acc[key] = svgToDataUrl(cleanedSvg);
    } catch (error) {
      console.error(`Error processing icon ${key}:`, error);
      acc[key] = ""; // Set empty string if processing fails
    }
    return acc;
  },
  {}
);

export default processedAwsIcons;
