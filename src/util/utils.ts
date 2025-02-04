import { parse } from "path";
import { Alert, confirmAlert, Icon } from "@raycast/api";
import ActionStyle = Alert.ActionStyle;
import { GistItem } from "./gist-utils";
import { encodeURI } from "js-base64";

export const isEmpty = (string: string | null | undefined) => {
  return !(string != null && String(string).length > 0);
};

export const raySo = (title: string, content: string) =>
  `https://ray.so/#colors=cnady&background=true&darkMode=false&padding=32&title=${title}&code=${encodeURI(content)}&language=auto`;

export const imgExt = [".svg", ".gif", ".jpg", ".jpeg", ".png"];

export function formatBytes(bytes: number | undefined, decimals = 2) {
  if (!bytes || bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export const formatGistContentDetail = (gistFile: GistItem, gistFileContent: string) => {
  const gistFileExt = parse(gistFile.filename).ext;

  if (gistFileExt == ".md") {
    return gistFileContent;
  }

  if (imgExt.includes(gistFileExt)) {
    return `![](${gistFile.raw_url})`;
  }

  return "```" + gistFile.language + "\n" + gistFileContent + "\n```";
};

export const alertDialog = async (
  icon: Icon,
  title: string,
  message: string,
  confirmTitle: string,
  confirmAction: () => void,
  cancelAction?: () => void,
) => {
  const options: Alert.Options = {
    icon: icon,
    title: title,
    message: message,
    primaryAction: {
      style: ActionStyle.Destructive,
      title: confirmTitle,
      onAction: confirmAction,
    },
    dismissAction: {
      title: "Cancel",
      onAction: () => cancelAction,
    },
  };
  await confirmAlert(options);
};

function getThemeByTime(): "dark" | "light" {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  // Convert current time to minutes since midnight
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  // Convert boundary times to minutes
  const darkStartTime = 17 * 60 + 30; // 17:30 = 1050 minutes
  const darkEndTime = 6 * 60; // 06:00 = 360 minutes

  // Check if current time is within dark theme hours
  if (currentTimeInMinutes >= darkStartTime || currentTimeInMinutes < darkEndTime) {
    return "dark";
  } else {
    return "light";
  }
}

export const getIconType = (gistFile: GistItem) => {
  const parent = "icons";
  const fileExt = gistFile?.language.toLowerCase();
  const theme = getThemeByTime();

  return {
    source: `${parent}/${fileExt}${theme === "dark" ? "_dark" : ""}.svg`,
    fallback: `${parent}/anyType.svg`,
  };
};
