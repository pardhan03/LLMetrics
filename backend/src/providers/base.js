export class BaseProvider {
  async chat(messages, model) {
    throw new Error("chat() not implemented");
  }

  async stream(messages, model, onChunk, signal) {
    throw new Error("stream() not implemented");
  }

  listModels() {
    return [];
  }
}