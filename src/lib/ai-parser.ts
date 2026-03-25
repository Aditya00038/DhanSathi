import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIParsedTransaction } from './types'; // Switched to the correct type

const MODEL_NAME = "gemini-1.5-flash";
const TRANSACTION_KEYWORDS_REGEX = /(debited|credited|spent|received|withdrawn|deposited|sent|paid|transferred|transfer)/i;
const INCOME_KEYWORDS_REGEX = /(salary|sal\s*credit|refund|cashback|reversal)/i;
const BANK_NAME_REGEX = /\b(?:sbi|state\s*bank|hdfc|icici|axis|kotak|yes\s*bank|pnb|indusind|canara|bob|bank\s*of\s*baroda|idfc|federal\s*bank|union\s*bank)\b/i;
const FAILED_TXN_REGEX = /\b(?:declined|failed|failure|unsuccessful)\b/i;

const BRAND_CATEGORY_RULES: Array<{ pattern: RegExp; brand: string; category: string }> = [
  { pattern: /swiggy|zomato|kfc|dominos|pizza\s*hut/i, brand: "Food", category: "Food" },
  { pattern: /amazon|flipkart|myntra|ajio|meesho|bigbasket/i, brand: "Shopping", category: "Shopping" },
  { pattern: /uber|ola|irctc|makemytrip|redbus|rapido|fastag|toll/i, brand: "Travel", category: "Travel" },
  { pattern: /\bunstop\b/i, brand: "Unstop", category: "Competition/Hackathon" },
  { pattern: /\bdevfolio\b/i, brand: "Devfolio", category: "Competition/Hackathon" },
  { pattern: /jio|reliance\s*jio|myjio/i, brand: "Jio", category: "Bills" },
  { pattern: /airtel|bharti\s*airtel/i, brand: "Airtel", category: "Bills" },
  { pattern: /vodafone|idea|\bvi\b/i, brand: "VI", category: "Bills" },
  { pattern: /bsnl/i, brand: "BSNL", category: "Bills" },
  { pattern: /electricity|recharge|dth|postpaid|prepaid|water\s*bill|gas\s*bill/i, brand: "Bills", category: "Bills" },
  { pattern: /phonepe|paytm|gpay|google\s*pay|amazon\s*pay|mobikwik|upi/i, brand: "Payments", category: "Payments" },
  { pattern: /netflix|spotify|prime\s*video|youtube\s*premium|hotstar/i, brand: "Subscription", category: "Subscription" },
  { pattern: /salary|refund|cashback|reversal/i, brand: "Income", category: "Income" },
  { pattern: /atm\s*fee|maintenance\s*charge|sms\s*charge|charge\b|charges\b/i, brand: "Charges", category: "Charges" },
  { pattern: /atm\s*withdrawal|cash\s*withdrawal|cash\s*wdl|cash\s*wdr/i, brand: "ATM Withdrawal", category: "Cash" },
];

const NON_PERSON_TOKENS = new Set([
  "upi", "paytm", "phonepe", "gpay", "googlepay", "amazonpay", "mobikwik", "bank", "ltd", "limited", "pvt", "private",
  "store", "mart", "supermarket", "services", "service", "retail", "enterprises", "solutions", "online", "india", "inr",
  "jio", "airtel", "vi", "bsnl", "amazon", "flipkart", "swiggy", "zomato", "uber", "ola", "recharge", "scan", "scanner", "bigbasket",
  "sbi", "hdfc", "icici", "axis", "kotak", "pnb", "bank"
]);

function resolveGeminiApiKey(): string {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    ""
  );
}

// Strict parser prompt for Indian financial SMS.
const promptTemplate = `
You are an advanced financial SMS parser designed for Indian banking messages.
Your job is to extract structured transaction data with HIGH accuracy.

**Instructions:**
1. For each transaction, extract: amount, date, merchant, category, type.
2. Merchant detection priority:
  - If "to <name>" -> merchant is that name.
  - If "at <name>" -> merchant is that name.
  - If "for <brand> purchase" -> merchant is that brand.
  - If "from <name>" in credit -> merchant is sender.
  - If "via UPI to <name>" or "paid to <name>" -> merchant is that name.
3. Ignore bank names and generic tokens as merchant (SBI, HDFC, ICICI, Axis, A/c, balance, txn, alert).
4. Category must be one of: Food, Shopping, Travel, Bills, Payments, Person Transfer, Income, Subscription, Charges, Cash, Others.
5. Type detection:
  - debited/spent/paid -> debit
  - credited/received/refund/reversed -> credit
6. If declined/failed transaction, ignore it.
7. Date formats to normalize: 27-Mar-26, 27/03/26, 27-03-2026, 03Jul25.
8. Output must be STRICT JSON array only with keys amount, date, merchant, category, type.

**Input Text:**
{SMS_TEXT}

If no transactions are found, you MUST return an empty array: [].
`;

function parseFlexibleDate(input: string): string | undefined {
  const raw = input.trim();
  const compact = raw.replace(/\s+/g, "");

  const ddMonDashYear = raw.match(/^(\d{1,2})[-\s]([A-Za-z]{3})[-\s](\d{2}|\d{4})$/);
  if (ddMonDashYear) {
    const day = ddMonDashYear[1].padStart(2, "0");
    const mon = ddMonDashYear[2].toLowerCase();
    const yy = ddMonDashYear[3];
    const months: Record<string, string> = {
      jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
      jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
    };
    const month = months[mon];
    if (!month) return undefined;
    const year = yy.length === 2 ? `20${yy}` : yy;
    return `${year}-${month}-${day}`;
  }

  const ddMonYear = compact.match(/^(\d{1,2})([A-Za-z]{3})(\d{2}|\d{4})$/);
  if (ddMonYear) {
    const day = ddMonYear[1].padStart(2, "0");
    const mon = ddMonYear[2].toLowerCase();
    const yy = ddMonYear[3];
    const months: Record<string, string> = {
      jan: "01",
      feb: "02",
      mar: "03",
      apr: "04",
      may: "05",
      jun: "06",
      jul: "07",
      aug: "08",
      sep: "09",
      oct: "10",
      nov: "11",
      dec: "12",
    };
    const month = months[mon];
    if (!month) return undefined;
    const year = yy.length === 2 ? `20${yy}` : yy;
    return `${year}-${month}-${day}`;
  }

  const slashOrDash = compact.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2}|\d{4})$/);
  if (slashOrDash) {
    const day = slashOrDash[1].padStart(2, "0");
    const month = slashOrDash[2].padStart(2, "0");
    const yy = slashOrDash[3];
    const year = yy.length === 2 ? `20${yy}` : yy;
    return `${year}-${month}-${day}`;
  }

  const dt = new Date(raw);
  if (!Number.isNaN(dt.getTime())) {
    return dt.toISOString().slice(0, 10);
  }

  return undefined;
}

function normalizeType(value: unknown): "debit" | "credit" | undefined {
  if (typeof value !== "string") return undefined;
  const lowered = value.toLowerCase();
  if (lowered.includes("debit")) return "debit";
  if (lowered.includes("credit")) return "credit";
  return undefined;
}

function titleCase(input: string): string {
  return input
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function cleanMerchantToken(raw: string): string {
  return raw
    .replace(/[@._-]?\d{2,}$/g, "")
    .replace(/\b(?:via|upi|ref|no|txn|txnid|call|if|not|you|on|from|ac|a\/c)\b.*$/i, "")
    .replace(/[^A-Za-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isBankName(raw: string): boolean {
  return BANK_NAME_REGEX.test(raw);
}

function isLikelyPersonName(raw: string): boolean {
  const cleaned = cleanMerchantToken(raw).replace(/\d+/g, "").trim();
  if (!cleaned) return false;

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0 || words.length > 3) return false;
  if (words.some((w) => w.length < 2 || w.length > 16)) return false;
  if (words.some((w) => !/^[A-Za-z]+$/.test(w))) return false;

  const loweredWords = words.map((w) => w.toLowerCase());
  if (loweredWords.some((w) => NON_PERSON_TOKENS.has(w))) return false;

  const joined = loweredWords.join(" ");
  for (const rule of BRAND_CATEGORY_RULES) {
    if (rule.pattern.test(joined)) return false;
  }

  return true;
}

function toMerchantLabel(rawMerchant: string | undefined): string | undefined {
  if (!rawMerchant) return undefined;
  const cleaned = cleanMerchantToken(rawMerchant);
  if (!cleaned) return undefined;
  if (isBankName(cleaned)) return undefined;

  for (const rule of BRAND_CATEGORY_RULES) {
    if (rule.pattern.test(cleaned)) {
      return `${rule.brand} (${rule.category})`;
    }
  }

  const generic = titleCase(cleaned.split(" ").slice(0, 2).join(" "));
  return `${generic} (Others)`;
}

function toMerchantLabelWithType(rawMerchant: string | undefined, type: "debit" | "credit" | undefined, contextText?: string): string | undefined {
  const context = (contextText || "").toLowerCase();
  if (/self\s*transfer/.test(context)) {
    const fallbackName = rawMerchant ? titleCase(cleanMerchantToken(rawMerchant)) : "Self Transfer";
    return `${fallbackName} (Others)`;
  }

  if (/atm\s*withdrawal|cash\s*withdrawal|cash\s*wdl|cash\s*wdr/.test(context)) {
    return "ATM Withdrawal (Cash)";
  }

  if (/atm\s*fee|maintenance\s*charge|sms\s*charge|charge\b|charges\b/.test(context)) {
    return "Bank Charges (Charges)";
  }

  if (INCOME_KEYWORDS_REGEX.test(context) || INCOME_KEYWORDS_REGEX.test(rawMerchant || "")) {
    const kind = /salary/i.test(`${rawMerchant || ""} ${contextText || ""}`) ? "Salary" : "Refund";
    return `${kind} (Income)`;
  }

  if (!rawMerchant) return undefined;
  if (isBankName(rawMerchant)) return undefined;

  if (isLikelyPersonName(rawMerchant)) {
    const person = titleCase(cleanMerchantToken(rawMerchant));
    return `${person} (Person Transfer)`;
  }

  return toMerchantLabel(rawMerchant);
}

function normalizeTransactions(payload: unknown): AIParsedTransaction[] {
  if (!Array.isArray(payload)) return [];

  return payload
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const candidate = item as Record<string, unknown>;

      const amountRaw = candidate.amount;
      const amount =
        typeof amountRaw === "number"
          ? amountRaw
          : typeof amountRaw === "string"
            ? Number(amountRaw.replace(/,/g, ""))
            : undefined;

      const type = normalizeType(candidate.type);
      const categoryRaw = typeof candidate.category === "string" ? candidate.category.trim() : "";
      let merchant = typeof candidate.merchant === "string"
        ? toMerchantLabelWithType(candidate.merchant.trim(), type)
        : undefined;

      if (merchant && categoryRaw) {
        const current = merchant.match(/^(.*?)\s*\((.*?)\)\s*$/);
        const base = current?.[1]?.trim() || merchant;
        const normalizedCategory = categoryRaw.length > 0 ? titleCase(categoryRaw) : current?.[2] || "Others";
        merchant = `${base} (${normalizedCategory})`;
      }
      const parsedDate =
        typeof candidate.date === "string" ? parseFlexibleDate(candidate.date) : undefined;

      const normalized: AIParsedTransaction = {
        amount: Number.isFinite(amount as number) ? (amount as number) : undefined,
        merchant: merchant || undefined,
        date: parsedDate,
        type,
      };

      if (!normalized.amount && !normalized.merchant && !normalized.date && !normalized.type) {
        return null;
      }

      return normalized;
    })
    .filter((t): t is AIParsedTransaction => t !== null);
}

function dedupeTransactions(items: AIParsedTransaction[]): AIParsedTransaction[] {
  const seen = new Set<string>();
  const output: AIParsedTransaction[] = [];

  for (const tx of items) {
    const key = `${tx.amount ?? ""}|${tx.date ?? ""}|${(tx.merchant ?? "").toLowerCase()}|${tx.type ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(tx);
  }

  return output;
}

function splitIntoTransactionChunks(sms: string): string[] {
  const text = sms.replace(/\s+/g, " ").trim();
  if (!text) return [];

  const startPattern = /(?:INR|Rs\.?|₹)\s*[0-9,]+(?:\.\d{1,2})?\s*(?:debited|credited|spent|received|withdrawn|deposited|sent|paid|transferred|transfer)\b|(?:sent|paid|transferred|transfer)\s+(?:INR|Rs\.?|₹)\s*[0-9,]+(?:\.\d{1,2})?/gi;
  const starts: number[] = [];

  let match: RegExpExecArray | null;
  while ((match = startPattern.exec(text)) !== null) {
    starts.push(match.index);
  }

  if (starts.length === 0) {
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  const chunks: string[] = [];
  for (let i = 0; i < starts.length; i += 1) {
    const begin = starts[i];
    const end = i + 1 < starts.length ? starts[i + 1] : text.length;
    const part = text.slice(begin, end).trim();
    if (part) chunks.push(part);
  }

  return chunks;
}

function extractTransactionFromChunk(chunk: string): AIParsedTransaction | null {
  const lowered = chunk.toLowerCase();
  if (FAILED_TXN_REGEX.test(lowered)) return null;
  if (!TRANSACTION_KEYWORDS_REGEX.test(lowered)) {
    return null;
  }

  const amountMatch = chunk.match(/(?:INR|Rs\.?|₹)\s*([0-9,]+(?:\.\d{1,2})?)/i) || chunk.match(/\b([0-9,]+(?:\.\d{1,2})?)\b/);
  const amount = amountMatch ? Number(amountMatch[1].replace(/,/g, "")) : undefined;

  const dateMatch = chunk.match(/\b(\d{1,2}[A-Za-z]{3}\d{2,4}|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})\b/);
  const date = dateMatch ? parseFlexibleDate(dateMatch[1]) : undefined;

  // Keep user's perspective: debited + credited in same line is still debit.
  const type: "debit" | "credit" | undefined =
    /(debited|spent|withdrawn|sent|paid|transferred|transfer)/.test(lowered) ? "debit" :
    /(credited|received|deposited|reversed|refund)/.test(lowered) ? "credit" :
    undefined;

  const inferredType = INCOME_KEYWORDS_REGEX.test(lowered) ? "credit" : type;

  const forPurchaseMerchant = chunk.match(/\bfor\s+([A-Za-z][A-Za-z0-9& ._-]{1,40}?)\s+purchase\b/i)?.[1]?.trim();
  const paidToMerchant = chunk.match(/\bpaid\s+to\s+([^\s]+(?:\s+[^\s]+){0,4}?)(?=\s+(?:via|on|ref|call|if|not|from|by)\b|$)/i)?.[1];
  const upiToMerchant = chunk.match(/\bvia\s+upi\s+to\s+([^\s]+(?:\s+[^\s]+){0,4}?)(?=\s+(?:on|ref|call|if|not|from|by)\b|$)/i)?.[1];
  const toMerchant = chunk.match(/\bto\s+([^\s]+(?:\s+[^\s]+){0,4}?)(?=\s+(?:via|on|ref|call|if|not|from|by)\b|$)/i)?.[1];
  const atMerchant = chunk.match(/\bat\s+([^\s]+(?:\s+[^\s]+){0,4}?)(?=\s+(?:via|on|ref|call|if|not|from|by)\b|$)/i)?.[1];
  const fromMerchant = chunk.match(/\bfrom\s+([^\s]+(?:\s+[^\s]+){0,4}?)(?=\s+(?:via|on|ref|call|if|not|to|by)\b|$)/i)?.[1];

  let merchantRaw: string | undefined;
  if (inferredType === "debit") {
    merchantRaw = upiToMerchant || paidToMerchant || toMerchant || atMerchant || forPurchaseMerchant || fromMerchant;
  } else {
    merchantRaw = fromMerchant || upiToMerchant || paidToMerchant || toMerchant || atMerchant || forPurchaseMerchant;
  }
  const merchant = toMerchantLabelWithType(merchantRaw, inferredType, chunk);

  if (!amount && !merchant && !date && !inferredType) {
    return null;
  }

  return { amount, merchant, date, type: inferredType };
}

function extractWithRegexFallback(sms: string): AIParsedTransaction[] {
  const results: AIParsedTransaction[] = [];

  const chunks = splitIntoTransactionChunks(sms);
  for (const chunk of chunks) {
    const tx = extractTransactionFromChunk(chunk);
    if (tx) results.push(tx);
  }

  return dedupeTransactions(results);
}

export async function extractTransactionsFromSms(sms: string): Promise<AIParsedTransaction[]> {
  const apiKey = resolveGeminiApiKey();

  if (!apiKey) {
    console.warn("No Gemini API key found (checked GEMINI_API_KEY, GOOGLE_GENAI_API_KEY, GOOGLE_API_KEY). Falling back to regex parser.");
    return extractWithRegexFallback(sms);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = promptTemplate.replace("{SMS_TEXT}", sms);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Raw AI Response:", text);

    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```|(\[[\s\S]*\])/i);

    if (jsonMatch) {
      const jsonString = (jsonMatch[1] || jsonMatch[2] || "").trim();
      if (jsonString) {
        try {
          const parsed = JSON.parse(jsonString);
          const normalized = normalizeTransactions(parsed);
          const fallback = extractWithRegexFallback(sms);
          return dedupeTransactions([...normalized, ...fallback]);
        } catch (e) {
          console.error("Failed to parse extracted JSON:", e, "\nJSON String that failed:", jsonString);
          return extractWithRegexFallback(sms);
        }
      }
    }
    
    console.warn("No valid JSON array found in AI response. Falling back to regex parser.");
    return extractWithRegexFallback(sms);

  } catch (error) {
    console.error(
      "Error during Gemini content generation. Falling back to regex parser.",
      error
    );
    return extractWithRegexFallback(sms);
  }
}
