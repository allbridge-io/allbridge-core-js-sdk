interface PaginatedResults<Data> {
  data: Data[];
  hasNextPage: boolean;
  nextCursor?: string | null;
}

export async function fetchAllPagesRecursive<Data, Result extends PaginatedResults<Data>>(
  fetchFunction: (cursor?: string | null) => Promise<Result>,
  cursor?: string | null,
  accumulatedData: Data[] = []
): Promise<Data[]> {
  const result = await fetchFunction(cursor);
  const newAccumulatedData = accumulatedData.concat(result.data);

  if (result.hasNextPage && result.nextCursor) {
    return fetchAllPagesRecursive(fetchFunction, result.nextCursor, newAccumulatedData);
  } else {
    return newAccumulatedData;
  }
}
