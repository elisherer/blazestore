class FirestorePath {
  constructor(pathname) {
    this.pathname = pathname;
    this.parts = pathname.split("/").filter(Boolean).slice(3);
  }

  static FromPath(pathname) {
    return new FirestorePath(pathname);
  }
}

export default FirestorePath;
