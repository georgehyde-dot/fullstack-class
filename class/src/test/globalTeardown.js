export default async function globalTeardown() {
  await global.__MONGOINSTNACE.stop();
}
