import { useAppSelector } from "./useRedux";

/**
 * Returns the display name for a user.
 * Priority: device contact name → LinksChat profile name
 */
export function useContactName(
  userId?: string,
  phone?: string,
  fallbackName?: string
): { displayName: string; isContact: boolean } {
  const contactMap = useAppSelector((s) => s.contacts.phoneToName);

  if (!phone && !userId) {
    return { displayName: fallbackName || "Unknown", isContact: false };
  }

  const normalize = (p: string) => p.replace(/\D/g, "");

  if (phone) {
    const suffix = normalize(phone).slice(-9);
    const contactName = contactMap[suffix];
    if (contactName) {
      return { displayName: contactName, isContact: true };
    }
  }

  return { displayName: fallbackName || "Unknown", isContact: false };
}

/**
 * Returns a resolver function — useful inside loops like FlatList
 * where you can't call hooks conditionally
 */
export function useContactNameResolver() {
  const contactMap = useAppSelector((s) => s.contacts.phoneToName);

  const resolve = (
    phone?: string,
    fallbackName?: string
  ): { displayName: string; isContact: boolean } => {
    if (!phone)
      return { displayName: fallbackName || "Unknown", isContact: false };
    const normalize = (p: string) => p.replace(/\D/g, "");
    const suffix = normalize(phone).slice(-9);
    const contactName = contactMap[suffix];

    return contactName
      ? { displayName: contactName, isContact: true }
      : { displayName: phone, isContact: false };
    // : { displayName: fallbackName || "Unknown", isContact: false };
  };

  return resolve;
}
