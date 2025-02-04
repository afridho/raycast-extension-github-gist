import { ActionPanel, Application, Icon, List } from "@raycast/api";
import { useMemo, useState } from "react";
import { formatGistContentDetail, getIconType } from "./util/utils";
import { GistAction } from "./components/gist-action";
import { ActionSettings } from "./components/action-settings";
import { perPage, rememberTag, defaultGistTag } from "./types/preferences";
import { useFrontmostApp } from "./hooks/useFrontmostApp";
import { withGitHubClient } from "./components/with-github-client";
import { useCachedPromise, useCachedState } from "@raycast/utils";
import { getGitHubClient } from "./api/oauth";
import { GithubGistTag, githubGistTags } from "./util/gist-utils";

function SearchGists() {
  const client = getGitHubClient();
  const [tag, setTag] = useState<GithubGistTag>(GithubGistTag.MY_GISTS);
  const [gistId, setGistId] = useState<string>("");
  // Use useCachedState for showDetail with a persistent cache
  const [showDetail, setShowDetail] = useCachedState<boolean>("pref-show-detail", false);

  const { data: frontmostAppData } = useFrontmostApp();

  const {
    data: gistsData,
    isLoading: gistsLoading,
    mutate: gistMutate,
    pagination,
  } = useCachedPromise(
    (t: string) => async (options) => {
      const data = await client.requestGist(t, options.page + 1, parseInt(perPage));
      const hasMore = data[data.length - 1] != options.lastItem && options.page < 50;
      return { data, hasMore };
    },
    [tag],
    { keepPreviousData: true, failureToastOptions: { title: "Failed to load gists" } },
  );

  const { data: gistContentData, isLoading: gistContentLoading } = useCachedPromise(
    (rawUrl: string) => {
      return client.octokit.request(`${rawUrl}`).then((response) => {
        return response.data;
      }) as Promise<string>;
    },
    [gistId],
    { failureToastOptions: { title: "Failed to load gist content" } },
  );

  const frontmostApp = useMemo(() => {
    return frontmostAppData as Application;
  }, [frontmostAppData]);

  const gists = useMemo(() => {
    if (!gistsData) {
      return [];
    }
    return gistsData;
  }, [gistsData]);

  const gistContent = useMemo(() => {
    if (!gistContentData) {
      return "";
    }
    return gistContentData.toString();
  }, [gistContentData]);

  // Toggle function for show detail
  const toggleShowDetail = () => {
    setShowDetail(!showDetail);
  };

  return (
    <List
      isShowingDetail={showDetail}
      isLoading={gistsLoading}
      pagination={pagination}
      searchBarPlaceholder={"Search gists"}
      onSelectionChange={(id) => {
        if (id) {
          const { url } = JSON.parse(id);
          setGistId(url);
        }
      }}
      searchBarAccessory={
        <List.Dropdown
          tooltip="GitHub Gist"
          storeValue={rememberTag}
          onChange={(newValue) => {
            setTag(newValue as GithubGistTag);
          }}
        >
          {[
            ...githubGistTags.filter((tag) => tag.value === defaultGistTag),
            ...githubGistTags.filter((tag) => tag.value !== defaultGistTag),
          ].map((tag) => {
            return <List.Dropdown.Item key={tag.title} title={tag.title} value={tag.value} icon={tag.icon} />;
          })}
        </List.Dropdown>
      }
    >
      <List.EmptyView title={"No Gists"} icon={Icon.CodeBlock} />
      {gists?.map((gist, gistIndex) => {
        return (
          <List.Section key={"gist" + gistIndex + gist.gist_id} title={gist.description}>
            {gist.file.map((gistFile, gistFileIndex, gistFileArray) => {
              return (
                <List.Item
                  id={JSON.stringify({
                    gistIndex: gistIndex,
                    gistFileIndex: gistFileIndex,
                    url: gistFileArray[gistFileIndex].raw_url,
                    gistId: gist.gist_id,
                  })}
                  keywords={[gist.description]}
                  key={"gistFile" + gistIndex + gistFileIndex}
                  icon={getIconType(gistFile)}
                  title={{
                    value: gistFile?.filename,
                    tooltip: `${gistFile?.filename}
Size: ${gistFile.size}`,
                  }}
                  detail={
                    <List.Item.Detail
                      isLoading={gistContentLoading}
                      markdown={formatGistContentDetail(gistFile, gistContent)}
                    />
                  }
                  actions={
                    <ActionPanel>
                      <GistAction
                        gist={gist}
                        gistFileName={gistFile.filename}
                        gistFileContent={gistContent}
                        tag={tag}
                        gistMutate={gistMutate}
                        frontmostApp={frontmostApp}
                      />

                      <ActionSettings onDetail={toggleShowDetail} showDetail={showDetail} />
                    </ActionPanel>
                  }
                />
              );
            })}
          </List.Section>
        );
      })}
    </List>
  );
}

export default withGitHubClient(SearchGists);
