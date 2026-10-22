interface PaginatedResults<Data> {
  objects: Data[];
  hasNextPage: boolean;
  cursor?: string | null;
}

export async function fetchAllPagesRecursive<Data, Result extends PaginatedResults<Data>>(
  fetchFunction: (cursor?: string | null) => Promise<Result>,
  cursor?: string | null,
  accumulatedData: Data[] = []
): Promise<Data[]> {
  const result = await fetchFunction(cursor);
  const newAccumulatedData = accumulatedData.concat(result.objects);

  if (result.hasNextPage && result.cursor) {
    return fetchAllPagesRecursive(fetchFunction, result.cursor, newAccumulatedData);
  } else {
    return newAccumulatedData;
  }
}
