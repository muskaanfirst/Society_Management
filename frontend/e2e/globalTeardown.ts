import { cleanupAllTestData, closePool } from "../tests/helpers/testDb";

export default async function globalTeardown() {
  await cleanupAllTestData();
  await closePool();
}
