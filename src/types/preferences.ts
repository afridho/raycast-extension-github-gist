import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  "access-token": string;
  perPage: string;
  "remember-tag": boolean;
  defaultGistTag: string;
  primaryAction: string;
}
export const {
  "access-token": personalAccessTokens,
  perPage,
  "remember-tag": rememberTag,
  defaultGistTag: defaultGistTag,
  primaryAction,
} = getPreferenceValues<Preferences>();
