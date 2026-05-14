import { redirect } from "next/navigation";

type FilterRedirectSearchParams = Record<string, string | string[] | undefined>;

const buildRedirectPath = (params: FilterRedirectSearchParams) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, item));
      return;
    }

    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `/san-pham?${query}` : "/san-pham";
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<FilterRedirectSearchParams>;
}) {
  redirect(buildRedirectPath(await searchParams));
}
