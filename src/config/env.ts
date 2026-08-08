const rawBasePath = import.meta.env.VITE_BASE_PATH ?? '/'

export const appConfig = {
  basePath: rawBasePath.endsWith('/') ? rawBasePath : `${rawBasePath}/`,
  appName: 'Slovakia Travel Companion',
  tripLabel: 'Slovakia & Poland 2026',
}
