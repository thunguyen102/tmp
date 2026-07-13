import path from "node:path";

/** Saved Miraiz login session, reused across runs by fixtures/role.fixture.ts. */
export const MIRAIZ_STORAGE_STATE_PATH = path.resolve(
  process.cwd(),
  process.env.MIRAIZ_STORAGE_STATE ?? ".auth/miraiz-storage-state.json",
);
