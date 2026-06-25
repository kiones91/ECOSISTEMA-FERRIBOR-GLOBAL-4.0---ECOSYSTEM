export function useGuidedOnboarding() {
  return {
    shouldShow: false,
    checked: true,
    markCompleted: () => {},
    markSkipped: () => {},
  };
}
