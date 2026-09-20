import { useCallback, useState } from "react";
import { getLocales } from "expo-localization";
import * as Contacts from "expo-contacts";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useToast } from "../context/ToastContext";
import { useAppSelector } from "./useRedux";
import { contactsSyncApi } from "../services/api";
import { User } from "../types";

export interface MatchedContact extends User {
  phoneName: string;
}

interface UseContactSyncResult {
  matchedContacts: MatchedContact[];
  totalPhoneContacts: number;
  syncing: boolean;
  syncContacts: () => Promise<void>;
}

export function useContactSync(): UseContactSyncResult {
  const toast = useToast();
  const { user: owner } = useAppSelector((s) => s.auth);

  const [matchedContacts, setMatchedContacts] = useState<MatchedContact[]>([]);
  const [totalPhoneContacts, setTotalPhoneContacts] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const syncContacts = useCallback(async () => {
    setSyncing(true);
    const syncId = toast.loading("Syncing contacts...");
    try {
      const locales = getLocales();

      const deviceCountry =
        locales.length > 0 && locales[0].regionCode
          ? locales[0].regionCode
          : "";
      const { data: phoneContacts } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });
      const ownerCountry = owner?.phone
        ? parsePhoneNumberFromString(owner.phone)?.country
        : deviceCountry;

      setTotalPhoneContacts(phoneContacts.length);

      const phoneToName: Record<string, string> = {};
      const allNumbers: string[] = [];

      for (const contact of phoneContacts) {
        if (!contact.name || !contact.phoneNumbers?.length) continue;
        for (const pn of contact.phoneNumbers) {
          if (pn.number) {
            const num = pn.number.replace(/[\s\-().]/g, "");
            allNumbers.push(num);
            phoneToName[num] = contact.name;
          }
        }
      }

      if (allNumbers.length === 0) {
        toast.dismiss(syncId!);
        toast.info(
          "No phone numbers found",
          "Your contacts have no phone numbers stored"
        );
        setSyncing(false);
        return;
      }

      const chunkSize = 500;
      const allMatched: MatchedContact[] = [];

      for (let i = 0; i < allNumbers.length; i += chunkSize) {
        const chunk = allNumbers.slice(i, i + chunkSize);
        const res = await contactsSyncApi.sync(
          chunk,
          ownerCountry || deviceCountry
        );
        if (res.success) {
          const mapped: MatchedContact[] = res.data.users.map((u) => {
            const matchedNum = allNumbers.find((n) => {
              const userPhone = (u.phone || "").replace(/[\s\-().]/g, "");
              return (
                userPhone.endsWith(n.slice(-9)) ||
                n.endsWith(userPhone.slice(-9))
              );
            });
            const phoneName = matchedNum
              ? phoneToName[matchedNum] || u.name
              : u.name;
            return { ...u, phoneName };
          });
          allMatched.push(...mapped);
        }
      }

      const seen = new Set<string>();
      const unique = allMatched.filter((c) => {
        if (seen.has(c._id)) return false;
        seen.add(c._id);
        return true;
      });

      unique.sort((a, b) => {
        if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

      setMatchedContacts(unique);
      toast.dismiss(syncId!);

      if (unique.length > 0) {
        toast.success(
          `${unique.length} friend${
            unique.length !== 1 ? "s" : ""
          } on LinksChat`,
          `Out of ${phoneContacts.length} contacts`
        );
      } else {
        toast.info(
          "No matches found",
          `None of your ${phoneContacts.length} contacts are on LinksChat yet`
        );
      }
    } catch (err) {
      toast.dismiss(syncId!);
      toast.error("Sync failed", "Could not load contacts. Please try again.");
    } finally {
      setSyncing(false);
    }
  }, [toast, owner]);

  return { matchedContacts, totalPhoneContacts, syncing, syncContacts };
}
