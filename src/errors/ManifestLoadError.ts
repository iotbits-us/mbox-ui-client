export class ManifestLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ManifestLoadError";
  }
}
