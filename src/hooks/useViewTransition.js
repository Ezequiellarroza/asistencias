export const useViewTransition = () => {
  const navigate = (callback) => {
    if (!document.startViewTransition) {
      callback();
      return;
    }

    document.startViewTransition(() => {
      callback();
    });
  };

  return { navigate };
};