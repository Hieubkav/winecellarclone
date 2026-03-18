declare module "vite" {
  export interface ConfigEnv {
    mode: string;
    command: "build" | "serve";
  }

  export type UserConfig = Record<string, unknown>;

  export function defineConfig(config: (env: ConfigEnv) => UserConfig): UserConfig;
  export function loadEnv(mode: string, envDir: string, prefixes?: string | string[]): Record<string, string>;
}

declare module "@vitejs/plugin-react" {
  const react: () => unknown;
  export default react;
}
