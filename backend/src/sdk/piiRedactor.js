export class PiiRedactor {
  static redact(text = "") {
    let result = text;

    // EMAILS
    result = result.replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      "[EMAIL]"
    );

    // PHONE
    result = result.replace(
      /(\+?1?\s?)?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/g,
      "[PHONE]"
    );

    // CREDIT CARD
    result = result.replace(
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
      "[CARD]"
    );

    // SSN
    result = result.replace(
      /\b\d{3}-\d{2}-\d{4}\b/g,
      "[SSN]"
    );

    // OPENAI / GOOGLE KEYS
    result = result.replace(
      /\b(sk-[a-zA-Z0-9]{20,}|AIza[a-zA-Z0-9_-]{35})\b/g,
      "[API_KEY]"
    );

    return result;
  }

  static preview(text = "", length = 200) {
    return this.redact(text).slice(0, length);
  }
}