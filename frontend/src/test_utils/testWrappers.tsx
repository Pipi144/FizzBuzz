import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const createReactQueryWrapper = (instance: QueryClient) => {
  const ReactQueryWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={instance}>{children}</QueryClientProvider>
  );

  ReactQueryWrapper.displayName = "ReactQueryWrapper";
  return ReactQueryWrapper;
};
