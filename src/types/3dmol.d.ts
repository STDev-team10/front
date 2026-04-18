interface $3DmolViewer {
  addModel(data: string, format: string): void;
  setStyle(sel: object, style: object): void;
  zoomTo(): void;
  spin(axis: string, speed?: number): void;
  render(): void;
  clear(): void;
  removeAllModels(): void;
}

interface Window {
  $3Dmol: {
    createViewer(
      element: HTMLElement,
      config?: { backgroundColor?: string; antialias?: boolean },
    ): $3DmolViewer;
  };
}
